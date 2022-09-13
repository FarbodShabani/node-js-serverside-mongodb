const { check, body } = require("express-validator");

const User = require("../models/users");

const signUpValidation = [
  check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("please enter valid email")
    .custom((email, { req }) => {
      return User.findOne({ email }).then((userDocs) => {
        if (userDocs) {
          return Promise.reject("This Email is already existed");
        }
      });
    }),
  body(
    "password",
    "the passowrd must have at least 5 charectors and should contains only words and number"
  )
    .isAlphanumeric()
    .isLength({ min: 5 })
    .trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw Error("confirm password should match password");
      }
    }),
];

const signInValidation = [
  body("email").isEmail().withMessage("please Enter Valid Email"),
  body("password", "password must be valid")
    .isLength({ min: 5 })
    .isAlphanumeric(),
];

module.exports = {
  signUpValidation,
  signInValidation,
};
