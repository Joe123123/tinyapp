const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const {
  generateRandomString,
  isUniqueEmail,
  urlsForUser,
  isEmptyString,
  getFormatDate
} = require("./helper");
const app = express();
const PORT = 8080;
const urlDatabase = {};
const users = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  methodOverride(function(req) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"]
  })
);
app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    let urls = urlsForUser(req.session["user_id"], urlDatabase);
    let templateVars = {
      urls: urls,
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user: users[req.session["user_id"]],
      warningMessage: "Please login first!"
    };
    res.render("warning", templateVars);
  }
});

// post from /urls/new
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  // unique shortURL
  while (urlDatabase[shortURL]) {
    shortURL = generateRandomString(6);
  }
  urlDatabase[shortURL] = {
    longURL: `http://${req.body.longURL}`,
    createDate: getFormatDate(),
    visited: 0,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userRandomID = generateRandomString(6);
  // unique ID
  while (users[userRandomID]) {
    userRandomID = generateRandomString(6);
  }
  // test empty email, password and unique email
  if (isEmptyString(req.body.email, req.body.password)) {
    res.status(400);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Invalid email or password"
    };
    res.render("error", templateVars);
  } else if (!isUniqueEmail(req.body.email, users)) {
    res.status(400);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Email already exists"
    };
    res.render("error", templateVars);
  } else {
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  // test empty email, password and unique email
  if (isEmptyString(req.body.email, req.body.password)) {
    res.status(400);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Invalid email or password"
    };
    res.render("error", templateVars);
  }
  if (isUniqueEmail(req.body.email, users)) {
    res.status(403);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Email is not registered"
    };
    res.render("error", templateVars);
  }
  for (let user in users) {
    // matching email and password
    if (
      users[user]["email"] === req.body.email &&
      bcrypt.compareSync(req.body.password, users[user]["password"])
    ) {
      req.session["user_id"] = user;
      res.redirect("/urls");
    }
  }
  res.status(403);
  let templateVars = {
    user: users[req.session["user_id"]],
    errorCode: res.statusCode,
    errorMessage: "Wrong password"
  };
  res.render("error", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  urlDatabase[req.params.shortURL]["visited"] += 1;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]
  ) {
    let templateVars = {
      user: users[req.session["user_id"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      createDate: urlDatabase[req.params.shortURL]["createDate"],
      visited: urlDatabase[req.params.shortURL]["visited"],
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});

app.put("/urls/:shortURL", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]
  ) {
    let templateVars = {
      user: users[req.session["user_id"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    urlDatabase[req.params.shortURL]["longURL"] = `http://${req.body.longURL}`;
    res.redirect("/urls");
  }
});

app.delete("/urls/:shortURL/delete", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req.session["user_id"]
  ) {
    let templateVars = {
      user: users[req.session["user_id"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
