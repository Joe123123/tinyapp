const express = require("express");
const {
  generateRandomString,
  urlsForUser,
  getFormatDate
} = require("../helper");
const { users, urlDatabase, ipDatabase } = require("../database/data");
const router = express.Router();

router.get("/", (req, res) => {
  if (req["userLoggedIn"]) {
    let urls = urlsForUser(req["userLoggedIn"], urlDatabase);
    let templateVars = {
      urls: urls,
      user: users[req["userLoggedIn"]]
    };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user: users[req["userLoggedIn"]],
      warningMessage: "Please login first!"
    };
    res.render("warning", templateVars);
  }
});

// post from /urls/new
router.post("/", (req, res) => {
  let shortURL = generateRandomString(6);
  // unique shortURL
  while (urlDatabase[shortURL]) {
    shortURL = generateRandomString(6);
  }
  urlDatabase[shortURL] = {
    longURL: `http://${req.body.longURL}`,
    createDate: getFormatDate(),
    visited: 0,
    userID: req["userLoggedIn"]
  };
  ipDatabase[shortURL] = {};
  res.redirect(`/urls/${shortURL}`);
});

router.get("/new", (req, res) => {
  if (!req["userLoggedIn"]) {
    res.redirect("/urls");
  } else {
    let templateVars = { user: users[req["userLoggedIn"]] };
    res.render("urls_new", templateVars);
  }
});

router.get("/:shortURL", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req["userLoggedIn"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req["userLoggedIn"]
  ) {
    let templateVars = {
      user: users[req["userLoggedIn"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      createDate: urlDatabase[req.params.shortURL]["createDate"],
      visited: urlDatabase[req.params.shortURL]["visited"],
      user: users[req["userLoggedIn"]],
      ipData: ipDatabase[req.params.shortURL]
    };
    res.render("urls_show", templateVars);
  }
});

router.put("/:shortURL", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req["userLoggedIn"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req["userLoggedIn"]
  ) {
    let templateVars = {
      user: users[req["userLoggedIn"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    urlDatabase[req.params.shortURL]["longURL"] = `http://${req.body.longURL}`;
    res.redirect("/urls");
  }
});

router.delete("/:shortURL", (req, res) => {
  // if not login, wrong shortURL, not matching userID
  if (!req["userLoggedIn"]) {
    res.redirect("/urls");
  } else if (
    !urlDatabase[req.params.shortURL] ||
    urlDatabase[req.params.shortURL]["userID"] !== req["userLoggedIn"]
  ) {
    let templateVars = {
      user: users[req["userLoggedIn"]],
      warningMessage: "This is not your shortURL."
    };
    res.render("warning", templateVars);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

module.exports = router;
