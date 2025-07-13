const express = require("express");
const sql = require("mysql2");
const cookie = require("cookie-parser");
const app = express();

app.set('trust proxy', true);
app.use(express.json());

app.all('*', (req, res) => {
  res.status(200).send(`server get a request from ${req.ip}, method is ${req.method}, headers is ${req.headers || none} and body is ${req.body || none}`);
});

app.listen(process.env.PORT)
