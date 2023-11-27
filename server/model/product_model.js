// module importing 
const mongoose=require("mongoose")
const Schema=mongoose.Schema

// database connecting 
mongoose.connect("mongodb://127.0.0.1:27017/village")
.then(console.log("product done"))
.catch((err)=>console.log(err))

// schema structuring 
const productSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'categories', 
      required: true,
  },
    price:{
        type:Number,
        required:true
    },
    images: {
    type:Array,
    required:true,
    },
    stock: {
  
          type: Number,
          required: true,
      
      },
      status:{
        type:Boolean,
        default:true,
      },
    description:{
        type:String,
        required:true
    }
    
})

// model creating 
const productModel=new mongoose.model("products",productSchema)

// module exporting 
module.exports=productModel