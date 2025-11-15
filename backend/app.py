from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__, instance_path=os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance')))
os.makedirs(app.instance_path, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'bookify.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

# Database Models
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    author = db.Column(db.String(200), nullable=False, index=True)
    isbn = db.Column(db.String(20), unique=True, index=True)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(500))
    genre = db.Column(db.String(100))
    publication_year = db.Column(db.Integer)
    rating = db.Column(db.Float, default=0.0)
    
    reviews = db.relationship('Review', backref='book', lazy=True, cascade='all, delete-orphan')
    journal_entries = db.relationship('JournalEntry', backref='book', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'description': self.description,
            'cover_image': self.cover_image,
            'genre': self.genre,
            'publication_year': self.publication_year,
            'rating': round(self.rating, 1),
            'review_count': len(self.reviews)
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    reviewer_name = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'reviewer_name': self.reviewer_name,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    user_notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='reading')  # reading, completed, want-to-read
    rating = db.Column(db.Integer)  # 1-5
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'book_title': self.book.title,
            'user_notes': self.user_notes,
            'status': self.status,
            'rating': self.rating,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Routes
@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books with optional filtering"""
    search = request.args.get('search', '').lower()
    genre = request.args.get('genre')
    page = request.args.get('page', 1, type=int)
    per_page = 15
    
    query = Book.query
    
    if search:
        query = query.filter(
            (Book.title.ilike(f'%{search}%')) |
            (Book.author.ilike(f'%{search}%')) |
            (Book.isbn.ilike(f'%{search}%'))
        )
    
    if genre:
        query = query.filter(Book.genre.ilike(f'%{genre}%'))
    
    pagination = query.paginate(page=page, per_page=per_page)
    books = [book.to_dict() for book in pagination.items]
    
    return jsonify({
        'books': books,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get a single book with its reviews"""
    book = Book.query.get_or_404(book_id)
    book_data = book.to_dict()
    book_data['reviews'] = [review.to_dict() for review in book.reviews]
    return jsonify(book_data)

@app.route('/api/books', methods=['POST'])
def create_book():
    """Create a new book"""
    data = request.get_json()
    
    book = Book(
        title=data.get('title'),
        author=data.get('author'),
        isbn=data.get('isbn'),
        description=data.get('description'),
        cover_image=data.get('cover_image'),
        genre=data.get('genre'),
        publication_year=data.get('publication_year')
    )
    
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201

@app.route('/api/reviews', methods=['POST'])
def create_review():
    """Create a new review"""
    data = request.get_json()
    
    book = Book.query.get_or_404(data.get('book_id'))
    
    review = Review(
        book_id=data.get('book_id'),
        reviewer_name=data.get('reviewer_name'),
        rating=data.get('rating'),
        comment=data.get('comment')
    )
    
    db.session.add(review)
    db.session.commit()
    
    # Update book rating
    update_book_rating(book.id)
    
    return jsonify(review.to_dict()), 201

@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    """Delete a review"""
    review = Review.query.get_or_404(review_id)
    book_id = review.book_id
    db.session.delete(review)
    db.session.commit()
    update_book_rating(book_id)
    return '', 204

@app.route('/api/journal', methods=['GET'])
def get_journal_entries():
    """Get all journal entries"""
    status = request.args.get('status')
    query = JournalEntry.query
    
    if status:
        query = query.filter_by(status=status)
    
    entries = [entry.to_dict() for entry in query.all()]
    return jsonify(entries)

@app.route('/api/journal', methods=['POST'])
def create_journal_entry():
    """Create a new journal entry"""
    data = request.get_json()
    
    # Check if entry already exists for this book
    existing = JournalEntry.query.filter_by(book_id=data.get('book_id')).first()
    if existing:
        return jsonify({'error': 'Entry already exists for this book'}), 400
    
    entry = JournalEntry(
        book_id=data.get('book_id'),
        user_notes=data.get('user_notes'),
        status=data.get('status', 'want-to-read'),
        rating=data.get('rating')
    )
    
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201

@app.route('/api/journal/<int:entry_id>', methods=['PUT'])
def update_journal_entry(entry_id):
    """Update a journal entry"""
    entry = JournalEntry.query.get_or_404(entry_id)
    data = request.get_json()
    
    if 'user_notes' in data:
        entry.user_notes = data['user_notes']
    if 'status' in data:
        entry.status = data['status']
    if 'rating' in data:
        entry.rating = data['rating']
    
    entry.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(entry.to_dict())

@app.route('/api/journal/<int:entry_id>', methods=['DELETE'])
def delete_journal_entry(entry_id):
    """Delete a journal entry"""
    entry = JournalEntry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return '', 204

@app.route('/api/genres', methods=['GET'])
def get_genres():
    """Get all unique genres"""
    genres = db.session.query(Book.genre).distinct().filter(Book.genre.isnot(None)).all()
    return jsonify([g[0] for g in genres if g[0]])

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

def update_book_rating(book_id):
    """Update a book's average rating based on reviews"""
    book = Book.query.get(book_id)
    if book and book.reviews:
        avg_rating = sum(r.rating for r in book.reviews) / len(book.reviews)
        book.rating = avg_rating
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=False, port=5001, host='127.0.0.1')
