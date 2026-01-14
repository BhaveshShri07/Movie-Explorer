const apiKey = "8f9b1f96"; // Replace with your OMDb API Key
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('movieModal');
const modalDetails = document.getElementById('modalDetails');
const closeModal = document.querySelector('.close-modal');

// Load Dashboard Categories
window.onload = () => {
    loadCategory('2025', 'trendingGrid');
    loadCategory('Marvel', 'hollywoodGrid');
    loadCategory('Hindi', 'bollywoodGrid');
};

// --- SEARCH LOGIC ---
// Listen for Enter Key
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value.trim());
        suggestionsBox.classList.add('hidden');
    }
});

searchBtn.onclick = () => performSearch(searchInput.value.trim());

// --- SUGGESTION LOGIC ---
let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length < 3) { suggestionsBox.classList.add('hidden'); return; }

    debounceTimer = setTimeout(async () => {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Search) {
            suggestionsBox.innerHTML = data.Search.slice(0, 5).map(m => `
                <div class="suggestion-item" onclick="selectSuggestion('${m.Title}')">
                    <img src="${m.Poster !== 'N/A' ? m.Poster : 'https://via.placeholder.com/30'}">
                    <span>${m.Title} (${m.Year})</span>
                </div>
            `).join('');
            suggestionsBox.classList.remove('hidden');
        }
    }, 400);
});

function selectSuggestion(title) {
    searchInput.value = title;
    suggestionsBox.classList.add('hidden');
    performSearch(title);
}

// --- FETCH & DISPLAY ---
async function loadCategory(keyword, gridId) {
    const res = await fetch(`https://www.omdbapi.com/?s=${keyword}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Search) {
        const detailed = await Promise.all(data.Search.slice(0, 6).map(m => fetchDetails(m.imdbID)));
        displayMovies(detailed, document.getElementById(gridId));
    }
}

async function performSearch(query) {
    if (!query) return;
    document.getElementById('homeContent').classList.add('hidden');
    document.getElementById('searchResultsSection').classList.remove('hidden');
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '<p>Searching...</p>';

    const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Search) {
        const detailed = await Promise.all(data.Search.map(m => fetchDetails(m.imdbID)));
        displayMovies(detailed, resultsGrid);
    } else {
        resultsGrid.innerHTML = `<p>No results found for "${query}"</p>`;
    }
}

async function fetchDetails(id) {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
    return await res.json();
}

function displayMovies(movies, container) {
    container.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}">
            <div class="movie-info">
                <strong>${movie.Title}</strong>
                <span style="font-size:0.8rem; color:#aaa">${movie.Year} | ⭐ ${movie.imdbRating}</span>
                <p class="description">${movie.Plot !== 'N/A' ? movie.Plot : 'No description available.'}</p>
                <button class="read-more-btn" onclick="openModal('${movie.imdbID}')">Read More</button>
            </div>
        </div>
    `).join('');
}

// --- MODAL LOGIC ---
async function openModal(id) {
    modal.classList.remove('hidden');
    modalDetails.innerHTML = '<p>Loading details...</p>';
    const movie = await fetchDetails(id);
    modalDetails.innerHTML = `
        <div class="modal-body">
            <img src="${movie.Poster}" class="modal-poster">
            <div class="modal-text">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><span class="label">Cast:</span> ${movie.Actors}</p>
                <p><span class="label">Director:</span> ${movie.Director}</p>
                <p><span class="label">Genre:</span> ${movie.Genre}</p>
                <p><span class="label">Plot:</span> ${movie.Plot}</p>
                <p><span class="label">Runtime:</span> ${movie.Runtime}</p>
            </div>
        </div>
    `;
}

closeModal.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); };