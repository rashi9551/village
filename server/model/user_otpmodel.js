// module importing 
const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")

// database connecting 
mongoose.connect("mongodb://127.0.0.1:27017/village")
.then(console.log("done otp"))
.catch((err)=>console.log(err));

// schema structuring 
const otpSchema=new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiry: { type: Date,required:true }, 
})

// model creating 
const otpModel=new mongoose.model("otp_details",otpSchema)

// module exporting 
module.exports=otpModel