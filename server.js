const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'CineverseBD' 
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.stack);
    return;
  }
  console.log('Conectado ao MySQL');
});


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


app.get('/api/favorites/:user_id', (req, res) => {
  let sql = 'SELECT m.* FROM Favorites f JOIN Movies m ON f.movie_id = m.id WHERE f.user_id = ?';
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) {
      console.error('Erro ao obter filmes favoritos:', err.stack);
      res.status(500).send('Erro ao obter filmes favoritos');
      return;
    }
    res.json(results);
  });
});


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


app.delete('/api/favorites', (req, res) => {
  let sql = 'DELETE FROM Favorites WHERE user_id = ? AND movie_id = ?';
  db.query(sql, [req.body.user_id, req.body.movie_id], (err, result) => {
    if (err) {
      console.error('Erro ao remover filme dos favoritos:', err.stack);
      res.status(500).send('Erro ao remover filme dos favoritos');
      return;
    }
    res.json({ message: 'Filme removido dos favoritos' });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
