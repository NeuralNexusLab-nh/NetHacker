const express = require("express");
const sql = require("mysql2");
const cookie = require("cookie-parser");
const path = require("path");
const fs = require('fs');
const app = express();
var views;

app.set('trust proxy', true);
app.use(express.json());
app.use(cookie());
app.use((req, res, next) => {
  views = Number(fs.readFileSync('views.txt', 'utf8'));
  views++;
  views = views.toString();
  fs.writeFileSync('views.txt', views);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.get('/views', (req, res) => {
  res.send(views);
});

app.get('/hi/:user', (req, res) => {
  res.send(`Hello, ${req.params.user}`);
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.png'));
});

app.all('*', (req, res) => {
  res.status(404).send(
    'ERROR 404: request path is not found!'
  );
});

const port = process.env.PORT || 443;
app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
