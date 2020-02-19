const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "kkkkkk" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "kkkkkk" }
};
const users = {
  kkkkkk: {
    id: "kkkkkk",
    email: "fake@gmail.com",
    password: bcrypt.hashSync("kkk", 10)
  }
};
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
const urlsForUser = id => {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      urls[url] = urlDatabase[url]["longURL"];
    }
  }
  return urls;
};
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"]
  })
);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    let urls = urlsForUser(req.session["user_id"]);
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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  // unique shortURL
  while (urlDatabase[shortURL]) {
    shortURL = generateRandomString(6);
  }
  urlDatabase[shortURL] = {
    longURL: `http://${req.body.longURL}`,
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
  if (/^\s*$/.test(req.body.email) || /^\s*$/.test(req.body.password)) {
    res.status(400);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Invalid email or password"
    };
    res.render("error", templateVars);
  } else if (!isUniqueEmail(req.body.email)) {
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
  if (/^\s*$/.test(req.body.email) || /^\s*$/.test(req.body.password)) {
    res.status(400);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Invalid email or password"
    };
    res.render("error", templateVars);
  }
  if (isUniqueEmail(req.body.email)) {
    res.status(403);
    let templateVars = {
      user: users[req.session["user_id"]],
      errorCode: res.statusCode,
      errorMessage: "Email is not registered"
    };
    res.render("error", templateVars);
  }
  for (let user in users) {
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
  res.redirect("./urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
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
      user: users[req.cookies["user_id"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req.cookies["user_id"]
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

app.post("/urls/:shortURL/delete", (req, res) => {
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
