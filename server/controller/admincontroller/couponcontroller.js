const couponModel=require('../../model/coupon_model')
const createCoupon=async(req,res)=>{
    try {
        const{couponCode,minimumPrice,discount,expiry}=req.body

        const couponExists=await couponModel.findOne({couponCode:couponCode});

        if(couponExists){
            console.log("coupon exists");
            res.redirect("/admin/couponlist");
        }
        else{
            await couponModel.create({
                couponCode:couponCode,
                minimumPrice:minimumPrice,
                discount:discount,
                expiry:expiry
            })
            console.log("coupon created");
            res.redirect("/admin/couponList");
        }
    } catch (error) {
        console.log(error);
    }
}
const couponList=async(req,res)=>{
    try {
        const coupons=await couponModel.find({})
        res.render('admin/couponList',{coupons})
    } catch (error) {
        console.log(error);
    }
}

const addcouponpage=async(req,res)=>{
    try {
        res.render("admin/addCoupon")
    } catch (error) {
        console.log(error);
    }
}


module.exports={
    createCoupon,
    couponList,
    addcouponpage,
    


}