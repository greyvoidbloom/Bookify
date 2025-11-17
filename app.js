// API Configuration
const API_URL = 'http://localhost:5001/api';

// State Management
const state = {
    currentUser: null,
    isLoginMode: true,
    currentBookId: null,
    currentPage: 1,
    currentSearch: '',
    currentGenre: '',
    currentShelfFilter: 'all',
    selectedRating: 0,
    selectedShelfRating: 0,
    books: [],
    shelfEntries: [],
    registeredUsers: {} // Store registered users
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupDarkMode();
    setupAuthListeners();
    checkAuthStatus();
});

// ============ Dark Mode ============
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    // Check for saved dark mode preference or system preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        updateDarkModeIcon(true);
    }
    
    // Toggle dark mode on button click
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    if (isDark) {
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        if (darkModeToggleMobile) {
            darkModeToggleMobile.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        if (darkModeToggleMobile) {
            darkModeToggleMobile.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}

// ============ Authentication ============
function setupAuthListeners() {
    // Set up auth button listeners BEFORE checking auth status
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleAuthBtn = document.getElementById('toggleAuthBtn');
    
    if (authSubmitBtn) {
        authSubmitBtn.addEventListener('click', handleAuth);
    }
    if (toggleAuthBtn) {
        toggleAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            state.isLoginMode = !state.isLoginMode;
            updateAuthUI();
        });
    }
}

function checkAuthStatus() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        try {
            state.currentUser = JSON.parse(userJson);
        } catch (e) {
            state.currentUser = userJson; // Fallback for old string format
        }
        showMainApp();
    } else {
        showAuthModal();
    }
}

function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('currentUser').textContent = '';
    state.isLoginMode = true;
    updateAuthUI();
}

function showMainApp() {
    document.getElementById('authModal').classList.add('hidden');
    const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
    document.getElementById('currentUser').textContent = username;
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    loadBooks();
    loadGenres();
    loadShelfEntries();
    setupEventListeners();
}

function updateAuthUI() {
    const title = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleBtn = document.getElementById('toggleAuthBtn');
    const emailField = document.getElementById('authEmail');

    if (state.isLoginMode) {
        title.textContent = 'Welcome Back to Bookify';
        submitBtn.textContent = 'Login';
        toggleBtn.textContent = 'Create Account';
        emailField.classList.add('hidden');
    } else {
        title.textContent = 'Join Bookify';
        submitBtn.textContent = 'Register';
        toggleBtn.textContent = 'Already have an account?';
        emailField.classList.remove('hidden');
    }
}

