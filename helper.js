const generateRandomString = length => {
  const strs = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  let randomStr = "";
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * 62);
    randomStr += strs[index];
  }
  return randomStr;
};
const isUniqueEmail = (email, users) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return false;
    }
  }
  return true;
};
const urlsForUser = (id, urlDatabase) => {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      urls[url] = {
        longURL: urlDatabase[url]["longURL"],
        createDate: urlDatabase[url]["createDate"],
        visited: urlDatabase[url]["visited"]
      };
    }
  }
  return urls;
};
const isEmptyString = (...args) => {
  for (let arg of args) {
    if (/^\s*$/.test(arg)) {
      return true;
    }
  }
  return false;
};
const getFormatDate = () => new Date().toJSON().slice(0, 10);
const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
};
const getLoggedInUser = (id, users) => {
  for (let user in users) {
    if (user === id) {
      return user;
    }
  }
};
module.exports = {
  generateRandomString,
  isUniqueEmail,
  urlsForUser,
  isEmptyString,
  getFormatDate,
  getUserByEmail,
  getLoggedInUser
};
