const express = require("express");
const router = express.Router();
const { urlDatabase, users, ipDatabase } = require("../database/data");

router.get("/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    urlDatabase[req.params.shortURL]["visited"] += 1;
    let userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    for (let url in ipDatabase) {
      if (url === req.params.shortURL) {
        ipDatabase[url][userIP] = ipDatabase[url][userIP] + 1 || 1;
      }
    }
    res.redirect(longURL);
  } else {
    res.status(403);
    let templateVars = {
      user: users[req["userLoggedIn"]],
      errorCode: res.statusCode,
      errorMessage: "No such short URL exists"
    };
    res.render("error", templateVars);
  }
});

module.exports = router;
