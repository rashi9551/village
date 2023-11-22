const express =require("express")
const bodyparser = require('body-parser')
const router=require("./server/routers/user")
const path = require('path')
const nocache=require("nocache")
const session=require('express-session')

// const adminrouter=require("./server/routers/admin")


const app=express()
app.use(bodyparser.urlencoded({extended:true}))
app.use(nocache())
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
}));


app.use(express.static(__dirname +'/public'))
app.use(express.static(__dirname +'/public/userAssets'))
app.use(express.static(__dirname +'/public/adminAssets'))
app.set("view engine","ejs")
app.set('views',path.join(__dirname,'views'))

app.use("/",router)
// app.use("/admin",adminrouter)

// porting 
app.listen(3000,()=>{
    console.log("http://localhost:3000 server is running mwoney");
})