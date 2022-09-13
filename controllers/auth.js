const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/users");
const sendEmail = require("../util/mail.js");

exports.getLogin = (req, res, next) => {
  const { email, password } = "";
  let errorMessage = req.flash("errorMessage");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  res.render("auth/login", {
    pageTitle: "login",
    path: "/login",
    isAuthenticated: false,
    errorMessage,
    previousValue: {
      email,
      password,
    },
    errorArray: [],
  });
};

exports.getResetPassword = (req, res, next) => {
  let errorMessage = req.flash("errorMessage");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  res.render("auth/resetPassword", {
    pageTitle: "resetPassword",
    path: "/resetPassword",
    isAuthenticated: false,
    errorMessage,
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  let errorMessage = req.flash("errorMessage");
  User.findOne({
    resetToken: token,
    resetTokenExpirationDate: { $gt: Date.now() },
  })
    .then((user) => {
      if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
      } else {
        errorMessage = null;
      }
      res.render("auth/newPassword", {
        pageTitle: "newPassword",
        path: "/newPassword",
        isAuthenticated: false,
        errorMessage,
        userId: user._id.toString(),
        resetToken: token,
      });
    })
    .catch((err) => {
      console.log(
        "there is problem with getting user in reset password: \n",
        err
      );
      req.flash(
        "errorMessage",
        "your email is Invalid or your link is expired"
      );
      res.redirect("/resetPassword");
    });
};

exports.getSignup = (req, res, next) => {
  const email = "";
  const password = "";
  const confirmPassword = "";
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: null,
    previousValue: {
      email,
      password,
      confirmPassword,
    },
    errorArray: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errorMessage = validationResult(req);
  if (!errorMessage.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errorMessage.array()[0].msg,
      errorArray: errorMessage.array(),
      previousValue: {
        email,
        password,
      },
    });
  }
  User.findOne({ email })
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log("error in saving session: \n", err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password",
            errorArray: [],
            previousValue: {
              email,
              password,
            },
          })
        })
        .catch((error) => {
          console.log("finding password error", error);
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid password",
            errorArray: [],
            previousValue: {
              email,
              password,
            },
          })
        });
    })
    .catch((err) => {
      console.log("error in finding email: ", err);
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid email",
        errorArray: [],
        previousValue: {
          email,
          password,
        },
      })
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const validatorErrorMessage = validationResult(req);
  if (!validatorErrorMessage.isEmpty()) {
    console.log("validator", validatorErrorMessage.array()[0]);
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: validatorErrorMessage.array()[0].msg,
      previousValue: {
        email,
        password,
        confirmPassword,
      },
      errorArray: validatorErrorMessage.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const newUser = new User({
        email,
        password: hashPassword,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then(() => {
      const subject = "register";
      html = "<p> Registeration was Sucessful";
      res.redirect("/login");
      sendEmail(email, subject, html).catch((er) => {
        res.redirect("/signup");
        console.log("error in sending email: \n", er);
      });
    }).catch((err) => {
      console.log("error in sign up : \n ", err);
      next(err);
    });
};

exports.postResetPassword = (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("error in creating token for user: \n", err);
      return res.redirect("/resetPassword");
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((userDocs) => {
        if (!userDocs) {
          req.flash("errorMessage", "No Account found with this description");
          return res.redirect("/resetPassword");
        }
        userDocs.resetToken = token;
        userDocs.resetTokenExpirationDate = Date.now() + 3600000;
        return userDocs.save();
      })
      .then(() => {
        const subject = "reset password";
        const html = `
      <p> You requested a password reset </p>
      <p> Click this <a href="http://localhost:2828/newPassword/${token}"> Link </a> to set a new password </p>
      `;
        res.redirect("/");
        sendEmail(email, subject, html).catch((er) => {
          console.log("error in sending email: \n", er);
        });
      })
      .catch((err) => {
        console.log("error in finding user: \n", err);
        next(err);
      });
  });
};

exports.postNewPassword = (req, res, next) => {
  const { newPassword, resetToken, userId } = req.body;
  let user = null;
  User.findOne({
    resetToken,
    resetTokenExpirationDate: { $gt: Date.now() },
    _id: userId,
  })
    .then((userDoc) => {
      user = userDoc;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashPassword) => {
      user.password = hashPassword;
      user.resetToken = undefined;
      user.resetTokenExpirationDate = undefined;
      return user.save();
    })
    .then(() => res.redirect("/login"))
    .catch((err) => {
      console.log(
        "there is problem with getting user in reset password: \n",
        err
      );
      req.flash(
        "errorMessage",
        "your email is Invalid or your link is expired"
      );
      res.redirect("/resetPassword");
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
