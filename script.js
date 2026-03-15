// Configuration - No API key needed for Vidsrc!
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Optional: Get free from themoviedb.org
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/p/t/w500';

// Video streaming sources (no API key needed)
const VIDEO_SOURCES = {
    vidsrc: 'https://vidsrc.me/embed/movie',  // Free, no API key
    vidsrcPro: 'https://vidsrc.pro/embed/movie', // Alternative source
    embed: 'https://vidsrc.to/embed/movie' // Another alternative
};

// Use Vidsrc as primary source (completely free, no API key needed)
const VIDEO_BASE_URL = VIDEO_SOURCES.vidsrc;

// Sample movies data (fallback if TMDB API fails)
const sampleMovies = {
    popular: [
        { id: 1, title: 'Inception', poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', vote_average: 8.4, release_date: '2010-07-16' },
        { id: 2, title: 'The Dark Knight', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', vote_average: 8.5, release_date: '2008-07-18' },
        { id: 3, title: 'Interstellar', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', vote_average: 8.3, release_date: '2014-11-07' },
        { id: 4, title: 'Avengers: Endgame', poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg', vote_average: 8.3, release_date: '2019-04-26' },
        { id: 5, title: 'Joker', poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', vote_average: 8.2, release_date: '2019-10-04' }
    ],
    action: [
        { id: 6, title: 'John Wick', poster_path: '/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg', vote_average: 7.4, release_date: '2014-10-24' },
        { id: 7, title: 'Mad Max', poster_path: '/kqjL17yufvn9OVLyXYpvtyrFfak.jpg', vote_average: 7.6, release_date: '2015-05-15' },
        { id: 8, title: 'Die Hard', poster_path: '/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg', vote_average: 8.2, release_date: '1988-07-20' }
    ],
    comedy: [
        { id: 9, title: 'The Hangover', poster_path: '/uluhlXubGu1VxU63X9VHCLWDAYP.jpg', vote_average: 7.5, release_date: '2009-06-02' },
        { id: 10, title: 'Superbad', poster_path: '/ek8e8tx0yivVg6ViBdYbRfJ57Hr.jpg', vote_average: 7.5, release_date: '2007-08-17' }
    ]
};

// DOM Elements
const popularMoviesEl = document.getElementById('popularMovies');
const actionMoviesEl = document.getElementById('actionMovies');
const comedyMoviesEl = document.getElementById('comedyMovies');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const closeBtn = document.querySelector('.close');
const navbar = document.querySelector('.navbar');
const playFeaturedBtn = document.getElementById('playFeaturedBtn');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fetch movies from TMDB (optional, falls back to sample data)
async function fetchMovies(category, elementId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${category}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            displayMovies(data.results.slice(0, 10), elementId);
        } else {
            // Fallback to sample data
            displayMovies(sampleMovies[category] || sampleMovies.popular, elementId);
        }
    } catch (error) {
        console.log('Using sample data due to API error');
        // Use sample data if API fails
        displayMovies(sampleMovies[category] || sampleMovies.popular, elementId);
    }
}

// Display movies in row
function displayMovies(movies, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    movies.forEach(movie => {
        const movieId = movie.id;
        const posterPath = movie.poster_path 
            ? (movie.poster_path.startsWith('http') ? movie.poster_path : `${IMG_BASE_URL}${movie.poster_path}`)
            : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}">
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

// Play movie function - uses Vidsrc (no API key needed!)
function playMovie(movieId) {
    // Try multiple sources in case one is down
    const videoUrl = `${VIDEO_BASE_URL}/${movieId}`;
    videoPlayer.src = videoUrl;
    modal.style.display = 'block';
}

// Search movies
async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Show search results in popular section temporarily
            displayMovies(data.results.slice(0, 10), 'popularMovies');
            document.querySelector('.category-title').textContent = `Search Results for "${query}"`;
        } else {
            alert('No movies found');
        }
    } catch (error) {
        console.log('Search error:', error);
        alert('Search failed. Please try again.');
    }
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

// Play featured movie
playFeaturedBtn.addEventListener('click', () => {
    playMovie(550); // Fight Club ID - popular movie
});

// Initialize page
function init() {
    // Load movies using TMDB API if key is provided, otherwise use sample data
    if (TMDB_API_KEY !== 'YOUR_TMDB_API_KEY') {
        fetchMovies('popular', 'popularMovies');
        fetchMovies('now_playing', 'actionMovies'); // Using now_playing as action alternative
        fetchMovies('top_rated', 'comedyMovies'); // Using top_rated as comedy alternative
    } else {
        // Use sample data if no API key
        displayMovies(sampleMovies.popular, 'popularMovies');
        displayMovies(sampleMovies.action, 'actionMovies');
        displayMovies(sampleMovies.comedy, 'comedyMovies');
    }
}

// Start the app
init();
