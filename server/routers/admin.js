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







module.exports=admminrouter