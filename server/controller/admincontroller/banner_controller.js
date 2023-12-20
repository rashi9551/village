const bannerModel=require('../../model/banner_model')
const catModel=require('../../model/category_model')
const productModel=require('../../model/product_model')
const coupons=require('../../model/coupon_model')
const couponModel = require('../../model/coupon_model')
const { default: mongoose } = require('mongoose')

const bannerList=async(req,res)=>{
    try {
        const banners=await bannerModel.find({})
        console.log(banners);
        res.render("admin/bannerList",{banners:banners})
        
    } catch (error) {
        console.log(error);
        
    }
}

const addbannerpage=async(req,res)=>{
    try {
        const[categories,products,coupons]=await Promise.all([
            catModel.find(),
            productModel.find(),
            couponModel.find()
        ])

        res.render("admin/newBanner",{categories,products,coupons})
        
    } catch (error) {
        console.log(err);
        res.send("Error Occurred");
    }
}

const addBanner=async(req,res)=>{
    try {
        const {bannerLabel,bannerTitle,bannerimage,bannerSubtitle,bannerColor}=req.body

        const isVlaidObjectId=mongoose.Types.ObjectId.isValid;
        let bannerLink
        if(bannerLabel=='category'){
            bannerLink=req.body.category
        }
        else if(bannerLabel=='product'){
            bannerLink=req.body.product
        }
        else if(bannerLabel=='coupon'){
            bannerLink=req.body.coupon
        }
        else{
            bannerLink='general'
        }
        const newBanner= new bannerModel({
            label:bannerLabel,
            title:bannerTitle,
            subtitle:bannerSubtitle,

            image:{
                public_id:req.file.filename,
                url:`/uploads/${req.file.filename}`

            },
            color:bannerColor,
            bannerLink:bannerLink
        })
        newBanner.save()
        .then(()=>{
            res.redirect('/admin/bannerList');
        })
        .catch((error)=>{
            res.status(500).send('Error uploading banner');
            console.log(error)
        })
        
    } catch (error) {
        console.log(error);
        res.send("Error Occurred");     
    }
}

const addBanneePost=async(req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
        res.send("Error Occurred");  
    }
}



module.exports={
    bannerList,
    addbannerpage,
    addBanner

}