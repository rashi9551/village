const express = require("express");
const usrouter = express.Router();
const usercontroller = require("./../controller/userController");
const session=require("../../middleware/isAuth");
const { sep } = require("path/posix");

usrouter.get("/", usercontroller.index);
usrouter.get("/shop", usercontroller.shop);
usrouter.get("/singleproduct/:id", usercontroller.singleproduct);
usrouter.get("/profile",session.loged,usercontroller.profile);
usrouter.get("/signup", usercontroller.signup);
usrouter.post("/signotp", usercontroller.signotp);
usrouter.get("/otp",session.signforgot, usercontroller.otp);
usrouter.post("/verifyotp",session.signforgot, usercontroller.verifyotp);
usrouter.get("/resendotp",session.signforgot,usercontroller.resendotp);
usrouter.post("/login", usercontroller.login);
usrouter.get("/forgotpassword", usercontroller.forgotpassword);
usrouter.post("/forgotverify", usercontroller.forgotverify);
usrouter.get("/newpassword",session.forgot, usercontroller.newpassword);
usrouter.post("/resetpassword",session.forgot, usercontroller.resetpassword);
usrouter.get("/logout",session.logedtohome, usercontroller.logout);

module.exports = usrouter;
