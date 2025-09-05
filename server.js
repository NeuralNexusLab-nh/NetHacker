const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const path = require("path");
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


// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/donation", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "donation.html"));
});

app.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "payment.html"));
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
