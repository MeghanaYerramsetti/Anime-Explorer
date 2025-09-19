/**
 * Script for Anime Netflix Home Page and Search
 */

// List of top popular anime IDs to prioritize on home page
const topPopularAnimeIds = [
  20,    // Naruto
  1735,  // Naruto Shippuden
  34566, // Boruto: Naruto Next Generations
  21,    // One Piece
  40748, // Demon Slayer
  51690, // Jujutsu Kaisen
  50265, // Spy x Family
  34599, // Black Clover
  269,   // Bleach
  1535,  // Death Note
  813    // Dragon Ball
];

// Function to fetch top animes from Jikan API
async function fetchTopAnimes() {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching top animes:', error);
    return [];
  }
}

// Function to load anime grid with top popular animes prioritized
async function loadAnimeGrid() {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '';

  let animes = await fetchTopAnimes();

  // Separate top popular animes and others
  const topPopularAnimes = [];
  const otherAnimes = [];

  animes.forEach(anime => {
    if (topPopularAnimeIds.includes(anime.mal_id)) {
      topPopularAnimes.push(anime);
    } else {
      otherAnimes.push(anime);
    }
  });

  // Sort top popular animes in the order of topPopularAnimeIds
  topPopularAnimes.sort((a, b) => {
    return topPopularAnimeIds.indexOf(a.mal_id) - topPopularAnimeIds.indexOf(b.mal_id);
  });

  // Combine top popular animes first, then others
  const sortedAnimes = [...topPopularAnimes, ...otherAnimes];

  // Render anime cards
  sortedAnimes.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.onclick = () => window.location.href = `anime-detail.html?id=${anime.mal_id}`;
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" class="anime-poster" />
      <div class="anime-title">${anime.title}</div>
    `;
    grid.appendChild(card);
  });
}

// Search function to fetch animes by query from Jikan API search endpoint
async function handleSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '';

  if (!query) {
    // If search is empty, reload full grid
    await loadAnimeGrid();
    return;
  }

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`);
    const data = await response.json();
    const searchResults = data.data;

    if (!searchResults || searchResults.length === 0) {
      grid.innerHTML = '<p>No results found.</p>';
      return;
    }

    searchResults.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.onclick = () => window.location.href = `anime-detail.html?id=${anime.mal_id}`;
      card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" class="anime-poster" />
        <div class="anime-title">${anime.title}</div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error searching animes:', error);
    grid.innerHTML = '<p>Error fetching search results.</p>';
  }
}

async function loadTopAnimes() {
  const topGrid = document.getElementById('topAnimesGrid');
  topGrid.innerHTML = '';

  const titleOverrides = {
    // Removed Kimetsu no Yaiba and Jujutsu Kaisen from titleOverrides as per request
  };

  try {
    const topAnimes = [];
    for (const id of topPopularAnimeIds) {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        const data = await response.json();
        if (data.data) {
          console.log(`Fetched anime: ${data.data.title}`);
          topAnimes.push(data.data);
        } else {
          console.warn(`No data for anime ID: ${id}`);
        }
      } catch (err) {
        console.error(`Error fetching anime ID ${id}:`, err);
      }
      // Add delay of 1 second between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Sort top animes in the order of topPopularAnimeIds
    topAnimes.sort((a, b) => {
      return topPopularAnimeIds.indexOf(a.mal_id) - topPopularAnimeIds.indexOf(b.mal_id);
    });

    topAnimes.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.onclick = () => window.location.href = `anime-detail.html?id=${anime.mal_id}`;
      const displayTitle = titleOverrides[anime.mal_id] || anime.title;
      card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${displayTitle}" class="anime-poster" />
        <div class="anime-title">${displayTitle}</div>
      `;
      topGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading top animes:', error);
    topGrid.innerHTML = '<p>Error loading top animes.</p>';
  }
}

// Initialize grids on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTopAnimes();
  loadAnimeGrid();
});
