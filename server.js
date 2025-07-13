const express = require("express");
const sql = require("mysql2");
const cookie = require("cookie-parser");
const path = require("path");
const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(cookie());

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.png'));
});

app.all('*', (req, res) => {
  res.status(200).send(
    `Server received a request from ${req.ip}, method: ${req.method},\n` +
    `headers: ${JSON.stringify(req.headers, null, 2)},\n` +
    `body: ${JSON.stringify(req.body, null, 2)}`
  );
});

const port = process.env.PORT || 443;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
