const express = require("express");
const sql = require("mysql2");
const cookie = require("cookie-parser");
const path = require("path");
const fs = require('fs');
const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(cookie());

app.get('/', (req, res) => {
  res.send('example text share website<br>try to GET "https://nethacker.onrender.com/submit/{ID_HERE}/{TEXT_HERE}" to submit<br>and GET https://nethacker.onrender.com/share/{ID_HERE} to view the text');
};

app.get('/submit/:id/:text', (req, res) => {
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
  console.log(`Server is listening on port ${port}`);
});
