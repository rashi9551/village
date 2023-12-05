const express =require("express")
const bodyparser = require('body-parser')
const router=require("./server/routers/user")
const path = require('path')
const nocache=require("nocache")
const session=require('express-session')
const multer=require("multer")
const mongo=require("./config/db")
const { PORT } = require("./.env")

const adminrouter=require("./server/routers/admin")


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

mongo.connect()

app.use("/",router)
app.use("/admin",adminrouter)

// porting 
app.listen(PORT,()=>{
    console.log("http://localhost:3000 server is running mwoney");
})