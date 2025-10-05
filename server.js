const express = require("express");
const cookie = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { OpenAI } = require('openai');
const api = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: process.env.API,
});
const app = express();

//params
const ua = ["Firefox", "Chrome", "Edge", "Safari", "OPR", "CriOS", "FxiOS", "Google", "NetHacker"];

function ai(history, question) {
  return api.chat.completions
    .create({
      model: 'google/gemma-3-12b-it',
      messages: [
        { role: 'system', content: `You are a Gemma-3 model named "NetAnalyst", you can help user to do many things. And you can analysis to do Website Penetration and Bug Bounty very well. Or you can just talk to user. This is you and user's chat history: ${history}`},
        { role: 'user', content: question },
      ],
    })
    .then(result => result.choices[0].message.content)
    .catch(err => {
      console.error('Error calling AI:', err.message || err);
      throw err;
    });
}


// Middleware
app.use(cookie());
app.use(express.json());
app.set("trust proxy", true);
app.use((req, res, next) => {
  if (req.headers["host"] != "nethacker.cloud") {
    res.redirect("https://nethacker.cloud");
  } else {
    next();
  }
});
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
    id = Math.floor(Math.random() * 9999 + Math.random() * 9999 + Math.random() * 9999 + Math.random() * 9999 + Math.random() * 9999 + Math.random() * 9999 + Math.random() * 9999 + Math.random() * 9999).toString(16);
    res.cookie("id", id, {"httpOnly": true, "secure": true, "SameSite": "none"});
  } else {
    id = req.cookies.id;
  }
  next();
});

app.use(cookie());

app.use((req, res, next) => {
  data = `${new Date()} ${req.cookies.id || "0000"} ${req.ip} ${req.method} ${req.path}`;
  var journal = JSON.parse(fs.readFileSync("./journal.json", "utf8"));
  journal.push(data);
  journal = JSON.stringify(journal);
  fs.writeFile("./journal.json", journal, (err) => {
    next();
  });
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/pw", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "pw.html"));
});

app.get("/journal/:key", (req, res) => {
  if (req.params.key == "0902") {
    res.sendFile(path.join(__dirname, "journal.json"));
  } else {
    res.send("Permission Required");
  }
});

app.get("/ai", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "ai.html"));
});

app.post("/api", (req, res) => {
  if (req.headers["referer"].includes("nethacker.cloud")) {
    const q = req.body.data;
    const ht = req.body.history;
    ai(ht, q).then(data => {
      res.send(data);
    });
  } else {
    res.sendFile(path.join(__dirname, "error", "403.html"));
  }
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
