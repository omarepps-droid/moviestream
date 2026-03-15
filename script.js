// YOUR TMDB API KEY (provided by you)
const TMDB_API_KEY = 'cdf8b88e96f4a94a572eadb391b2677a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Video streaming sources (free, no API key needed)
const VIDEO_SOURCES = {
    vidsrc: 'https://vidsrc.me/embed/movie',
    vidsrcPro: 'https://vidsrc.pro/embed/movie',
    vidsrcTo: 'https://vidsrc.to/embed/movie',
    embedSu: 'https://embed.su/embed/movie',
    moviesApi: 'https://moviesapi.club/movie'
};

// Primary video source (using multiple fallbacks)
const VIDEO_BASE_URL = VIDEO_SOURCES.vidsrc;

// DOM Elements
const popularMoviesEl = document.getElementById('popularMovies');
const nowPlayingMoviesEl = document.getElementById('nowPlayingMovies');
const topRatedMoviesEl = document.getElementById('topRatedMovies');
const upcomingMoviesEl = document.getElementById('upcomingMovies');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const closeBtn = document.querySelector('.close');
const navbar = document.querySelector('.navbar');
const playFeaturedBtn = document.getElementById('playFeaturedBtn');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');

// Cache for movie data
let movieCache = new Map();

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fetch movies from TMDB with your API key
async function fetchMovies(endpoint, elementId, category = 'movie') {
    try {
        const container = document.getElementById(elementId);
        container.innerHTML = '<div class="loading">Loading amazing movies...</div>';
        
        let url;
        if (category === 'search') {
            url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${endpoint}`;
        } else {
            url = `${TMDB_BASE_URL}/movie/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Cache the movies
            data.results.forEach(movie => movieCache.set(movie.id, movie));
            displayMovies(data.results.slice(0, 15), elementId);
            
            // Update hero section with first movie from popular
            if (elementId === 'popularMovies' && data.results[0]) {
                updateHeroSection(data.results[0]);
            }
        } else {
            container.innerHTML = '<div class="error">No movies found</div>';
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        const container = document.getElementById(elementId);
        container.innerHTML = '<div class="error">Failed to load movies. Please refresh the page.</div>';
    }
}

// Display movies in row
function displayMovies(movies, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    movies.forEach(movie => {
        const movieId = movie.id;
        const posterPath = movie.poster_path 
            ? `${IMG_BASE_URL}${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}" loading="lazy">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    <span>${movie.release_date ? movie.release_date.substring(0,4) : 'N/A'}</span>
                </div>
                <button class="play-btn" onclick="playMovie(${movieId})">
                    <i class="fas fa-play"></i> Play
                </button>
            </div>
        `;
        
        container.appendChild(movieCard);
    });
}

// Update hero section with featured movie
function updateHeroSection(movie) {
    heroTitle.textContent = movie.title;
    heroDesc.textContent = movie.overview || 'Watch this amazing movie now!';
    
    // Update hero background with movie backdrop if available
    if (movie.backdrop_path) {
        const heroSection = document.querySelector('.hero');
        heroSection.style.background = `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
    }
    
    // Update play button to play this movie
    playFeaturedBtn.onclick = () => playMovie(movie.id);
}

// Play movie function with multiple source fallbacks
function playMovie(movieId) {
    // Try multiple video sources in order
    const sources = [
        `https://vidsrc.me/embed/movie/${movieId}`,
        `https://vidsrc.pro/embed/movie/${movieId}`,
        `https://vidsrc.to/embed/movie/${movieId}`,
        `https://embed.su/embed/movie/${movieId}`,
        `https://moviesapi.club/movie/${movieId}`
    ];
    
    // Use the first source (primary)
    videoPlayer.src = sources[0];
    modal.style.display = 'block';
    
    // If primary source fails after 5 seconds, try next source
    setTimeout(() => {
        try {
            // Check if iframe loaded successfully
            const iframeDoc = videoPlayer.contentDocument || videoPlayer.contentWindow.document;
            if (iframeDoc.body.innerHTML.includes('404') || iframeDoc.body.innerHTML.includes('Not Found')) {
                // Try next source
                const currentIndex = sources.indexOf(videoPlayer.src);
                if (currentIndex < sources.length - 1) {
                    console.log('Source failed, trying next...');
                    videoPlayer.src = sources[currentIndex + 1];
                }
            }
        } catch (e) {
            // Cross-origin restrictions might prevent checking, assume it works
            console.log('Cannot check iframe content, assuming it works');
        }
    }, 5000);
}

// Search movies
async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a movie name');
        return;
    }
    
    await fetchMovies(query, 'popularMovies', 'search');
    document.querySelector('.category-title').textContent = `Search Results for "${query}"`;
    
    // Clear other sections to avoid confusion
    nowPlayingMoviesEl.innerHTML = '';
    topRatedMoviesEl.innerHTML = '';
    upcomingMoviesEl.innerHTML = '';
}

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    videoPlayer.src = ''; // Stop video
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        videoPlayer.src = '';
    }
});

// Search functionality
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// Initialize page with your API key
async function init() {
    console.log('Initializing MovieStream with TMDB API...');
    
    // Load multiple categories
    await Promise.all([
        fetchMovies('popular', 'popularMovies'),
        fetchMovies('now_playing', 'nowPlayingMovies'),
        fetchMovies('top_rated', 'topRatedMovies'),
        fetchMovies('upcoming', 'upcomingMovies')
    ]);
    
    console.log('MovieStream ready!');
}

// Error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/500x750?text=Image+Not+Available';
    }
}, true);

// Start the app
init();
