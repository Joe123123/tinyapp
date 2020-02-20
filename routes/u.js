const express = require("express");
const router = express.Router();
const { urlDatabase } = require("../database/data");

router.get("/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  urlDatabase[req.params.shortURL]["visited"] += 1;
  res.redirect(longURL);
});

module.exports = router;
