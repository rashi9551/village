const orderModel=require("../../model/order_model");
const { orderReturn } = require("../usercontroller/ordercontroller");

const orderPage=async(req,res)=>{
    try {
        const orders=await orderModel.find({}).sort({createdAt:-1});
        res.render("admin/orderpage",{orderdata:orders})
        console.log(orders);
    } catch (error) {
        console.log(error);
        res.render("users/serverError");
    }
}
const updateorderstatus=async(req,res)=>{
    try {
        const {orderId,status}=req.body
        const updatedOrder=await orderModel.findOneAndUpdate(
            {_id:orderId},
            {$set:{status:status,updatedAt:Date.now()}},
            {new:true}
        )
        if(!updatedOrder){
            return res.status(404).json({error:"order not found"})
        }
        res.redirect('admin/orderPage')
    } catch (error) {
        console.log(error);
        res.render("users/serverError");

    }
}
const orderDetails=async(req,res)=>{
    try {
        const orderId=req.params.id
        const order=await orderModel.findById(orderId)
        res.render('admin/orderDetails',{orders:order})
    } catch (error) {
        console.log(error);
        res.render("users/serverError");
    }
}

module.exports={
    orderPage,
    updateorderstatus,
    orderDetails
}