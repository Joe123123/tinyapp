const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const logoutRouter = require("./routes/logout");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const urlsRouter = require("./routes/urls");
const uRouter = require("./routes/u");
const urlsJSONRouter = require("./routes/urls-json");
const indexRouter = require("./routes/index");
const { users } = require("./database/data");
const { getLoggedInUser } = require("./helper");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
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
app.use((req, res, next) => {
  req["userLoggedIn"] = getLoggedInUser(req.session["user_id"], users);
  next();
});

app.use("/", indexRouter);
app.use("/logout", logoutRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/urls", urlsRouter);
app.use("/u", uRouter);
app.use("/urls.json", urlsJSONRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
