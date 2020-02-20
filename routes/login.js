const express = require("express");
const { users } = require("../database/data");
const bcrypt = require("bcrypt");
const { isEmptyString, isUniqueEmail, getUserByEmail } = require("../helper");

const router = express.Router();
router.get("/", (req, res) => {
  let templateVars = { user: users[req["userLoggedIn"]] };
  res.render("login", templateVars);
});

router.post("/", (req, res) => {
  // test empty email, password and unique email
  if (isEmptyString(req.body.email, req.body.password)) {
    res.status(400);
    let templateVars = {
      user: users[req["userLoggedIn"]],
      errorCode: res.statusCode,
      errorMessage: "Invalid email or password"
    };
    res.render("error", templateVars);
  }
  if (isUniqueEmail(req.body.email, users)) {
    res.status(403);
    let templateVars = {
      user: users[req["userLoggedIn"]],
      errorCode: res.statusCode,
      errorMessage: "Email is not registered"
    };
    res.render("error", templateVars);
  }

  let userByEmail = getUserByEmail(req.body.email, users);
  // matching password
  if (
    userByEmail &&
    bcrypt.compareSync(req.body.password, users[userByEmail]["password"])
  ) {
    req.session["user_id"] = userByEmail;
    res.redirect("/urls");
  } else {
    res.status(403);
    let templateVars = {
      user: users[req["userLoggedIn"]],
      errorCode: res.statusCode,
      errorMessage: "Wrong password"
    };
    res.render("error", templateVars);
  }
});

module.exports = router;
