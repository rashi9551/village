const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/village")
.then(console.log("done"))
.catch((err)=>{console.log(err)})
const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    phone:{type:String,required:true},
    password:{type:String,required:true}
})
const userModel = new mongoose.model("userdetails",userSchema)


module.exports=userModel