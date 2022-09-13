const express = require("express");

const authController = require("../controllers/auth");

const {signUpValidation, signInValidation} = require("../validation/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/resetPassword", authController.getResetPassword);

router.get("/newPassword/:token", authController.getNewPassword);

router.post("/login", signInValidation,authController.postLogin);

router.post("/signup", signUpValidation, authController.postSignup);

router.post("/logout", authController.postLogout);

router.post("/resetPassword", authController.postResetPassword);

router.post("/newPassword", authController.postNewPassword);

module.exports = router;
