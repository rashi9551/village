const express =require("express")
const admincontroller=require("../controller/admincontroller")
const admminrouter=express.Router()

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


admminrouter.get("/category",admincontroller.category)
admminrouter.get("/newcat",admincontroller.newcat)
admminrouter.post("/add-category",admincontroller.addcategory)
admminrouter.get("/unlistcat/:id",admincontroller.unlistcat)
admminrouter.get("/updatecat/:id",admincontroller.updatecat)
admminrouter.post("/update-category/:id",admincontroller.updatecategory)









module.exports=admminrouter