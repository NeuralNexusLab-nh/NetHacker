const express = require("express");
const cookie = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");
const app = express();

// User agents to allow
const user_agent = ["Firefox", "Chrome", "Edg", "Safari", "OPR", "CriOS", "FxiOS"];

// AES encryption (fixed server key and IV)
const AES_SECRET_KEY = crypto.randomBytes(32); // server-side fixed key
const AES_IV = crypto.randomBytes(16);         // server-side fixed IV

function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", AES_SECRET_KEY, AES_IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", AES_SECRET_KEY, AES_IV);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Create hash for UA/IP/ID verification
function pass(ua, ip, id) {
  const hash = crypto.createHash("sha256");
  hash.update(`${ua}|${ip}|${id}`);
  return hash.digest("hex");
}

// Middleware
app.use(cookie());
app.use(express.json());
app.set("trust proxy", true);

// UA check + cookie setup
app.use((req, res, next) => {
  const ua = req.headers["user-agent"];
  const isAllowUa = user_agent.some(u => ua.includes(u));

  if (!isAllowUa) return res.sendFile(path.join(__dirname, "error", "403.html"));

  const id = req.cookies.id || crypto.randomBytes(16).toString("hex");
  if (!req.cookies.id) {
    res.cookie("id", id, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
  }

  const passHash = pass(ua, req.ip, id);
  if (!req.cookies.pass) {
    res.cookie("pass", passHash, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
  }

  next();
});

// Verify pass cookie
app.use((req, res, next) => {
  const ua = req.headers["user-agent"];
  if (req.cookies.pass !== pass(ua, req.ip, req.cookies.id)) {
    return res.sendFile(path.join(__dirname, "error", "403.html"));
  }
  next();
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