// ============ Event Listeners ============
function setupEventListeners() {
    // Auth buttons
    document.getElementById('authSubmitBtn').addEventListener('click', handleAuth);
    document.getElementById('toggleAuthBtn').addEventListener('click', () => {
        state.isLoginMode = !state.isLoginMode;
        updateAuthUI();
    });
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('mobileLogoutBtn').addEventListener('click', handleLogout);

    // Profile buttons
    document.getElementById('profileBtn')?.addEventListener('click', openProfilePage);
    document.getElementById('mobileProfileBtn')?.addEventListener('click', openProfilePage);

    // Logo click to go home
    document.getElementById('logoBtn')?.addEventListener('click', () => {
        location.reload();
    });

    // Add Book button (desktop)
    document.getElementById('addBookBtn')?.addEventListener('click', openAddBookModal);
    
    // Add Book button (mobile)
    document.getElementById('mobileAddBookBtn')?.addEventListener('click', openAddBookModal);

    // Add Book form submission
    document.getElementById('confirmAddBookBtn')?.addEventListener('click', addNewBook);

    // Cover image URL preview
    document.getElementById('addBookCover')?.addEventListener('change', () => {
        const url = document.getElementById('addBookCover').value;
        if (url) {
            document.getElementById('coverImage').src = url;
            document.getElementById('coverPreview').classList.remove('hidden');
        }
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const heroSearchInput = document.getElementById('hero-search');
    const heroSearchBtn = document.getElementById('hero-search-btn');
    
    searchInput?.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
    heroSearchInput?.addEventListener('keypress', (e) => e.key === 'Enter' && performHeroSearch());
    heroSearchBtn?.addEventListener('click', performHeroSearch);
    document.getElementById('header-search')?.addEventListener('keypress', (e) => e.key === 'Enter' && performHeroSearch());

    // Genre filter
    document.getElementById('genre-filter')?.addEventListener('change', (e) => {
        state.currentGenre = e.target.value;
        state.currentPage = 1;
        performSearch();
    });

    // Shelf tabs
    document.querySelectorAll('.shelf-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.shelf-tab').forEach(t => {
                t.classList.remove('border-amber-600', 'text-amber-600');
                t.classList.add('border-transparent', 'text-gray-600');
            });
            e.target.classList.add('border-amber-600', 'text-amber-600');
            state.currentShelfFilter = e.target.dataset.status;
            displayShelfItems();
        });
    });

    // Profile tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            document.querySelectorAll('.profile-tab').forEach(t => {
                t.classList.remove('border-pink-600', 'text-pink-600');
                t.classList.add('border-transparent', 'text-gray-600', 'dark:text-gray-400');
            });
            e.currentTarget.classList.add('border-pink-600', 'text-pink-600');
            
            document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(tabName + 'Tab').classList.remove('hidden');
        });
    });

    // Review form
    document.getElementById('writeReviewBtn')?.addEventListener('click', openReviewForm);
    document.getElementById('submitReviewBtn')?.addEventListener('click', submitReview);
    setupRatingInput('ratingInput', 'selectedRating');

    // Shelf rating
    setupRatingInput('shelfRatingInput', 'selectedShelfRating');

    // Shelf modal
    document.getElementById('addToShelfBtn')?.addEventListener('click', openShelfModal);
    document.getElementById('confirmShelfBtn')?.addEventListener('click', saveToShelf);
}

// ============ Authentication Functions ============
function handleAuth() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const email = document.getElementById('authEmail').value.trim();

    if (!username || !password) {
        alert('Please fill in all required fields');
        return;
    }

    if (state.isLoginMode) {
        // LOGIN MODE
        // Check if user exists and password matches
        const storedUser = localStorage.getItem(`user_${username}`);
        if (!storedUser) {
            alert('Username not found. Please register first.');
            return;
        }

        const userData = JSON.parse(storedUser);
        if (userData.password !== password) {
            alert('Incorrect password. Please try again.');
            return;
        }

        // Login successful
        state.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Clear form
        document.getElementById('authUsername').value = '';
        document.getElementById('authPassword').value = '';
        
        showMainApp();
    } else {
        // REGISTER MODE
        if (!email) {
            alert('Please fill in all required fields');
            return;
        }

        if (email.indexOf('@') === -1) {
            alert('Please enter a valid email address');
            return;
        }

        if (password.length < 4) {
            alert('Password must be at least 4 characters long');
            return;
        }

        // Check if user already exists
        const existingUser = localStorage.getItem(`user_${username}`);
        if (existingUser) {
            alert('Username already taken. Please choose a different username.');
            return;
        }

        // Create new user
        const userObj = {
            username: username,
            email: email,
            password: password,
            registeredAt: new Date().toISOString()
        };

        // Save user credentials
        localStorage.setItem(`user_${username}`, JSON.stringify(userObj));
        
        // Login the new user
        state.currentUser = userObj;
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        
        // Clear form
        document.getElementById('authUsername').value = '';
        document.getElementById('authPassword').value = '';
        document.getElementById('authEmail').value = '';
        
        alert(`Welcome ${username}! Your account has been created.`);
        showMainApp();
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        state.currentUser = null;
        state.shelfEntries = [];
        document.getElementById('shelf-items').innerHTML = '';
        showAuthModal();
    }
}

