const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username:{type:String,
            required:true
            },
    email:{type:String,
            required:true,
            unique:true
            },
    phone:{type:String,
            required:true
            },
    password:{type:String,
        required:true   
        },
    address: {
                type: [{
                  saveas:{type:String},
                  fullname:{type:String},
                  adname:{type:String},
                  street: { type: String},
                  pincode:{type:Number},
                  city: { type: String },
                  state:{type:String},
                  country:{type:String},
                  phonenumber:{type:Number}
                }]},
    status:{type:Boolean,
        default:false,
        required:true
        }
})
const userModel = new mongoose.model("userdetails",userSchema)


module.exports=userModel