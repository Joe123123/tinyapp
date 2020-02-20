const express = require("express");
const { urlDatabase } = require("../database/data");
const router = express.Router();

router.get("/", (req, res) => {
  res.json(urlDatabase);
});

module.exports = router;
