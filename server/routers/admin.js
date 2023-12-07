const express =require("express")
const admincontroller=require("../controller/admincontroller")
const admminrouter=express.Router()
const productcontroller=require("../controller/productcontroller")
const sessions=require("../../middleware/isadAuth")
const ordercontroller=require("../controller/ordercontrol")

const multer=require('multer')
const session = require("express-session")
const upload=multer({dest:'uploads/'})
const app=express();


app.use(express.static('public/admin_assets'))
admminrouter.use(express.urlencoded({extended:true}))


admminrouter.get("/",admincontroller.login)
admminrouter.post("/adminlogin",admincontroller.adminlogin)
admminrouter.get("/adminpannel",sessions.adisAuth,admincontroller.adminpannel)
admminrouter.get("/userslist",sessions.adisAuth,admincontroller.userslist)
admminrouter.get("/update/:email",sessions.adisAuth,admincontroller.userupdate)
admminrouter.post("/searchuser",sessions.adisAuth,admincontroller.searchuser)
admminrouter.get("/searchview",sessions.adisAuth,admincontroller.searchview)
admminrouter.get("/filter/:option",sessions.adisAuth,admincontroller.filter)

admminrouter.get("/adlogout",sessions.adisAuth,admincontroller.adlogout)



admminrouter.get("/category",sessions.adisAuth,admincontroller.category)
admminrouter.get("/newcat",sessions.adisAuth,admincontroller.newcat)
admminrouter.post("/add-category",sessions.adisAuth,admincontroller.addcategory)
admminrouter.get("/unlistcat/:id",sessions.adisAuth,admincontroller.unlistcat)
admminrouter.get("/updatecat/:id",sessions.adisAuth,admincontroller.updatecat)
admminrouter.post("/update-category/:id",sessions.adisAuth,admincontroller.updatecategory)


admminrouter.get("/product",sessions.adisAuth,productcontroller.product)
admminrouter.get("/newproduct",sessions.adisAuth,productcontroller.newproduct)
admminrouter.post("/addproduct",sessions.adisAuth,upload.array('images'),productcontroller.addproduct)
admminrouter.get("/unlist/:id",sessions.adisAuth,productcontroller.unlist)
admminrouter.get("/deletepro/:id",sessions.adisAuth,productcontroller.deleteproduct)
admminrouter.get("/updatepro/:id",sessions.adisAuth,productcontroller.updatepro)
admminrouter.get("/editimg/:id/",sessions.adisAuth,productcontroller.editing)
admminrouter.get("/deleteimg",sessions.adisAuth,productcontroller.deleteimg)
admminrouter.post("/updateimg/:id",sessions.adisAuth,upload.array('images'),productcontroller.updateimg)
admminrouter.post("/updateproduct/:id",sessions.adisAuth,productcontroller.updateproduct)

admminrouter.get("/orderPage",sessions.adisAuth,ordercontroller.orderPage)
admminrouter.post("/updateOrderStatus",sessions.adisAuth,ordercontroller.updateorderstatus)






module.exports=admminrouter