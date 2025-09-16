const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const app = express();

//params
const ua = ["Firefox", "Chrome", "Edge", "Safari", "OPR", "CriOS", "FxiOS"];

// Middleware
app.use(cookie());
app.use(express.json());
app.set("trust proxy", true);
app.use((req, res, next) => {
  var isUa = false;
  for (let i = 0; i < ua.length; i++) {
    if (req.headers["user-agent"].includes(ua[i])) {
      isUa = true;
    }
  }
  if (isUa) {
    next();
  } else {
    res.sendFile(path.join(__dirname, "error", "403.html"));
  }
});

app.use((req, res, next) => {
  var id = "";
  if (!req.cookies.id) {
    id = Math.floor(Math.random() * 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999).toString(16);
    res.cookie("id", id, {"httpOnly": true, "secure": true, "SameSite": "none"});
  } else {
    id = req.cookies.id;
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/random", (req, res) => {
  res.send(Math.floor(Math.random() * 9999999999999999999999999999999999999999999999999999999999999));
});

app.get("/hex", (req, res) => {
  res.send(Math.floor(Math.random() * 9999999999999999999999999999999999999999999999999999999999999).toString(16));
});

app.get("/headers", (req, res) => {
  res.send(req.headers);
});

app.get("/ads.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "ads.txt"));
});

app.get("/ip", (req, res) => {
  res.send(req.ip);
});

app.get("/base64", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "base64.html"));
});

app.get("/healthz", (req, res) => {
  res.send("true");
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/message/:title/:sum", (req, res) => {
  fs.readFile("/pages/message.html", "utf8", (err, data) => {
    if (err) res.send(err);
    else {
      html = data;
      html.replace("[TITLE]", req.params.title);
      html.replace("[SUM]", req.params.sum);
      res.send(html);
    }
  });
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "robots.txt"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "error", "404.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
