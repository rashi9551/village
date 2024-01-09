const express = require("express");
const usrouter = express.Router();
const usercontroller = require("../controller/usercontroller/usercontroller");
const session=require("../../middleware/isAuth");
const { sep } = require("path/posix");
const profilecontroller=require("../controller/usercontroller/profilecontroller")
const cartcontroller=require("../controller/usercontroller/cartcontroller")
const checkoutcontroller=require("../controller/usercontroller/checkoutcontroller")
const ratingcontrol=require("../controller/usercontroller/ratingcontroller")
const orderCountrol=require("../controller/usercontroller/ordercontroller")
const walletCountrol=require("../controller/usercontroller/walletcontroller")
const couponControl=require('../controller/usercontroller/couponcontroller')
const productControl=require('../controller/usercontroller/productcontroller')
const {loged,signforgot,forgot,logedtohome,iflogged,checkSessionVariable}=session

usrouter.get("/", usercontroller.index);

usrouter.post('/pagination',usercontroller.index)

usrouter.get("/shop", usercontroller.shop);

usrouter.post("/searchProducts",productControl.searchProducts)

usrouter.get('/filterProducts',productControl.filterProducts)

usrouter.get("/sortProducts",productControl.sortProducts)

usrouter.get("/singleproduct/:id", productControl.singleproduct);


usrouter.get("/profile",loged,usercontroller.profile);

usrouter.get("/signup",iflogged, usercontroller.signup);

usrouter.post("/signotp", usercontroller.signotp);

usrouter.get("/otp",signforgot, usercontroller.otp);

usrouter.post("/verifyotp",signforgot, usercontroller.verifyotp);

usrouter.post("/resendotp",signforgot,usercontroller.resendotp);

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

usrouter.post("/update-cart-quantity/:productId",loged,cartcontroller.updatecart)

usrouter.get("/checkoutpage",checkSessionVariable('checkout','/'),checkoutcontroller.checkoutpage)

usrouter.post("/checkoutreload",loged,checkoutcontroller.checkoutreload)

usrouter.post('/wallettransaction',loged,checkoutcontroller.wallettransaction)

usrouter.post("/placeorder",loged,checkoutcontroller.placeorder)

usrouter.post('/create/orderId',loged,checkoutcontroller.upi)




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


usrouter.get("/orderhistory",loged,orderCountrol.orderhistory)

usrouter.get("/cancelorder/:id",loged,orderCountrol.ordercancelling)

usrouter.get('/cancelitem/:id/:orderId',loged,orderCountrol.itemcancelling)

usrouter.get('/returnitem/:id/:orderId',loged,orderCountrol.itemreturning)

usrouter.get('/returnorder/:id',loged,orderCountrol.orderReturn)

usrouter.get("/singleorder/:id",loged,orderCountrol.singleOrderPage)

usrouter.get("/download-invoice/:orderId",loged,orderCountrol.downloadInvoice)


usrouter.get('/rateAndReview',loged,ratingcontrol.ratePage)



usrouter.get("/favouritespage",loged,profilecontroller.favouritespage)

usrouter.get("/addtofavourites/:id",loged,profilecontroller.addtofavourite)

usrouter.get("/deletefav/:id",loged,profilecontroller.deletefav)

usrouter.get("/addtocartviafav/:id",loged,profilecontroller.addtocartviafav)


usrouter.get('/wallet',loged,walletCountrol.wallet)

usrouter.post('/walletcreate/orderId',loged,walletCountrol.walletupi)

usrouter.post('/walletTopup',loged,walletCountrol.walletTopup)


usrouter.get("/Rewards",loged,couponControl.couponsAndRewards)

usrouter.post("/applyCoupon",loged,couponControl.applyCoupon)

usrouter.post("/revokeCoupon",loged,couponControl.recokeCoupon)




usrouter.get("/bannerURL",usercontroller.bannerURL)


module.exports = usrouter;
