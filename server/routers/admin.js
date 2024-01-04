const express =require("express")
const admincontroller=require("../controller/admincontroller/admincontroller")
const admminrouter=express.Router()
const productcontroller=require("../controller/admincontroller/productcontroller")
const sessions=require("../../middleware/isadAuth")
const ordercontroller=require("../controller/admincontroller/ordercontroller")
const couponcontroller=require("../controller/admincontroller/couponcontroller")
const Catcontroller=require("../controller/admincontroller/categorycontroller")
const bannercontroller=require("../controller/admincontroller/bannercontroller")


const multer=require('multer')
const session = require("express-session")
const { copy } = require("./user")
const upload=multer({dest:'uploads/'})
const app=express();


app.use(express.static('public/admin_assets'))
admminrouter.use(express.urlencoded({extended:true}))


admminrouter.get("/",sessions.logoutAdmin,admincontroller.login)
admminrouter.post("/adminlogin",admincontroller.adminlogin)
admminrouter.get("/adminpannel",sessions.adisAuth,admincontroller.adminpannel)
admminrouter.get("/userslist",sessions.adisAuth,admincontroller.userslist)
admminrouter.get("/update/:email",sessions.adisAuth,admincontroller.userupdate)
admminrouter.post("/searchuser",sessions.adisAuth,admincontroller.searchuser)
admminrouter.get("/searchview",sessions.adisAuth,admincontroller.searchview)
admminrouter.get("/filter/:option",sessions.adisAuth,admincontroller.filter)
admminrouter.get("/adminlogout",sessions.adisAuth,admincontroller.adlogout)


admminrouter.post("/chartData",sessions.adisAuth,admincontroller.chartData)
admminrouter.post('/downloadsales',sessions.adisAuth,admincontroller.downloadsales)


admminrouter.get("/category",sessions.adisAuth,Catcontroller.category)
admminrouter.get("/newcat",sessions.adisAuth,Catcontroller.newcat)
admminrouter.post("/add-category",sessions.adisAuth,Catcontroller.addcategory)
admminrouter.get("/unlistcat/:id",sessions.adisAuth,Catcontroller.unlistcat)
admminrouter.get("/updatecat/:id",sessions.adisAuth,Catcontroller.updatecat)
admminrouter.post("/update-category/:id",sessions.adisAuth,Catcontroller.updatecategory)


admminrouter.get("/product",sessions.adisAuth,productcontroller.product)
admminrouter.get("/newproduct",sessions.adisAuth,productcontroller.newproduct)
admminrouter.post("/addproduct",sessions.adisAuth,upload.array('images'),productcontroller.addproduct)
admminrouter.get("/unlist/:id",sessions.adisAuth,productcontroller.unlist)
admminrouter.get("/deletepro/:id",sessions.adisAuth,productcontroller.deleteproduct)
admminrouter.get("/updatepro/:id",sessions.adisAuth,productcontroller.updatepro)
admminrouter.get("/editimg/:id/",sessions.adisAuth,productcontroller.editing)
admminrouter.get("/deleteimg",sessions.adisAuth,productcontroller.deleteimg)
admminrouter.get('/resizeimg',sessions.adisAuth,productcontroller.resizeImage)
admminrouter.post("/updateimg/:id",sessions.adisAuth,upload.array('images'),productcontroller.updateimg)
admminrouter.post("/updateproduct/:id",sessions.adisAuth,productcontroller.updateproduct)

admminrouter.get("/orderPage",sessions.adisAuth,ordercontroller.orderPage)
admminrouter.post("/updateOrderStatus",sessions.adisAuth,ordercontroller.updateorderstatus)

admminrouter.get('/couponList',sessions.adisAuth,couponcontroller.couponList)
admminrouter.get('/newcoupon',sessions.adisAuth,couponcontroller.addcouponpage)
admminrouter.post('/add_coupon',sessions.adisAuth,couponcontroller.createCoupon)
admminrouter.get('/unlistCoupon/:id',sessions.adisAuth,couponcontroller.unlistCoupon)
admminrouter.get('/editCouponGet/:id',sessions.adisAuth,couponcontroller.editCouponPage)
admminrouter.post('/updateCoupon',sessions.adisAuth,couponcontroller.updateCoupon)

admminrouter.get('/bannerList',sessions.adisAuth,bannercontroller.bannerList)
admminrouter.get('/newbanner',sessions.adisAuth,bannercontroller.addbanner)
admminrouter.post('/addBanner',upload.single('image'),sessions.adisAuth,bannercontroller.addBannerPost)
admminrouter.get('/unlistBanner/:id',sessions.adisAuth,bannercontroller.unlistBanner)
admminrouter.get('/updateBanner/:id',sessions.adisAuth,bannercontroller.updateBanner)
admminrouter.post('/updateBannerPost/:id',upload.single('newImage'),sessions.adisAuth,bannercontroller.updateBannerPost)
admminrouter.get('/deleteBanner/:id',sessions.adisAuth,bannercontroller.deleteBanner)


module.exports=admminrouter