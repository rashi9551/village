const express =require("express")
require('dotenv').config()


const bodyparser = require('body-parser')
const router=require("./server/routers/user")
const path = require('path')
const nocache=require("nocache")
const session=require('express-session')
const multer=require("multer")
const mongoose=require("mongoose")
const adminrouter=require("./server/routers/admin")
const { error } = require("console")

mongoose.connect(process.env.MONGO_URL)


const port=process.env.PORT


const app=express()
app.use(express.json());
app.use(bodyparser.json()); 
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


app.use('/uploads',express.static('uploads'))




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname+".png"); 
  }
});

const upload = multer({ storage: storage });

app.post('/your-upload-route', upload.array('files'), (req, res) => {
  console.log(req.files);
});


app.use("/",router)
app.use("/admin",adminrouter)

// porting 
app.listen(port,()=>{
    console.log("http://localhost:3000 server is running mwoney");
})