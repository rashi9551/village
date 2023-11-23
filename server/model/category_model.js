const mongoose=require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/village")
.then(console.log("cat done"))
.catch((err)=>console.log(err))

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


const catModel=new mongoose.model("category",catSchema)

module.exports=catModel