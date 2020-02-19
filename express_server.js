const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};
const generateRandomString = length => {
  const strs = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  let randomStr = "";
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * 62);
    randomStr += strs[index];
  }
  return randomStr;
};
const isUniqueEmail = email => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return false;
    }
  }
  return true;
};
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  // unique shortURL
  while (urlDatabase[shortURL]) {
    shortURL = generateRandomString(6);
  }
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userRandomID = generateRandomString(6);
  // unique ID
  while (users[userRandomID]) {
    userRandomID = generateRandomString(6);
  }
  // test empty email, password and unique email
  if (/^\s*$/.test(req.body.email) || /^\s*$/.test(req.body.password)) {
    res.statusCode = 400;
    res.send(`Error ${res.statusCode}: invalid email or password`);
  } else if (!isUniqueEmail(req.body.email)) {
    res.statusCode = 400;
    res.send(`Error ${res.statusCode}: email already`);
  } else {
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: req.body.password
    };
    res.redirect("./urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (/^\s*$/.test(req.body.email) || /^\s*$/.test(req.body.password)) {
    res.statusCode = 400;
    res.send(`Error ${res.statusCode}: invalid email or password`);
  }
  if (isUniqueEmail(req.body.email)) {
    res.statusCode = 403;
    res.send(`Error ${res.statusCode}: email is not registered`);
  }
  for (let user in users) {
    if (
      users[user]["email"] === req.body.email &&
      users[user]["password"] === req.body.password
    ) {
      res.cookie("user_id", user);
      res.redirect("/urls");
    }
  }
  res.statusCode = 403;
  res.send(`Error ${res.statusCode}: wrong password`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("./urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    // when enter invalid shortURL
    res.redirect("/urls/new");
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // when enter invalid shortURL
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect("/urls/new");
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = `http://${req.body.longURL}`;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
