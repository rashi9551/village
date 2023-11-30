// module importing 
const mongoose=require("mongoose")

// database connecting 
mongoose.connect("mongodb://127.0.0.1:27017/village")
.then(console.log("carts done"))
.catch((err)=>console.log(err))

const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userdetails',
    },
    sessionId: String,
    item: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        
        stock:{
          type:Number,
          required:true,
      },
  
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    total: Number,
  });

const cartModel=new mongoose.model("cart",cartSchema)

module.exports=cartModel