// ============ Books Loading ============
async function loadBooks() {
    try {
        const response = await axios.get(`${API_URL}/books?page=${state.currentPage}`);
        state.books = response.data.books;
        displayBooks();
        setupPagination(response.data.pages || 1);
    } catch (error) {
        console.error('Failed to load books:', error);
        document.getElementById('books-grid').innerHTML = '<p class="text-red-600">Failed to load books. Please refresh.</p>';
    }
}

async function loadGenres() {
    try {
        const response = await axios.get(`${API_URL}/genres`);
        const genreSelect = document.getElementById('genre-filter');
        response.data.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load genres:', error);
    }
}

function displayBooks() {
    const grid = document.getElementById('books-grid');
    if (state.books.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-book text-6xl text-amber-300 mb-4"></i>
                <p class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Sorry! The book you're looking for doesn't exist in our directory yet.</p>
                <p class="text-gray-600 dark:text-gray-400 mb-6">Wanna add a book?</p>
                <button onclick="openAddBookModal()" class="btn-primary px-6 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition">
                    <i class="fas fa-plus mr-2"></i>Add a Book
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = state.books.map(book => `
        <div class="book-card cursor-pointer" onclick="openBookModal(${book.id})">
            <img 
                src="${book.cover_image || 'https://via.placeholder.com/200x300?text=No+Image'}" 
                alt="${book.title}" 
                class="book-card-image w-full rounded-lg bg-gray-200" 
                style="aspect-ratio: 2/3; object-fit: cover;"
                onerror="this.src='https://images.unsplash.com/photo-1507842217343-583f20270319?w=200&h=300&fit=crop'" 
                loading="lazy">
            <div class="p-3">
                <h3 class="font-semibold text-sm text-gray-900 line-clamp-2">${book.title}</h3>
                <p class="text-xs text-gray-600 mb-2">${book.author}</p>
                <div class="flex items-center justify-between">
                    <span class="star-rating">
                        ${book.rating ? parseFloat(book.rating).toFixed(1) : '0.0'} <i class="fas fa-star"></i>
                    </span>
                    <span class="text-xs text-gray-500">${book.review_count || 0} reviews</span>
                </div>
            </div>
        </div>
    `).join('');
}

function setupPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-2 rounded border ${i === state.currentPage ? 'bg-amber-600 text-white' : 'border-gray-300 hover:bg-gray-100'}`;
        btn.addEventListener('click', () => {
            state.currentPage = i;
            loadBooks();
            window.scrollTo(0, 0);
        });
        pagination.appendChild(btn);
    }
}

// ============ Search & Filter ============
async function performSearch() {
    state.currentPage = 1;
    const search = document.getElementById('search-input')?.value || '';
    state.currentSearch = search;
    
    try {
        const params = new URLSearchParams({
            search: state.currentSearch,
            genre: state.currentGenre,
            page: state.currentPage
        });
        const response = await axios.get(`${API_URL}/books?${params}`);
        state.books = response.data.books;
        displayBooks();
        setupPagination(response.data.total_pages);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

async function performHeroSearch() {
    const search = document.getElementById('hero-search')?.value || '';
    if (!search.trim()) return;
    
    state.currentSearch = search;
    state.currentPage = 1;
    state.currentGenre = '';
    document.getElementById('genre-filter').value = '';
    
    try {
        const response = await axios.get(`${API_URL}/books?search=${search}&page=1`);
        state.books = response.data.books;
        displayBooks();
        setupPagination(response.data.total_pages);
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// ============ Book Detail Modal ============
async function openBookModal(bookId) {
    state.currentBookId = bookId;
    try {
        const response = await axios.get(`${API_URL}/books/${bookId}`);
        const book = response.data;

        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('modalBookAuthor').textContent = `by ${book.author}`;
        const coverImg = document.getElementById('modalBookCover');
        coverImg.src = book.cover_image || 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=450&fit=crop';
        coverImg.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=450&fit=crop';
        };
        document.getElementById('modalBookRating').textContent = book.rating ? parseFloat(book.rating).toFixed(1) : '0.0';
        document.getElementById('modalReviewCount').textContent = `${book.review_count || 0} reviews`;
        document.getElementById('modalBookGenre').textContent = book.genre || 'Unknown';
        document.getElementById('modalBookDescription').textContent = book.description || 'No description available';
        document.getElementById('modalBookYear').textContent = book.publication_year || 'N/A';
        document.getElementById('modalBookISBN').textContent = book.isbn || 'N/A';

        // Display reviews
        displayReviews(book.reviews || []);

        state.selectedRating = 0;
        const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
        document.getElementById('reviewerName').value = username;
        document.getElementById('reviewComment').value = '';
        updateRatingDisplay('ratingInput');
        document.getElementById('reviewForm').classList.add('hidden');

        document.getElementById('bookModal').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load book:', error);
    }
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>';
        return;
    }

    const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
    const template = document.getElementById('reviewTemplate');
    const fragments = [];
    
    reviews.forEach(review => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.review-author').textContent = review.reviewer_name;
        clone.querySelector('.review-rating').textContent = review.rating;
        clone.querySelector('.review-comment').textContent = review.comment || '(No comment)';
        clone.querySelector('.review-date').textContent = new Date(review.created_at).toLocaleDateString();
        
        // Add delete button functionality only for own reviews
        const deleteBtn = clone.querySelector('.delete-review-btn');
        if (review.reviewer_name === username) {
            deleteBtn.style.display = 'inline-block';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteReview(review.id);
            });
        } else {
            deleteBtn.style.display = 'none';
        }
        
        fragments.push(clone);
    });
    
    reviewsList.innerHTML = '';
    fragments.forEach(fragment => {
        reviewsList.appendChild(fragment);
    });
}

function openReviewForm() {
    const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
    document.getElementById('reviewerName').value = username;
    document.getElementById('reviewForm').classList.remove('hidden');
    document.getElementById('reviewComment').focus();
}

function closeReviewForm() {
    document.getElementById('reviewForm').classList.add('hidden');
    state.selectedRating = 0;
    document.getElementById('reviewComment').value = '';
    updateRatingDisplay('ratingInput');
}

async function submitReview() {
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (!state.selectedRating) {
        alert('Please select a rating');
        return;
    }

    try {
        const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
        await axios.post(`${API_URL}/reviews`, {
            book_id: state.currentBookId,
            reviewer_name: username,
            rating: state.selectedRating,
            comment: comment
        });

        // Reload book to show new review
        openBookModal(state.currentBookId);
        closeReviewForm();
        alert('Review posted successfully!');
    } catch (error) {
        alert('Failed to post review');
        console.error(error);
    }
}

function closeBookModal() {
    document.getElementById('bookModal').classList.add('hidden');
}

// ============ Shelf Management ============
async function loadShelfEntries() {
    try {
        const response = await axios.get(`${API_URL}/journal`);
        state.shelfEntries = response.data;
        displayShelfItems();
    } catch (error) {
        console.error('Failed to load shelf:', error);
    }
}

function displayShelfItems() {
    const container = document.getElementById('shelf-items');
    let filtered = state.shelfEntries;

    if (state.currentShelfFilter !== 'all') {
        filtered = filtered.filter(entry => entry.status === state.currentShelfFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center py-12">No books in this shelf yet.</p>`;
        return;
    }

    const template = document.getElementById('shelfItemTemplate');
    const items = [];
    
    filtered.forEach(entry => {
        const clone = template.content.cloneNode(true);
        const book = state.books.find(b => b.id === entry.book_id) || { title: entry.book_title, author: '', cover_image: '' };
        
        const coverImg = clone.querySelector('.shelf-cover');
        coverImg.src = book.cover_image || 'https://via.placeholder.com/80x120?text=No+Image';
        coverImg.onerror = function() {
            this.src = 'https://via.placeholder.com/80x120?text=No+Image';
        };
        
        clone.querySelector('.shelf-title').textContent = entry.book_title;
        clone.querySelector('.shelf-author').textContent = book.author || 'Unknown author';
        clone.querySelector('.shelf-notes').textContent = entry.user_notes || '(No notes)';
        clone.querySelector('.shelf-notes').style.display = entry.user_notes ? 'block' : 'none';
        
        const statusSelect = clone.querySelector('.shelf-status-select');
        statusSelect.value = entry.status;
        statusSelect.dataset.entryId = entry.id;
        
        const badge = clone.querySelector('.status-badge');
        const statusTexts = { 'want-to-read': 'Want to Read', 'reading': 'Currently Reading', 'completed': 'Completed' };
        const statusClasses = { 'want-to-read': 'status-want', 'reading': 'status-reading', 'completed': 'status-completed' };
        badge.textContent = statusTexts[entry.status];
        badge.className = `status-badge ${statusClasses[entry.status]} text-xs`;
        
        clone.querySelector('.delete-shelf-btn').dataset.entryId = entry.id;
        
        const temp = document.createElement('div');
        temp.appendChild(clone);
        items.push(temp.innerHTML);
    });
    
    container.innerHTML = items.join('');
    
    // Add event listeners to all status selects after rendering
    setTimeout(() => {
        container.querySelectorAll('.shelf-status-select').forEach(select => {
            select.addEventListener('change', function(e) {
                const entryId = parseInt(this.dataset.entryId);
                const newStatus = this.value;
                console.log(`Updating shelf entry ${entryId} to status: ${newStatus}`);
                updateShelfStatus(entryId, newStatus);
            });
        });
        
        // Add event listeners to all delete buttons
        container.querySelectorAll('.delete-shelf-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const entryId = parseInt(this.dataset.entryId);
                deleteShelfEntry(entryId);
            });
        });
    }, 0);
}

