const {
  generateRandomString,
  isUniqueEmail,
  urlsForUser,
  isEmptyString,
  getFormatDate,
  getUserByEmail
} = require("../helper");
const { assert } = require("chai");
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    createDate: "2019-02-20",
    visited: 111,
    userID: "randID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    createDate: "1999-11-01",
    visited: 222,
    userID: "randID"
  }
};
const users = {
  randID: {
    id: "randID",
    email: "fake@gmail.com"
  }
};

describe("express_server helper function", function() {
  describe("generateRandomString", function() {
    it("should return a string when giving 6", function() {
      assert.isString(generateRandomString(6));
    });
    it("should return 6 digits random string when giving 6", function() {
      assert.equal(generateRandomString(6).length, 6);
    });
  });
  describe("isUniqueEmail", function() {
    it("should return false when giving an existing email", function() {
      assert.isFalse(isUniqueEmail("fake@gmail.com", users));
    });
    it("should return true when giving a unique email", function() {
      assert.isTrue(isUniqueEmail("new@gmail.com", users));
    });
  });
  describe("urlsForUser", function() {
    it("should return an object when giving user_id", function() {
      assert.isObject(urlsForUser("randID", urlDatabase));
    });
    it("should return an empty object when no matching user_id", function() {
      assert.deepEqual(urlsForUser("noSuchId", urlDatabase), {});
    });
    it("should return an object with all urls under that id when giving user_id", function() {
      assert.deepEqual(urlsForUser("randID", urlDatabase), {
        b6UTxQ: {
          longURL: "https://www.tsn.ca",
          createDate: "2019-02-20",
          visited: 111
        },
        i3BoGr: {
          longURL: "https://www.google.ca",
          createDate: "1999-11-01",
          visited: 222
        }
      });
    });
  });
  describe("isEmptyString", function() {
    it('should return true when giving ("a", "b", "") ', function() {
      assert.isTrue(isEmptyString("a", "b", ""));
    });
    it('should return false when giving ("a", "b") ', function() {
      assert.isFalse(isEmptyString("a", "b"));
    });
  });
  describe("getFormatDate", function() {
    it('should return format date "yyyy-mm-dd"', function() {
      assert.isTrue(
        /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(
          getFormatDate()
        )
      );
    });
  });
  describe("getUserByEmail", function() {
    it("should return user when matching email", function() {
      assert.equal(getUserByEmail("fake@gmail.com", users), "randID");
    });
    it("should return undifined when not matching email", function() {
      assert.isUndefined(getUserByEmail("new@gmail.com", users));
    });
  });
});
