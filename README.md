# 📚 Bookify

> Discover, review, and track your reading journey. A beautiful, modern book discovery platform inspired by Goodreads and Fable.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

## ✨ Features

- **🔍 Smart Search** - Find books by title, author, or ISBN instantly
- **⭐ Community Reviews** - Read authentic reviews from readers and write your own with star ratings
- **📔 Reading Shelf** - Track your books across "Want to Read", "Currently Reading", and "Completed" statuses
- **💬 Personal Notes** - Add notes and ratings to your reads
- **🎨 Beautiful UI** - Modern, responsive design inspired by industry leaders
- **⚡ Real-time Updates** - Instant feedback on all interactions
- **🔄 Smart Pagination** - Effortless browsing through large book collections

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Modern web browser

### Installation & Running

#### Option 1: Automated Setup (Recommended)
```bash
cd /Users/kanishkadas/Desktop/sem1proj
chmod +x start.sh
./start.sh
```

Then open your browser to **http://localhost:8001**

#### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd /Users/kanishkadas/Desktop/sem1proj/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_db.py
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/kanishkadas/Desktop/sem1proj
python3 -m http.server 8001
```

Open browser to **http://localhost:8001**

## 📁 Project Structure

```
bookify/
├── index.html              # Main app interface
├── app.js                  # Frontend logic with Axios API calls
├── style.css               # Additional custom styles
├── README.md               # This file
├── start.sh                # Startup script
├── start.bat               # Windows startup script
│
└── backend/
    ├── app.py              # Flask API server
    ├── requirements.txt    # Python dependencies
    ├── seed_db.py          # Database initialization
    ├── venv/               # Python virtual environment
    └── instance/
        └── bookify.db      # SQLite database (auto-created)
```

## 🔌 API Endpoints

All endpoints return JSON responses.

### Books
```
GET    /api/books                    # List books (with pagination, search, filters)
GET    /api/books/<id>               # Get single book with reviews
GET    /api/genres                   # Get all available genres
```

### Reviews
```
POST   /api/reviews                  # Create new review
DELETE /api/reviews/<id>             # Delete a review
```

### Reading Shelf (Journal)
```
GET    /api/journal                  # Get user's reading journal entries
POST   /api/journal                  # Add book to shelf
PUT    /api/journal/<id>             # Update shelf entry
DELETE /api/journal/<id>             # Remove from shelf
```

### System
```
GET    /api/health                   # Health check
```

## 💾 Database Schema

### Books Table
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| title | String | Book title |
| author | String | Author name |
| isbn | String | Unique identifier |
| description | Text | Book description |
| cover_image | String | Image URL |
| genre | String | Book genre |
| publication_year | Integer | Year published |
| rating | Float | Auto-calculated from reviews |

### Reviews Table
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| book_id | Integer | Foreign Key |
| reviewer_name | String | Reviewer's name |
| rating | Integer | 1-5 stars |
| comment | Text | Review text |
| created_at | DateTime | Timestamp |

### Journal Entries Table
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| book_id | Integer | Foreign Key |
| user_notes | Text | Personal notes |
| status | String | want-to-read / reading / completed |
| rating | Integer | 1-5 stars |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## 🎨 Design Inspiration

- **Goodreads**: Community-driven reviews, comprehensive book data, reading tracking
- **Fable**: Modern minimalist design, beautiful typography, smooth interactions

## 🛠 Technologies

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Interactive features
- **Axios** - HTTP client
- **Font Awesome** - Icons

### Backend
- **Python 3** - Core language
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **Flask-CORS** - Cross-origin support
- **SQLite** - Lightweight database

## 📖 Usage Guide

### 1. Search for Books
- Use the search bar to find books by title, author, or ISBN
- Filter by genre to narrow down results
- Browse through pages of results

### 2. View Book Details
- Click any book card to see full details
- Read community reviews and ratings
- View book metadata (ISBN, publication year, description)

### 3. Write a Review
- Click "Write a Review" on any book's detail page
- Select your 5-star rating using the interactive stars
- Share your thoughts in the comment box
- Submit to contribute to the community

### 4. Manage Your Reading Shelf
- Click "Add to Shelf" to track books
- Choose reading status:
  - **Want to Read** - On your wishlist
  - **Currently Reading** - In progress
  - **Completed** - Finished reading
- Add optional personal rating and notes
- Filter by status on the "My Shelf" page

### 5. Track Progress
- View all your books organized by status
- Update reading status and add notes anytime
- Delete entries you no longer want to track

## 🌱 Sample Data

The database comes pre-populated with 12 classic and contemporary books including:

- The Picture of Dorian Gray - Oscar Wilde
- The Secret History - Donna Tartt
- The Bell Jar - Sylvia Plath
- Crime and Punishment - Fyodor Dostoevsky
- The Metamorphosis - Franz Kafka
- Lolita - Vladimir Nabokov
- And 6 more classic works...

## 🐛 Troubleshooting

### "Failed to load books" error
**Problem**: Backend not responding  
**Solution**: 
- Ensure Flask is running: `ps aux | grep python`
- Check if port 5001 is available: `lsof -i :5001`
- Restart backend: `pkill -f "python app.py"`

### Database not seeding
**Problem**: No books appear  
**Solution**:
- Run manually: `cd backend && python seed_db.py`
- Check logs: `cat /tmp/bookify_backend.log`
- Delete database and reseed: `rm backend/instance/bookify.db && python seed_db.py`

### Port already in use
**Problem**: "Address already in use" error  
**Solution**:
- For port 5001: `lsof -i :5001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9`
- For port 8001: `lsof -i :8001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9`

### CORS errors in browser
**Problem**: "Cross-origin request blocked"  
**Solution**: Ensure backend is on port 5001 (frontend on 8001), and Flask-CORS is installed

## 📝 API Examples

### Get Books
```bash
curl http://localhost:5001/api/books
curl http://localhost:5001/api/books?search=Gatsby
curl http://localhost:5001/api/books?genre=Fiction&page=2
```

### Write a Review
```bash
curl -X POST http://localhost:5001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "reviewer_name": "John Doe",
    "rating": 5,
    "comment": "Amazing book!"
  }'
```

### Add to Reading Shelf
```bash
curl -X POST http://localhost:5001/api/journal \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "status": "reading",
    "rating": 4,
    "user_notes": "Loving this so far!"
  }'
```

## 🚀 Deployment

### With Gunicorn (Recommended)
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Docker Support (Coming Soon)
```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["flask", "run", "--host=0.0.0.0"]
```

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Social following and recommendations
- [ ] Reading statistics dashboard
- [ ] Goodreads API integration
- [ ] Export journal as PDF/CSV
- [ ] Book discussion forums
- [ ] Reading challenges
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-language support

## 📄 License

This project is open source under the MIT License. See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💬 Support

Having issues? Check out the Troubleshooting section above, or:
- Review the logs: `tail -f /tmp/bookify_backend.log`
- Check Flask debug output for detailed error messages
- Ensure all dependencies are installed: `pip install -r requirements.txt`

---

**Made with ❤️ by a 10x Full-Stack Developer**

*Built with modern web technologies to provide the best book discovery experience.*