function openShelfModal() {
    const book = state.books.find(b => b.id === state.currentBookId);
    document.getElementById('shelfBookTitle').textContent = book.title;
    document.getElementById('shelfStatus').value = 'want-to-read';
    document.getElementById('shelfNotes').value = '';
    state.selectedShelfRating = 0;
    updateRatingDisplay('shelfRatingInput');
    document.getElementById('shelfModal').classList.remove('hidden');
}

function closeShelfModal() {
    document.getElementById('shelfModal').classList.add('hidden');
}

async function saveToShelf() {
    const status = document.getElementById('shelfStatus').value;
    const notes = document.getElementById('shelfNotes').value;

    try {
        await axios.post(`${API_URL}/journal`, {
            book_id: state.currentBookId,
            status: status,
            user_notes: notes,
            rating: state.selectedShelfRating || null
        });

        closeBookModal();
        closeShelfModal();
        loadShelfEntries();
        alert('Book added to shelf!');
    } catch (error) {
        if (error.response?.status === 400) {
            alert('This book is already on your shelf! Update it instead.');
        } else {
            alert('Failed to add book to shelf');
        }
        console.error(error);
    }
}

async function updateShelfStatus(entryId, newStatus) {
    try {
        await axios.put(`${API_URL}/journal/${entryId}`, {
            status: newStatus
        });
        loadShelfEntries();
    } catch (error) {
        alert('Failed to update status');
        console.error(error);
    }
}

