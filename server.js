const express = require("express");
const sql = require("mysql2");
const cookie = require("cookie-parser");
const path = require("path");
const fs = require('fs');
const app = express();
var views;
var ips;
const blockedIPs = [
  "35.230.45.39",
  "43.130.53.252",
  "66.228.53.233",
  "66.228.56.140",
  "66.228.56.189",
  "69.164.207.190"
];

app.set('trust proxy', true);
app.use(express.json());
app.use(cookie());
app.use((req, res, next) => {
  if (blockedIPs.includes(req.ip)) {
    res.status(403).send("access denied");
  } else {
    views = Number(fs.readFileSync('views.txt', 'utf8'));
    ips = JSON.parse(fs.readFileSync('ips.json', 'utf8'));
    views++;
    ips.push(req.ip);
    ips = JSON.stringify(ips);
    views = views.toString();
    fs.writeFileSync('views.txt', views);
    fs.writeFileSync('ips.json', ips);
  next();
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.all('/ip', (req, res) => {
  res.send(req.ip);
});

app.get('/views', (req, res) => {
  res.send(views);
});

app.get('/ips', (req, res) => {
  res.send(ips);
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
