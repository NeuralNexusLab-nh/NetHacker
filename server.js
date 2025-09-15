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
function isBase64(str) {
  if (typeof str !== "string" || str.length % 4) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str) &&
         Buffer.from(str, "base64").toString("base64") === str;
}

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

app.use(cookie());

app.use((req, res, next) => {
  fs.readFile("journal.json", "utf8", (err, data) => {
    if (err) res.redirect("message/ERROR-503/FS%20ERROR");
    else {
      var journal = JSON.parse(data);
      journal.push({"time": new Date(), "ip": req.ip, "id": req.cookies.id, "user-agent": req.headers["user-agent"], "path": req.path});
      journal = JSON.stringify(journal);
      fs.writeFile("journal.json", journal, (err) => {res.redirect("/message/ERROR-500/FS%20ERROR")});
    }
    next();
})});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self';");
  next();
});
         
// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/pages/:path", (req, res) => {
  res.sendFile(__dirname, "pages", req.params.path + ".html");
});

app.get("/base64", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "base64.html"));
});

app.get("/base64/:str", (req, res) => {
  if (isBase64(req.params.str)) {
    res.send(Buffer.from(req.params.str, "base64").toString("utf-8"));
  } else {
    res.send(Buffer.from(req.params.str, "utf-8"));
  }
});

app.post("/base64", (req, res) => {
  if (isBase64(req.body)) {
    res.send(Buffer.from(req.body, "base64").toString("utf-8"));
  } else {
    res.send(Buffer.from(req.body, "utf-8"));
  }
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
