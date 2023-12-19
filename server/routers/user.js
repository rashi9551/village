const express = require("express");
const usrouter = express.Router();
const usercontroller = require("../controller/usercontroller/usercontroller");
const session=require("../../middleware/isAuth");
const { sep } = require("path/posix");
const profilecontroller=require("../controller/usercontroller/profilecontrol")
const cartcontroller=require("../controller/usercontroller/cartcontroller")
const checkoutcontroller=require("../controller/usercontroller/checkoutcontroller")
const {loged,signforgot,forgot,logedtohome}=session

usrouter.get("/", usercontroller.index);
usrouter.get("/shop", usercontroller.shop);
usrouter.post("/searchProducts",usercontroller.searchProducts)
usrouter.get('/filterProducts',usercontroller.filterProducts)
usrouter.get("/sortProducts",usercontroller.sortProducts)
usrouter.get("/singleproduct/:id", usercontroller.singleproduct);
usrouter.get("/profile",loged,usercontroller.profile);
usrouter.get("/signup", usercontroller.signup);
usrouter.post("/signotp", usercontroller.signotp);
usrouter.get("/otp",signforgot, usercontroller.otp);
usrouter.post("/verifyotp",signforgot, usercontroller.verifyotp);
usrouter.get("/resendotp",signforgot,usercontroller.resendotp);
usrouter.post("/login", usercontroller.login);
usrouter.get("/forgotpassword", usercontroller.forgotpassword);
usrouter.post("/forgotverify", usercontroller.forgotverify);
usrouter.get("/newpassword",forgot, usercontroller.newpassword);
usrouter.post("/resetpassword",forgot, usercontroller.resetpassword);
usrouter.get("/logout",logedtohome, usercontroller.logout);

// cart 
usrouter.get("/cartpage",loged,cartcontroller.showcart)
usrouter.get("/addtocart/:id",loged,cartcontroller.addtocart)
usrouter.get("/deletcart/:id",loged,cartcontroller.deletecart)
usrouter.post("/update-cart-quantity/:productId",session.loged,cartcontroller.updatecart)
usrouter.get("/checkoutpage",loged,cartcontroller.checkoutpage)




// profile 
usrouter.get("/userdetails",loged,profilecontroller.userdetails)
usrouter.get("/editProfile",session.loged,profilecontroller.profileEdit)
usrouter.post("/updateprofile",loged,profilecontroller.profileUpdate)
usrouter.get("/addAddress",loged,profilecontroller.newAddress)
usrouter.post("/addressUpdating",loged,profilecontroller.updateAddress)
usrouter.get("/editaddress/:addressId",loged,profilecontroller.editaddress)
usrouter.post("/updateaddress/:addressId",loged,profilecontroller.editaddressupdate)
usrouter.get("/deleteaddress/:addressId",loged,profilecontroller.deleteAddress)
usrouter.post("/cp",loged,profilecontroller.changepassword)
usrouter.get("/orderhistory",loged,profilecontroller.orderhistory)
usrouter.get("/cancelorder/:id",loged,profilecontroller.ordercancelling)
usrouter.get('/returnorder/:id',loged,profilecontroller.orderReturn)
usrouter.get("/singleorder/:id",loged,profilecontroller.singleOrderPage)
usrouter.get("/favouritespage",loged,profilecontroller.favouritespage)
usrouter.get("/addtofavourites/:id",loged,profilecontroller.addtofavourite)
usrouter.get("/deletefav/:id",loged,profilecontroller.deletefav)
usrouter.get("/addtocartviafav/:id",loged,profilecontroller.addtocartviafav)
usrouter.get('/wallet',loged,profilecontroller.wallet)
usrouter.post('/walletcreate/orderId',loged,profilecontroller.walletupi)
usrouter.post('/walletTopup',loged,profilecontroller.walletTopup)

usrouter.post("/applyCoupon",checkoutcontroller.applyCoupon)
usrouter.post("/checkoutreload",loged,checkoutcontroller.checkoutreload)
usrouter.post('/wallettransaction',loged,checkoutcontroller.wallettransaction)
usrouter.post("/placeorder",loged,checkoutcontroller.placeorder)
usrouter.post('/create/orderId',loged,checkoutcontroller.upi)



module.exports = usrouter;
