const express = require("express");
const usrouter = express.Router();
const usercontroller = require("./../controller/userController");
const session=require("../../middleware/isAuth");
const { sep } = require("path/posix");
const profilecontroller=require("../controller/profilecontrol")
const cartcontroller=require("../controller/cartcontroller")

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

// cart 
usrouter.get("/cartpage",session.loged,cartcontroller.showcart)
usrouter.get("/addtocart/:id",session.loged,cartcontroller.addtocart)
usrouter.get("/deletcart/:id",session.loged,cartcontroller.deletecart)
usrouter.post("/update-cart-quantity/:productId",session.loged,cartcontroller.updatecart)
usrouter.get("/checkoutpage",session.loged,cartcontroller.checkoutpage)




// profile 
usrouter.get("/userdetails",session.loged,profilecontroller.userdetails)
usrouter.get("/editProfile",session.loged,profilecontroller.profileEdit)
usrouter.post("/updateprofile",session.loged,profilecontroller.profileUpdate)
usrouter.get("/addAddress",session.loged,profilecontroller.newAddress)
usrouter.post("/addressUpdating",session.loged,profilecontroller.updateAddress)
usrouter.get("/editaddress/:addressId",session.loged,profilecontroller.editaddress)
usrouter.post("/updateaddress/:addressId",session.loged,profilecontroller.editaddressupdate)
usrouter.get("/deleteaddress/:addressId",session.loged,profilecontroller.deleteAddress)
usrouter.post("/cp",session.loged,profilecontroller.changepassword)


module.exports = usrouter;
