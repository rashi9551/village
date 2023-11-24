const express =require("express")
const admincontroller=require("../controller/admincontroller")
const admminrouter=express.Router()
const productcontroller=require("../controller/productcontroller")

const multer=require('multer')
const upload=multer({dest:'uploads/'})
const app=express();


app.use(express.static('public/admin_assets'))
admminrouter.use(express.urlencoded({extended:true}))


admminrouter.get("/",admincontroller.login)
admminrouter.post("/adminlogin",admincontroller.adminlogin)
admminrouter.get("/adminpannel",admincontroller.adminpannel)
admminrouter.get("/userslist",admincontroller.userslist)
admminrouter.get("/update/:email",admincontroller.userupdate)
admminrouter.post("/searchuser",admincontroller.searchuser)
admminrouter.get("/searchview",admincontroller.searchview)
admminrouter.get("/filter/:option",admincontroller.filter)

admminrouter.get("/adlogout",admincontroller.adlogout)



admminrouter.get("/category",admincontroller.category)
admminrouter.get("/newcat",admincontroller.newcat)
admminrouter.post("/add-category",admincontroller.addcategory)
admminrouter.get("/unlistcat/:id",admincontroller.unlistcat)
admminrouter.get("/updatecat/:id",admincontroller.updatecat)
admminrouter.post("/update-category/:id",admincontroller.updatecategory)


admminrouter.get("/product",productcontroller.product)
admminrouter.get("/newproduct",productcontroller.newproduct)
admminrouter.post("/addproduct",upload.array('images'),productcontroller.addproduct)
admminrouter.get("/unlist/:id",productcontroller.unlist)
admminrouter.get("/deletepro/:id",productcontroller.deleteproduct)
admminrouter.get("/updatepro/:id",productcontroller.updatepro)
admminrouter.get("/editimg/:id/",productcontroller.editing)
admminrouter.get("/deleteimg",productcontroller.deleteimg)
admminrouter.post("/updateimg/:id",upload.array('images'),productcontroller.updateimg)
admminrouter.post("/updateproduct/:id",productcontroller.updateproduct)









module.exports=admminrouter