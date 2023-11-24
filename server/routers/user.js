const express = require("express");
const usrouter = express.Router();
const usercontroller = require("./../controller/userController");

usrouter.get("/", usercontroller.index);
usrouter.get("/shop", usercontroller.shop);
usrouter.get("/singleproduct/:id", usercontroller.singleproduct);
usrouter.get("/profile", usercontroller.profile);
usrouter.get("/signup", usercontroller.signup);
usrouter.post("/signotp", usercontroller.signotp);
usrouter.get("/otp", usercontroller.otp);
usrouter.post("/verifyotp", usercontroller.verifyotp);
usrouter.post("/resendotp", usercontroller.resendotp);
usrouter.post("/login", usercontroller.login);
usrouter.get("/forgotpassword", usercontroller.forgotpassword);
usrouter.post("/forgotverify", usercontroller.forgotverify);
usrouter.get("/newpassword", usercontroller.newpassword);
usrouter.post("/resetpassword", usercontroller.resetpassword);
usrouter.get("/logout", usercontroller.logout);

module.exports = usrouter;
