// module importing 
const mongoose=require("mongoose")

// database connecting 
mongoose.connect("mongodb://127.0.0.1:27017/village")
.then(console.log("cat done"))
.catch((err)=>console.log(err))

// schema structuring 
const catSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true,
        required:true
    }
})

// model creating 
const catModel=new mongoose.model("categories",catSchema)


// module exporting 
module.exports=catModel