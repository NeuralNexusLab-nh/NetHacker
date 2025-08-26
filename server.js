const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const fs = require("fs");
const app = express();

//parameters
const salt = process.env.SALT;
const key = process.env.KEY;
const user_agent = ["Firefox", "Chrome", "Edg", "Safari", "OPR", "CriOS", "FxiOS"]
const secret = process.env.SECRET;

//functions
function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-ecb", key, null);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv("aes-256-ecb", key, null);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function pass (ua, ip, id) {
  let pass = "";
  pass += encrypt(ua);
  pass += encrypt(ip);
  pass += encrypt(id);
  return pass;
}

app.use(cookie());
app.use(express.json());
app.set("trust proxy", true);

app.use((req, res, next) => {
  var isAllowUa = false;
  for (let i = 0; i < user_agent.length; i++) {
    if (req.headers["user-agent"].include(user_agent[i])) {
      isAllowUa = true;
    }
  }
  if (isAllowUa) {
      if (!req.cookies.id) {
        const id = crypto.randomBytes(16).toString("hex");
        res.cookie("id", id, {
          maxAge: 10000 * 60 * 60 * 24 * 365 * 10,
          httpOnly: true,
          secure: true,
          sameSite: "lax"
        })};
    if (!req.cookies.pass) {
        res.cookie("pass", pass(req.headers["user-agent"], req.ip, id), {
        maxAge: 10000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });
      next();
  } else {
      res.sendFile("/error/403.html");
    }
}});

app.use((req, res, next) => {
  if (req.cookies.pass !== pass(req.headers["user-agent"], req.ip, req.cookies.id)) {
    res.sendFile("/error/403.html")
  }
});

      
app.get("/", (req, res) => {
  res.sendFile("/pages/index.html");
});

app.post("/encrytion", (req, res) => {
  text = req.params.text;
  type = req.params.type;
  if (type == "decrypt") {
    res.send(decrypt(text));
  } else {
    res.send(encrypt(text));
  }
});

app.get("/style.css", (req, res) => {
  res.sendFile("/style.css");
});

app.get("/donation", (req, res) => {
  res.sendFile("/pages/donation.html");
});

app.get("/robots.txt", (req, res) => {
  res.sendFile("/pages/robots.txt");
});

app.get("*", (req, res) => {
  res.sendFile("/error/404.html");
});


app.listen(process.env.PORT, () => { console.log(`Server running at http://localhost:${process.env.PORT}.`) });
