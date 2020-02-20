const express = require("express");
const bcrypt = require("bcrypt");
const {
  generateRandomString,
  isEmptyString,
  isUniqueEmail
} = require("../helper");
const { users } = require("../database/data");
const router = express.Router();

router.get("/", (req, res) => {
  let templateVars = { user: users[req["userLoggedIn"]] };
  res.render("register", templateVars);
});

router.post("/", (req, res) => {
  let userRandomID = generateRandomString(6);
  // unique ID
  while (users[userRandomID]) {
    userRandomID = generateRandomString(6);
  }
  // test empty email, password and unique email
  if (isEmptyString(req.body.email, req.body.password)) {
    res.status(400);
    let templateVars = {
      user: users[req["userLoggedIn"]],
      errorCode: res.statusCode,
      errorMessage: "Invalid email or password"
    };
    res.render("error", templateVars);
  } else if (!isUniqueEmail(req.body.email, users)) {
    res.status(400);
    let templateVars = {
      user: users[req["userLoggedIn"]],
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

module.exports = router;
