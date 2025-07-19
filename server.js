const express = require("express");
const sql = require("mysql2");
const cookie = require("cookie-parser");
const path = require("path");
const fs = require('fs');
const app = express();
var views;
var ips;
const blockedIPs = [
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
    if (!ips[req.ip]) {
      ips[req.ip] = {"count": 1};
    } else ips[req.ip].count++;
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

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, "robots.txt"));
});

app.all('/ip', (req, res) => {
  res.send(req.ip);
});

app.get('/views', (req, res) => {
  res.send(views);
});

app.get('/ips', (req, res) => {
  res.json(JSON.parse(ips));
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
