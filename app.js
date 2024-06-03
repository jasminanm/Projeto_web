


async function fetchMovies() {
  const tipo = localStorage.getItem('tipo');
  const genero = localStorage.getItem('genero');
  const ano = localStorage.getItem('ano');

  
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=ed7096a6838c6fc301d4307e2994b3b5&language=pt&with_genres=${genero}&primary_release_year=${ano}&query=${tipo}`;

  try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results;
  } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
  }
}

async function renderMovies() {
  const movieList = document.getElementById('movie-list');

  // Fetch movies
  const movies = await fetchMovies();

  // Clear previous content
  movieList.innerHTML = '';

  // Render movies as list items
  movies.forEach(movie => {
      const listItem = document.createElement('li');
      listItem.textContent = movie.title;
      movieList.appendChild(listItem);
  });
}

// Call the renderMovies function when the page loads
document.addEventListener('DOMContentLoaded', renderMovies);



document.addEventListener("DOMContentLoaded", function () {
  // Arrow Clicks to Scroll Movie List
  const arrows = document.querySelectorAll(".arrow");
  const movieLists = document.querySelectorAll(".movie-list");

  arrows.forEach((arrow, i) => {
    let clickCounter = 0;
    arrow.addEventListener("click", () => {
      const ratio = Math.floor(window.innerWidth / 270);
      clickCounter++;
      if (movieLists[i].querySelectorAll("img").length - (4 + clickCounter) + (4 - ratio) >= 0) {
        movieLists[i].style.transform = `translateX(${
          movieLists[i].computedStyleMap().get("transform")[0].x.value - 300
        }px)`;
      } else {
        movieLists[i].style.transform = "translateX(0)";
        clickCounter = 0;
      }
    });
    console.log(Math.floor(window.innerWidth / 270));
  });

  // Dark Mode Toggle
  const ball = document.querySelector(".toggle-ball");
  const items = document.querySelectorAll(
    ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle"
  );

  ball.addEventListener("click", () => {
    items.forEach((item) => {
      item.classList.toggle("active");
    });
    ball.classList.toggle("active");
  });

  // Generate Random Movie or Fetch Movie from TMDb
  const generateButton = document.getElementById("generate-movie");
  const movieResultDiv = document.getElementById("movie-result");

  generateButton.addEventListener("click", function () {
    const tipo = document.getElementById("tipo").value;
    const genero = document.getElementById("genero").value;
    const ano = document.getElementById("ano").value;

    // Use getRandomMovie for local random movie or fetch from TMDb
    if (tipo || genero || ano) {
      fetchMovieFromTMDb(genero, ano);
    } else {
      const randomMovie = getRandomMovie(tipo, genero, ano);
      movieResultDiv.innerHTML = `<p><strong>Filme Aleatório:</strong> ${randomMovie}</p>`;
    }
  });

  function getRandomMovie(tipo, genero, ano) {
    const movies = [
      { title: "Filme 1", tipo: "Live Action", genero: "Ação", ano: "2020" },
      { title: "Filme 2", tipo: "Animado", genero: "Comédia", ano: "2015" },
      { title: "Filme 3", tipo: "Live Action", genero: "Drama", ano: "2010" },
    ];

    const filteredMovies = movies.filter(movie => {
      return (
        (tipo === "" || movie.tipo.toLowerCase() === tipo.toLowerCase()) &&
        (genero === "" || movie.genero.toLowerCase() === genero.toLowerCase()) &&
        (ano === "" || movie.ano === ano)
      );
    });

    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    return filteredMovies[randomIndex].title;
  }

  function fetchMovieFromTMDb(genero, ano) {
    const apiKey = 'ed7096a6838c6fc301d4307e2994b3b5';
    let genreId = '';

    switch (genero.toLowerCase()) {
      case 'ação': genreId = '28'; break;
      case 'aventura': genreId = '12'; break;
      case 'comédia': genreId = '35'; break;
      case 'drama': genreId = '18'; break;
      case 'terror': genreId = '27'; break;
      case 'ficção científica': genreId = '878'; break;
      // Add more genre cases as needed
      default: genreId = '';
    }

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&primary_release_year=${ano}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const movie = data.results[0];
          movieResultDiv.innerHTML = `
            <h2>${movie.title}</h2>
            <p>${movie.overview}</p>
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
          `;
        } else {
          movieResultDiv.innerHTML = '<p>No movies found.</p>';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        movieResultDiv.innerHTML = '<p>Failed to fetch movie data.</p>';
      });
  }
});

Server.js


const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Configuração da conexão com o MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Update with your MySQL user
  password: 'Pedrinh@222', // Update with your MySQL password
  database: 'CineverseBD' // Update with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.stack);
    return;
  }
  console.log('Conectado ao MySQL');
});

// Endpoint para obter filmes
app.get('/api/movies', (req, res) => {
  let sql = 'SELECT * FROM Movies';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao obter filmes:', err.stack);
      res.status(500).send('Erro ao obter filmes');
      return;
    }
    res.json(results);
  });
});

// Endpoint para adicionar um filme aos favoritos
app.post('/api/favorites', (req, res) => {
  let favorite = { user_id: req.body.user_id, movie_id: req.body.movie_id };
  let sql = 'INSERT INTO Favorites SET ?';
  db.query(sql, favorite, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar filme aos favoritos:', err.stack);
      res.status(500).send('Erro ao adicionar filme aos favoritos');
      return;
    }
    res.json({ message: 'Filme adicionado aos favoritos' });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
document.addEventListener("DOMContentLoaded", function () {
  // Arrow Clicks to Scroll Movie List
  initMovieListScrolling();

  // Dark Mode Toggle
  initDarkModeToggle();

  // Generate Random Movie or Fetch Movie from TMDb
  initMovieGenerator();

  // Fetch and Display Movies Data with Charts
  initMovieDataAndCharts();
});

// Arrow Clicks to Scroll Movie List
function initMovieListScrolling() {
  const arrows = document.querySelectorAll(".arrow");
  const movieLists = document.querySelectorAll(".movie-list");

  arrows.forEach((arrow, i) => {
    const itemNumber = movieLists[i].querySelectorAll("img").length;
    let clickCounter = 0;
    arrow.addEventListener("click", () => {
      const ratio = Math.floor(window.innerWidth / 270);
      clickCounter++;
      if (itemNumber - (4 + clickCounter) + (4 - ratio) >= 0) {
        movieLists[i].style.transform = `translateX(${
          movieLists[i].computedStyleMap().get("transform")[0].x.value - 300
        }px)`;
      } else {
        movieLists[i].style.transform = "translateX(0)";
        clickCounter = 0;
      }
    });
    console.log(Math.floor(window.innerWidth / 270));
  });
}

// Dark Mode Toggle
function initDarkModeToggle() {
  const ball = document.querySelector(".toggle-ball");
  const items = document.querySelectorAll(
    ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle"
  );

  ball.addEventListener("click", () => {
    items.forEach((item) => {
      item.classList.toggle("active");
    });
    ball.classList.toggle("active");
  });
}

// Generate Random Movie or Fetch Movie from TMDb
function initMovieGenerator() {
  const generateButton = document.getElementById("generate-movie");
  const movieResultDiv = document.getElementById("movie-result");

  generateButton.addEventListener("click", function () {
    const tipo = document.getElementById("tipo").value;
    const genero = document.getElementById("genero").value;
    const ano = document.getElementById("ano").value;

    if (tipo || genero || ano) {
      fetchMovieFromTMDb(genero, ano);
    } else {
      const randomMovie = getRandomMovie(tipo, genero, ano);
      movieResultDiv.innerHTML = `<p><strong>Filme Aleatório:</strong> ${randomMovie}</p>`;
    }
  });

  function getRandomMovie(tipo, genero, ano) {
    const movies = [
      { title: "Filme 1", tipo: "Live Action", genero: "Ação", ano: "2020" },
      { title: "Filme 2", tipo: "Animado", genero: "Comédia", ano: "2015" },
      { title: "Filme 3", tipo: "Live Action", genero: "Drama", ano: "2010" },
    ];

    const filteredMovies = movies.filter(movie => {
      return (
        (tipo === "" || movie.tipo.toLowerCase() === tipo.toLowerCase()) &&
        (genero === "" || movie.genero.toLowerCase() === genero.toLowerCase()) &&
        (ano === "" || movie.ano === ano)
      );
    });

    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    return filteredMovies[randomIndex].title;
  }

  function fetchMovieFromTMDb(genero, ano) {
    const apiKey = 'ed7096a6838c6fc301d4307e2994b3b5';
    let genreId = getGenreId(genero);

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&primary_release_year=${ano}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const moviesHtml = data.results.map(movie => `
            <div class="movie">
              <h2>${movie.title}</h2>
              <p>${movie.overview}</p>
              <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            </div>
          `).join('');
          movieResultDiv.innerHTML = moviesHtml;
        } else {
          movieResultDiv.innerHTML = '<p>No movies found.</p>';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        movieResultDiv.innerHTML = '<p>Failed to fetch movie data.</p>';
      });
  }

  function getGenreId(genero) {
    switch (genero.toLowerCase()) {
      case 'ação': return '28';
      case 'aventura': return '12';
      case 'comédia': return '35';
      case 'drama': return '18';
      case 'terror': return '27';
      case 'ficção científica': return '878';
      // Add more genre cases as needed
      default: return '';
    }
  }
}

// Fetch and Display Movies Data with Charts
async function initMovieDataAndCharts() {
  const apiKey = 'ed7096a6838c6fc301d4307e2994b3b5';
  const genres = {
    28: 'Ação',
    35: 'Comédia',
    18: 'Drama',
    27: 'Terror',
    10749: 'Romance'
  };

  const genreCounts = await fetchMoviesByGenre();
  const movies = await fetchMovies();

  const genreLabels = Object.keys(genreCounts);
  const genreData = Object.values(genreCounts);
  const totalMovies = genreData.reduce((sum, value) => sum + value, 0);

  renderBarChart(genreLabels, genreData);
  renderPieChart(genreLabels, genreData, totalMovies);
  displayMovieRatings(movies);

  async function fetchMoviesByGenre() {
    let genreCounts = { 'Ação': 0, 'Comédia': 0, 'Drama': 0, 'Terror': 0, 'Romance': 0 };

    for (const genreId in genres) {
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&year=2023`);
      const data = await response.json();
      genreCounts[genres[genreId]] = data.total_results;
    }

    return genreCounts;
  }

  async function fetchMovies() {
    const movieIds = [550, 551, 552, 553, 554]; // Example movie IDs
    const movies = [];

    for (const movieId of movieIds) {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
      const data = await response.json();
      movies.push({ title: data.title, rating: data.vote_average });
    }

    return movies;
  }

  function renderBarChart(labels, data) {
    const ctxBar = document.getElementById('barChart').getContext('2d');
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Movies',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderPieChart(labels, data, totalMovies) {
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Número de filmes',
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const percentage = ((value / totalMovies) * 100).toFixed(2) + '%';
                    return {
                      text: `${label}: ${percentage}`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor[i],
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: !chart.getDataVisibility(i),
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          title: {
            display: true,
            text: 'Percentagem de géneros de filmes em 2023'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const percentage = ((value / totalMovies) * 100).toFixed(2);
                return `${context.label}: ${percentage}%`;
              }
            }
          }
        }
      }
    });
  }

  function displayMovieRatings(movies) {
    const ratings = movies.map(movie => movie.rating);
    const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    const bestRating = Math.max(...ratings);
    const worstRating = Math.min(...ratings);

    const movieList = document.getElementById('movieList');
    movies.forEach(movie => {
      const listItem = document.createElement('li');
      listItem.textContent = `${movie.title}: ${movie.rating}`;
      movieList.appendChild(listItem);
    });

    document.getElementById('avgRating').textContent = avgRating;
    document.getElementById('bestRating').textContent = bestRating;
    document.getElementById('worstRating').textContent = worstRating;
  }
}
