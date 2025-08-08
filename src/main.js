// News Portal Application
class NewsApp {
    constructor() {
        this.posts = [];
        this.users = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentView = 'home';
        this.currentSort = 'newest';
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.hideLoading();
            this.renderHomePage();
        } catch (error) {
            this.showError('Не удалось загрузить данные: ' + error.message);
        }
    }

    async loadData() {
        try {
            // Load posts and users from JSONPlaceholder
            const [postsResponse, usersResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/posts'),
                fetch('https://jsonplaceholder.typicode.com/users')
            ]);

            if (!postsResponse.ok || !usersResponse.ok) {
                throw new Error('Ошибка загрузки данных');
            }

            this.posts = await postsResponse.json();
            this.users = await usersResponse.json();

            // Enrich posts with additional data
            this.posts = this.posts.map((post, index) => ({
                ...post,
                excerpt: this.generateExcerpt(post.body),
                image: this.generateImage(post.id),
                date: this.generateDate(index),
                author: this.users.find(user => user.id === post.userId) || { name: 'Неизвестный автор' },
                content: this.generateFullContent(post.body)
            }));

        } catch (error) {
            throw new Error('Не удалось подключиться к серверу');
        }
    }

    generateExcerpt(body) {
        return body.length > 150 ? body.substring(0, 150) + '...' : body;
    }

    generateImage(id) {
        // Generate placeholder images
        const imageTypes = ['📰', '🌍', '💼', '🏛️', '🔬', '🎭', '⚽', '🎵', '📱', '🚗'];
        return imageTypes[id % imageTypes.length];
    }

    generateDate(index) {
        const now = new Date();
        const daysAgo = Math.floor(index / 3);
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    generateFullContent(body) {
        // Generate richer content with paragraphs and links
        const sentences = body.split('. ');
        const paragraphs = [];
        
        for (let i = 0; i < sentences.length; i += 2) {
            const paragraph = sentences.slice(i, i + 2).join('. ');
            paragraphs.push(paragraph + (paragraph.endsWith('.') ? '' : '.'));
        }

        // Add some sample links and formatting
        let content = paragraphs.join('\n\n');
        
        // Add some realistic news content elements
        if (Math.random() > 0.5) {
            content += '\n\nДополнительная информация доступна на <a href="#" onclick="return false;">официальном сайте</a>.';
        }
        
        if (Math.random() > 0.7) {
            content += '\n\nСм. также: <a href="#" onclick="return false;">связанная статья</a> и <a href="#" onclick="return false;">архив новостей</a>.';
        }

        return content;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));
        
        searchBtn.addEventListener('click', () => {
            this.handleSearch(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderAllNews();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreNews();
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchPosts(query);
        this.showSearchResults(results, query);
    }

    searchPosts(query) {
        const searchTerm = query.toLowerCase();
        return this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.body.toLowerCase().includes(searchTerm) ||
            post.author.name.toLowerCase().includes(searchTerm)
        ).slice(0, 5); // Limit to 5 results
    }

    showSearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
        } else {
            searchResults.innerHTML = results.map(post => `
                <div class="search-result-item" onclick="showNewsDetail(${post.id})">
                    <div class="search-result-title">${this.highlightText(post.title, query)}</div>
                    <div class="search-result-snippet">${this.highlightText(post.excerpt, query)}</div>
                </div>
            `).join('');
        }
        
        searchResults.style.display = 'block';
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        searchResults.style.display = 'none';
    }

    renderHomePage() {
        this.currentView = 'home';
        this.updateNavigation();
        this.showPage('homePage');
        
        // Featured news (first 3 posts)
        const featuredPosts = this.posts.slice(0, 3);
        document.getElementById('featuredNewsGrid').innerHTML = 
            featuredPosts.map(post => this.createNewsCard(post)).join('');
        
        // Latest news (next 6 posts)
        const latestPosts = this.posts.slice(3, 9);
        document.getElementById('latestNewsGrid').innerHTML = 
            latestPosts.map(post => this.createNewsCard(post)).join('');
    }

    renderAllNews() {
        this.currentView = 'allNews';
        this.updateNavigation();
        this.showPage('allNewsPage');
        
        const sortedPosts = this.getSortedPosts();
        const paginatedPosts = sortedPosts.slice(0, this.currentPage * this.postsPerPage);
        
        document.getElementById('allNewsGrid').innerHTML = 
            paginatedPosts.map(post => this.createNewsCard(post)).join('');
        
        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (paginatedPosts.length >= sortedPosts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    getSortedPosts() {
        const posts = [...this.posts];
        
        switch (this.currentSort) {
            case 'oldest':
                return posts.reverse();
            case 'title':
                return posts.sort((a, b) => a.title.localeCompare(b.title));
            case 'newest':
            default:
                return posts;
        }
    }

    loadMoreNews() {
        this.currentPage++;
        this.renderAllNews();
    }

    renderSearchResults(query) {
        this.currentView = 'search';
        this.searchQuery = query;
        this.updateNavigation();
        this.showPage('searchPage');
        
        const results = this.searchPosts(query);
        document.getElementById('searchQuery').innerHTML = `Поиск: "<strong>${query}</strong>" (${results.length} результатов)`;
        document.getElementById('searchResultsGrid').innerHTML = 
            results.map(post => this.createNewsCard(post)).join('');
        
        // Hide search dropdown
        this.hideSearchResults();
    }

    renderNewsDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        this.currentView = 'detail';
        this.showPage('newsDetailPage');
        
        document.getElementById('newsDetail').innerHTML = `
            <button class="back-btn" onclick="goBack()">
                ← Назад
            </button>
            
            <article class="news-detail-content">
                <header class="news-detail-header">
                    <h1 class="news-detail-title">${post.title}</h1>
                    <div class="news-detail-meta">
                        <span class="news-detail-author">Автор: ${post.author.name}</span>
                        <span class="news-detail-date">${post.date}</span>
                    </div>
                </header>
                
                <div class="news-detail-image">${post.image}</div>
                
                <div class="news-detail-content">
                    ${post.content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                </div>
            </article>
        `;
    }

    createNewsCard(post) {
        return `
            <article class="news-card" onclick="showNewsDetail(${post.id})">
                <div class="news-card-image">${post.image}</div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${post.title}</h3>
                    <p class="news-card-excerpt">${post.excerpt}</p>
                    <div class="news-card-meta">
                        <span class="news-card-author">${post.author.name}</span>
                        <span class="news-card-date">${post.date}</span>
    </div>
  </div>
            </article>
        `;
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageId).classList.add('active');
    }

    updateNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (this.currentView === 'home') {
            document.querySelector('.nav-btn[onclick="showHomePage()"]').classList.add('active');
        } else if (this.currentView === 'allNews') {
            document.querySelector('.nav-btn[onclick="showAllNews()"]').classList.add('active');
        }
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }

    showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('errorMessage').style.display = 'flex';
        this.hideLoading();
    }

    performSearch(query) {
        if (query.trim()) {
            this.renderSearchResults(query.trim());
            // Clear search input
            document.getElementById('searchInput').value = '';
        }
    }
}

// Global functions for HTML onclick handlers
window.showHomePage = function() {
    app.currentPage = 1;
    app.renderHomePage();
};

window.showAllNews = function() {
    app.currentPage = 1;
    app.renderAllNews();
};

window.showNewsDetail = function(postId) {
    app.renderNewsDetail(postId);
};

window.goBack = function() {
    if (app.currentView === 'search') {
        app.renderSearchResults(app.searchQuery);
    } else {
        app.renderHomePage();
    }
};

window.hideError = function() {
    document.getElementById('errorMessage').style.display = 'none';
};

window.performSearch = function(query) {
    app.performSearch(query);
};

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NewsApp();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}