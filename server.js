const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();

//params
const ua = ["Firefox", "Chrome", "Edge", "Safari", "OPR", "CriOS", "FxiOS"];
const salt = process.env.SALT;
var viewpass = "";

//function
function pass (ua, id, ip) {
  txt = ua + id + ip;
  bcrypt.hash(txt, salt, (err, hashed) => {
    viewpass = hashed;
  });
}

// Middleware
app.use(cookie());
app.use(express.json());
app.set("trust proxy", true);
//pass && id setup
app.use((req, res, next) => {
  if (!req.cookies.id) {
    var id = Math.floor(Math.random() * 9999999999999999999);
    res.cookie("id", id, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
  }
  if (!id) {
    var id = req.cookies.id;
  }
  if (!req.cookies.pass) {
    pass(req.headers["user-agent"], id, req.ip);
    res.cookie("pass", viewpass, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
  }
  next();
});
//check pass && ua
app.use(cookie());
app.use((req, res, next) => {
  pass(req.headers["user-agent"], req.cookies.id, req.ip);
  if (req.cookies.pass == viewpass) {
    for (let i = 0; i < ua.length; i++) {
      if (req.headers["user-agent"].includes(ua[i])) {
        next();
      } else {
        res.sendFile(path.join(__dirname, "error", "inspector.html"));
      }
    }
  } else {
    res.sendFile(path.join(__dirname, "error", "inspector.html"));
  }
});


// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.post("/encrytion", (req, res) => {
  const { text, type } = req.body;

  if (!text || !type) return res.status(400).send({ error: "Missing text or type" });

  try {
    if (type === "decrypt") {
      const decrypted = decrypt(text);
      res.send({ result: decrypted });
    } else {
      const encrypted = encrypt(text);
      res.send({ result: encrypted });
    }
  } catch (err) {
    res.status(500).send({ error: "Encryption/Decryption failed", message: err.message });
  }
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
