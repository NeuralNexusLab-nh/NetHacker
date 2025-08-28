const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const fs = require("fs");
const app = express();

//parameters
const user_agent = ["Firefox", "Chrome", "Edg", "Safari", "OPR", "CriOS", "FxiOS"]

//functions
function encrypt(text) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const payload = {
    encrypted,
    key: key.toString("hex"),
    iv: iv.toString("hex")
  };

  return JSON.stringify(payload);
}

function decrypt(payloadStr) {
  const payload = JSON.parse(payloadStr);
  const key = Buffer.from(payload.key, "hex");
  const iv = Buffer.from(payload.iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(payload.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

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
  const id = crypto.randomBytes(16).toString("hex");
  var isAllowUa = false;
  for (let i = 0; i < user_agent.length; i++) {
    const ua = req.headers["user-agent"]
    if (ua.includes(user_agent[i])) {
      isAllowUa = true;
    }
  }
  if (isAllowUa) {
      if (!req.cookies.id) {
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