async function deleteShelfEntry(entryId) {
    if (!confirm('Remove this book from your shelf?')) return;

    try {
        await axios.delete(`${API_URL}/journal/${entryId}`);
        loadShelfEntries();
    } catch (error) {
        alert('Failed to remove book');
        console.error(error);
    }
}

// ============ Utility Functions ============
function updateRatingDisplay(inputId) {
    const rating = inputId === 'ratingInput' ? state.selectedRating : state.selectedShelfRating;
    document.getElementById(inputId).querySelectorAll('span').forEach((span, i) => {
        span.textContent = i < rating ? '★' : '☆';
    });
}

function setupRatingInput(inputId, stateKey) {
    const ratingInput = document.getElementById(inputId);
    if (!ratingInput) return;
    
    ratingInput.querySelectorAll('span').forEach(span => {
        span.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.value);
            if (stateKey === 'selectedRating') {
                state.selectedRating = rating;
            } else {
                state.selectedShelfRating = rating;
            }
            updateRatingDisplay(inputId);
        });
        
        span.addEventListener('mouseover', (e) => {
            const val = parseInt(e.target.dataset.value);
            ratingInput.querySelectorAll('span').forEach((s, i) => {
                s.textContent = i < val ? '★' : '☆';
            });
        });
    });
    
    ratingInput.addEventListener('mouseleave', () => {
        updateRatingDisplay(inputId);
    });
}

