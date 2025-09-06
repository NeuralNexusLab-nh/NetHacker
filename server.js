const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const app = express();

//params
const ua = ["Firefox", "Chrome", "Edge", "Safari", "OPR", "CriOS", "FxiOS"];
const key = process.env.KEY;
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
    id = Math.floor(Math.random() * 99999999999999999999999999999999);
    res.cookie("id", id, {"HttpOnly": true, "Secure": true, "SameSite": "none"});
  } else {
    id = req.cookies.id;
  }
  next();
});

app.use(cookie());

app.use((req, res, next) => {
  var journal = JSON.parse(fs.readFileSync("journal.json"));
  journal.push({"time": new Date(), "id": req.cookies.id, "user-agent": req.headers["user-agent"], "ip": req.ip, "path": req.path});
  journal = JSON.stringify(journal);
  fs.writeFile("journal.json", journal, (err) => {});
  next();
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy": "frame-ancestors 'self';");
});
         
// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/healthz", (req, res) => {
  res.send("true");
});

app.get("/journal/:key", (req, res) => {
  if (req.params.key == key) {
    res.sendFile(path.join(__dirname, "journal.json"));
  } else {
    res.sendFile(path.join(__dirname, "error", "403.html"));
  }
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "chat.html"));
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
