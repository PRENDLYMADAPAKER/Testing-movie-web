const API_KEY = "2f7637ba9b3253a84483afa03480473a";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

const hero = document.getElementById("hero");
const heroTitle = document.getElementById("hero-title");
const heroDesc = document.getElementById("hero-desc");

const rows = {
  popular: document.getElementById("popular"),
  trending: document.getElementById("trending"),
  action: document.getElementById("action"),
  horror: document.getElementById("horror"),
};

const modal = document.getElementById("modal");
const player = document.getElementById("player");
const closeBtn = document.getElementById("close");
const favBtn = document.getElementById("favBtn");

let currentMovie = null;

//////////////////////////////////////////
// FETCH FUNCTIONS
//////////////////////////////////////////

async function fetchMovies(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

//////////////////////////////////////////
// CREATE POSTER
//////////////////////////////////////////

function createPoster(movie) {
  const img = document.createElement("img");
  img.classList.add("poster");

  img.src = movie.poster_path
    ? IMG + movie.poster_path
    : "https://via.placeholder.com/300x450?text=No+Image";

  img.onclick = () => openModal(movie);

  return img;
}

//////////////////////////////////////////
// HERO
//////////////////////////////////////////

function setHero(movie) {
  hero.style.backgroundImage = `url(${IMG + movie.backdrop_path})`;
  heroTitle.textContent = movie.title;
  heroDesc.textContent = movie.overview;
}

//////////////////////////////////////////
// LOAD ROWS
//////////////////////////////////////////

async function loadRows() {
  const popular = await fetchMovies(`${BASE}/movie/popular?api_key=${API_KEY}`);
  const trending = await fetchMovies(`${BASE}/trending/movie/week?api_key=${API_KEY}`);
  const action = await fetchMovies(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=28`);
  const horror = await fetchMovies(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=27`);

  fillRow(rows.popular, popular);
  fillRow(rows.trending, trending);
  fillRow(rows.action, action);
  fillRow(rows.horror, horror);

  setHero(popular[0]);
}

function fillRow(container, movies) {
  container.innerHTML = "";
  movies.forEach(m => container.appendChild(createPoster(m)));
}

//////////////////////////////////////////
// MODAL + TRAILER
//////////////////////////////////////////

async function openModal(movie) {
  currentMovie = movie;
  modal.classList.remove("hidden");

  const res = await fetch(
    `${BASE}/movie/${movie.id}/videos?api_key=${API_KEY}`
  );
  const data = await res.json();

  const trailer = data.results.find(
    v => v.type === "Trailer" && v.site === "YouTube"
  );

  if (trailer) {
    player.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
  } else {
    player.src = "";
  }
}

closeBtn.onclick = () => {
  modal.classList.add("hidden");
  player.src = "";
};

//////////////////////////////////////////
// FAVORITES
//////////////////////////////////////////

favBtn.onclick = () => {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favs.find(f => f.id === currentMovie.id)) {
    favs.push(currentMovie);
  }

  localStorage.setItem("favorites", JSON.stringify(favs));
  loadFavorites();
};

function loadFavorites() {
  const container = document.getElementById("favorites");
  container.innerHTML = "";

  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  favs.forEach(m => container.appendChild(createPoster(m)));
}

//////////////////////////////////////////
// SEARCH
//////////////////////////////////////////

const searchInput = document.getElementById("search");
const searchResults = document.getElementById("search-results");

searchInput.addEventListener("keyup", async () => {
  const query = searchInput.value;

  if (query.length < 3) {
    searchResults.innerHTML = "";
    return;
  }

  const movies = await fetchMovies(
    `${BASE}/search/movie?api_key=${API_KEY}&query=${query}`
  );

  searchResults.innerHTML = "";
  movies.forEach(m => searchResults.appendChild(createPoster(m)));
});

//////////////////////////////////////////
// INIT
//////////////////////////////////////////

loadRows();
loadFavorites();