// ============ Profile Page Functions ============
function openProfilePage() {
    const profilePage = document.getElementById('profilePage');
    profilePage.classList.remove('hidden');
    const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
    document.getElementById('profileUsername').textContent = username;
    loadProfileData();
}

function closeProfilePage() {
    document.getElementById('profilePage').classList.add('hidden');
}

async function loadProfileData() {
    try {
        const shelfResponse = await axios.get(`${API_URL}/journal`);
        const shelfEntries = shelfResponse.data;
        
        // Load reviews for all books
        const allReviews = [];
        for (const book of state.books) {
            const bookResponse = await axios.get(`${API_URL}/books/${book.id}`);
            if (bookResponse.data.reviews) {
                const username = typeof state.currentUser === 'object' ? state.currentUser.username : state.currentUser;
                const userReviews = bookResponse.data.reviews.filter(r => r.reviewer_name === username);
                userReviews.forEach(review => {
                    review.book_title = book.title;
                    review.book_id = book.id;
                    review.book_cover = book.cover_image;
                });
                allReviews.push(...userReviews);
            }
        }
        
        // Update stats
        document.getElementById('statTotalBooks').textContent = shelfEntries.length;
        document.getElementById('statCompleted').textContent = shelfEntries.filter(e => e.status === 'completed').length;
        document.getElementById('statReading').textContent = shelfEntries.filter(e => e.status === 'reading').length;
        document.getElementById('statReviews').textContent = allReviews.length;
        
        // Display books
        displayProfileBooks(shelfEntries);
        // Display reviews
        displayProfileReviews(allReviews);
    } catch (error) {
        console.error('Failed to load profile data:', error);
    }
}

