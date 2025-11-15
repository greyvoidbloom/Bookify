from app import app, db, Book
import os

def seed_books():
    """Seed the database with 30+ books with valid cover images"""
    books_data = [
        {
            'title': 'The Great Gatsby',
            'author': 'F. Scott Fitzgerald',
            'isbn': '9780743273565',
            'description': 'A masterpiece of American literature set in the Jazz Age, telling the story of Jay Gatsby and his obsessive love for Daisy Buchanan.',
            'genre': 'Literary Fiction',
            'publication_year': 1925,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725342-L.jpg'
        },
        {
            'title': '1984',
            'author': 'George Orwell',
            'isbn': '9780451524935',
            'description': 'A dystopian novel set in a totalitarian state where the government controls every aspect of life.',
            'genre': 'Dystopian',
            'publication_year': 1949,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725334-L.jpg'
        },
        {
            'title': 'To Kill a Mockingbird',
            'author': 'Harper Lee',
            'isbn': '9780061120084',
            'description': 'A classic American novel about racial injustice in the Deep South.',
            'genre': 'Literary Fiction',
            'publication_year': 1960,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725341-L.jpg'
        },
        {
            'title': 'Pride and Prejudice',
            'author': 'Jane Austen',
            'isbn': '9780141439518',
            'description': 'A romantic novel about Elizabeth Bennet and Mr. Darcy, exploring themes of love and social class.',
            'genre': 'Romance',
            'publication_year': 1813,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725339-L.jpg'
        },
        {
            'title': 'The Catcher in the Rye',
            'author': 'J.D. Salinger',
            'isbn': '9780316769174',
            'description': 'A controversial coming-of-age novel following Holden Caulfield as he navigates adolescence and alienation.',
            'genre': 'Literary Fiction',
            'publication_year': 1951,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725336-L.jpg'
        },
        {
            'title': 'The Hobbit',
            'author': 'J.R.R. Tolkien',
            'isbn': '9780547928227',
            'description': 'An adventurous fantasy novel about Bilbo Baggins and his unexpected journey with dwarves and a wizard.',
            'genre': 'Fantasy',
            'publication_year': 1937,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725338-L.jpg'
        },
        {
            'title': 'The Lord of the Rings: The Fellowship of the Ring',
            'author': 'J.R.R. Tolkien',
            'isbn': '9780547928210',
            'description': 'The first volume of the epic fantasy trilogy following the journey of hobbits to destroy the One Ring.',
            'genre': 'Fantasy',
            'publication_year': 1954,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725343-L.jpg'
        },
        {
            'title': 'Wuthering Heights',
            'author': 'Emily Brontë',
            'isbn': '9780141439556',
            'description': 'A gothic romance novel set on the Yorkshire moors, exploring themes of love, revenge, and social class.',
            'genre': 'Gothic Fiction',
            'publication_year': 1847,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725344-L.jpg'
        },
        {
            'title': 'Jane Eyre',
            'author': 'Charlotte Brontë',
            'isbn': '9780141441146',
            'description': 'A Gothic romance following an orphaned governess and her complex relationship with the mysterious Mr. Rochester.',
            'genre': 'Gothic Fiction',
            'publication_year': 1847,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725345-L.jpg'
        },
        {
            'title': 'Moby-Dick',
            'author': 'Herman Melville',
            'isbn': '9780142437247',
            'description': 'An epic novel about Captain Ahab\'s obsessive quest to hunt the white whale.',
            'genre': 'Adventure',
            'publication_year': 1851,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725346-L.jpg'
        },
        {
            'title': 'The Picture of Dorian Gray',
            'author': 'Oscar Wilde',
            'isbn': '9780141441143',
            'description': 'A darkly witty novel about vanity, corruption, and the price of beauty.',
            'genre': 'Gothic Fiction',
            'publication_year': 1890,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725337-L.jpg'
        },
        {
            'title': 'Crime and Punishment',
            'author': 'Fyodor Dostoevsky',
            'isbn': '9780143039990',
            'description': 'An intense psychological drama about a poor student who commits murder and faces the moral consequences.',
            'genre': 'Literary Fiction',
            'publication_year': 1866,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725335-L.jpg'
        },
        {
            'title': 'Anna Karenina',
            'author': 'Leo Tolstoy',
            'isbn': '9780143039990',
            'description': 'A grand novel about Russian aristocratic society, love, family, and the search for meaning.',
            'genre': 'Literary Fiction',
            'publication_year': 1877,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725340-L.jpg'
        },
        {
            'title': 'War and Peace',
            'author': 'Leo Tolstoy',
            'isbn': '9780199232765',
            'description': 'An epic historical novel set during the Napoleonic Wars, exploring themes of fate, society, and human nature.',
            'genre': 'Literary Fiction',
            'publication_year': 1869,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725347-L.jpg'
        },
        {
            'title': 'The Odyssey',
            'author': 'Homer',
            'isbn': '9780140268867',
            'description': 'An ancient Greek epic poem following Odysseus\'s ten-year journey home after the Trojan War.',
            'genre': 'Epic Poetry',
            'publication_year': 800,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725348-L.jpg'
        },
        {
            'title': 'The Iliad',
            'author': 'Homer',
            'isbn': '9780140275847',
            'description': 'An ancient Greek epic poem about the Trojan War and the warriors who fought in it.',
            'genre': 'Epic Poetry',
            'publication_year': 800,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725349-L.jpg'
        },
        {
            'title': 'Don Quixote',
            'author': 'Miguel de Cervantes',
            'isbn': '9780140449174',
            'description': 'A comic novel about an aging knight who sets out on adventures with his faithful squire Sancho Panza.',
            'genre': 'Literary Fiction',
            'publication_year': 1605,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725350-L.jpg'
        },
        {
            'title': 'Ulysses',
            'author': 'James Joyce',
            'isbn': '9780199232765',
            'description': 'A modernist novel following Leopold Bloom through the streets of Dublin on a single day.',
            'genre': 'Literary Fiction',
            'publication_year': 1922,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725351-L.jpg'
        },
        {
            'title': 'The Metamorphosis',
            'author': 'Franz Kafka',
            'isbn': '9780486292730',
            'description': 'A haunting novella about Gregor Samsa transformed into a giant insect.',
            'genre': 'Science Fiction',
            'publication_year': 1915,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725352-L.jpg'
        },
        {
            'title': 'The Trial',
            'author': 'Franz Kafka',
            'isbn': '9780805210750',
            'description': 'A surreal novel about a man arrested and tried for an unknown crime.',
            'genre': 'Literary Fiction',
            'publication_year': 1925,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725353-L.jpg'
        },
        {
            'title': 'The Stranger',
            'author': 'Albert Camus',
            'isbn': '9780679720201',
            'description': 'An existentialist novel about an emotionally detached man who commits an absurd act.',
            'genre': 'Literary Fiction',
            'publication_year': 1942,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725354-L.jpg'
        },
        {
            'title': 'Beloved',
            'author': 'Toni Morrison',
            'isbn': '9781400033416',
            'description': 'A powerful novel about a formerly enslaved woman haunted by a ghost from her past.',
            'genre': 'Literary Fiction',
            'publication_year': 1987,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725355-L.jpg'
        },
        {
            'title': 'The Bell Jar',
            'author': 'Sylvia Plath',
            'isbn': '9780061148514',
            'description': 'A semi-autobiographical novel following a talented young writer struggling with depression.',
            'genre': 'Literary Fiction',
            'publication_year': 1963,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725356-L.jpg'
        },
        {
            'title': 'Invisible Man',
            'author': 'Ralph Ellison',
            'isbn': '9780679732761',
            'description': 'A powerful novel about an unnamed African American man struggling with identity and invisibility in society.',
            'genre': 'Literary Fiction',
            'publication_year': 1952,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725357-L.jpg'
        },
        {
            'title': 'The Handmaid\'s Tale',
            'author': 'Margaret Atwood',
            'isbn': '9780385490818',
            'description': 'A dystopian novel set in a totalitarian theocracy where women are subjugated.',
            'genre': 'Dystopian',
            'publication_year': 1985,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725358-L.jpg'
        },
        {
            'title': 'Brave New World',
            'author': 'Aldous Huxley',
            'isbn': '9780060850524',
            'description': 'A dystopian novel set in a future world obsessed with stability, consumption, and happiness.',
            'genre': 'Dystopian',
            'publication_year': 1932,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725359-L.jpg'
        },
        {
            'title': 'Of Mice and Men',
            'author': 'John Steinbeck',
            'isbn': '9780142000671',
            'description': 'A novella about two migrant workers pursuing the American Dream during the Great Depression.',
            'genre': 'Literary Fiction',
            'publication_year': 1937,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725360-L.jpg'
        },
        {
            'title': 'The Grapes of Wrath',
            'author': 'John Steinbeck',
            'isbn': '9780143039433',
            'description': 'An epic novel about a family of migrant workers escaping the Dust Bowl.',
            'genre': 'Literary Fiction',
            'publication_year': 1939,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725361-L.jpg'
        },
        {
            'title': 'Harry Potter and the Philosopher\'s Stone',
            'author': 'J.K. Rowling',
            'isbn': '9780747532699',
            'description': 'A fantasy novel about a young wizard attending a magical school for the first time.',
            'genre': 'Fantasy',
            'publication_year': 1997,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725362-L.jpg'
        },
        {
            'title': 'The Hobbit: An Unexpected Journey',
            'author': 'J.R.R. Tolkien',
            'isbn': '9780547928227',
            'description': 'A prequel to The Lord of the Rings, following Bilbo Baggins on an unexpected adventure.',
            'genre': 'Fantasy',
            'publication_year': 1937,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725363-L.jpg'
        },
        {
            'title': 'The Name of the Wind',
            'author': 'Patrick Rothfuss',
            'isbn': '9780756404079',
            'description': 'A fantasy novel about a legendary figure named Kvothe telling the story of his extraordinary life.',
            'genre': 'Fantasy',
            'publication_year': 2007,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725364-L.jpg'
        },
        {
            'title': 'A Game of Thrones',
            'author': 'George R.R. Martin',
            'isbn': '9780553103540',
            'description': 'An epic fantasy novel set in a fictional world with multiple perspectives and intricate political plots.',
            'genre': 'Fantasy',
            'publication_year': 1996,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725365-L.jpg'
        },
        {
            'title': 'The Midnight Library',
            'author': 'Matt Haig',
            'isbn': '9780316409536',
            'description': 'A contemporary fantasy about a woman exploring alternate versions of her life.',
            'genre': 'Fantasy',
            'publication_year': 2020,
            'cover_image': 'https://covers.openlibrary.org/b/id/7725366-L.jpg'
        }
    ]
    
    with app.app_context():
        # Clear existing books
        Book.query.delete()
        db.session.commit()
        
        for book_data in books_data:
            book = Book(**book_data)
            db.session.add(book)
        
        db.session.commit()
        print(f'Successfully seeded {len(books_data)} books!')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print('Database tables created!')
    seed_books()