function displayProfileBooks(shelfEntries) {
    const container = document.querySelector('#readingTab .space-y-4');
    
    if (shelfEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p class="text-gray-600 dark:text-gray-400">No books on your shelf yet</p>
                <button onclick="closeProfilePage()" class="mt-4 px-4 py-2 btn-primary text-white rounded-lg">Start Reading</button>
            </div>
        `;
        return;
    }
    
    const statusTexts = { 'want-to-read': 'Want to Read', 'reading': 'Currently Reading', 'completed': 'Completed' };
    const statusColors = { 'want-to-read': 'bg-blue-100 text-blue-700', 'reading': 'bg-yellow-100 text-yellow-700', 'completed': 'bg-green-100 text-green-700' };
    
    const books = shelfEntries.map(entry => {
        const book = state.books.find(b => b.id === entry.book_id) || {};
        return `
            <div class="profile-book-card dark:bg-gray-800 dark:border-gray-700">
                <img src="${book.cover_image || 'https://via.placeholder.com/80x120?text=No+Image'}" alt="${entry.book_title}" class="profile-book-cover">
                <div class="profile-book-info">
                    <h3 class="text-gray-900 dark:text-white">${entry.book_title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${book.author || 'Unknown Author'}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">${book.genre || 'Unknown Genre'}</p>
                    ${entry.user_notes ? `<p class="text-sm italic text-gray-600 dark:text-gray-400 mt-2">"${entry.user_notes}"</p>` : ''}
                    <span class="profile-book-status ${statusColors[entry.status]} dark:bg-gray-700 dark:text-gray-200">${statusTexts[entry.status]}</span>
                </div>
                <div class="text-right">
                    ${entry.rating ? `<div class="text-yellow-500 mb-2"><i class="fas fa-star"></i> ${entry.rating}/5</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = books;
}

function displayProfileReviews(reviews) {
    const container = document.querySelector('#reviewsTab .space-y-4');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p class="text-gray-600 dark:text-gray-400">No reviews written yet</p>
                <button onclick="closeProfilePage()" class="mt-4 px-4 py-2 btn-primary text-white rounded-lg">Leave a Review</button>
            </div>
        `;
        return;
    }
    
    const reviewsHtml = reviews.map(review => `
        <div class="profile-review-card dark:bg-gray-800 dark:border-gray-700">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h4 class="font-bold text-gray-900 dark:text-white">${review.book_title}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">by ${review.reviewer_name}</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-yellow-500"><i class="fas fa-star"></i> ${review.rating}/5</div>
                    <button class="delete-review-btn text-red-500 hover:text-red-700" onclick="deleteReview(${review.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300">${review.comment || '(No comment)'}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">${new Date(review.created_at).toLocaleDateString()}</p>
        </div>
    `).join('');
    
    container.innerHTML = reviewsHtml;
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        await axios.delete(`${API_URL}/reviews/${reviewId}`);
        loadProfileData();
        // If book modal is open, reload it
        if (state.currentBookId) {
            openBookModal(state.currentBookId);
        }
    } catch (error) {
        alert('Failed to delete review');
        console.error(error);
    }
}

// Add Book Modal Functions
function openAddBookModal() {
    document.getElementById('addBookModal').classList.remove('hidden');
    document.getElementById('addBookTitle').focus();
}

function closeAddBookModal() {
    document.getElementById('addBookModal').classList.add('hidden');
    // Clear form
    document.getElementById('addBookTitle').value = '';
    document.getElementById('addBookAuthor').value = '';
    document.getElementById('addBookISBN').value = '';
    document.getElementById('addBookYear').value = '';
    document.getElementById('addBookGenre').value = '';
    document.getElementById('addBookCover').value = '';
    document.getElementById('addBookDescription').value = '';
    document.getElementById('coverPreview').classList.add('hidden');
}

async function addNewBook() {
    try {
        const title = document.getElementById('addBookTitle').value.trim();
        const author = document.getElementById('addBookAuthor').value.trim();
        const isbn = document.getElementById('addBookISBN').value.trim();
        const year = document.getElementById('addBookYear').value;
        const genre = document.getElementById('addBookGenre').value.trim();
        const coverUrl = document.getElementById('addBookCover').value.trim();
        const description = document.getElementById('addBookDescription').value.trim();

        // Validation
        if (!title || !author || !genre || !coverUrl) {
            alert('Please fill in all required fields (Title, Author, Genre, Cover Image URL)');
            return;
        }

        // Create book object
        const bookData = {
            title,
            author,
            isbn: isbn || null,
            publication_year: year ? parseInt(year) : null,
            genre,
            cover_image: coverUrl,
            description: description || null,
            rating: 0 // New books start with no rating
        };

        // POST to backend
        const response = await axios.post(`${API_URL}/books`, bookData);
        
        if (response.status === 201 || response.status === 200) {
            alert('Book added successfully!');
            closeAddBookModal();
            // Reload books list
            state.currentPage = 1;
            state.currentSearch = '';
            state.currentGenre = '';
            loadBooks();
        }
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Failed to add book. Please try again.');
    }
}
