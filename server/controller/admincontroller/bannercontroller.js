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

const addbanner=async(req,res)=>{
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

const addBannerPost=async(req,res)=>{
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
        await newBanner.save()
        const banners=await bannerModel.find()
        res.render("admin/bannerList",{banners:banners})
        
    } catch (error) {
        console.log(error);
        res.send("Error Occurred");     
    }
}

const unlistBanner=async(req,res)=>{
    try {
        const id=req.params.id;
        const banner=await bannerModel.findOne({_id:id});
        banner.active = !banner.active;
        await banner.save();
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error);
        res.send("Error Occurred");  
    }
}

const updateBanner=async(req,res)=>{
    try {
        const id = req.params.id
        const banner = await bannerModel.findOne({ _id: id });
        const categories=await catModel.find();
        const products=await productModel.find();
        const coupons=await couponModel.find();
        res.render('admin/updateBanner',{banner,categories,products,coupons})

        
    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const updateBannerPost=async(req,res)=>{
    try {
        const id = req.params.id
        const { bannerLabel,bannerTitle,bannerSubtitle,bannerImage } = req.body
        console.log("the filke is here",req.file);
        const banner=await bannerModel.findOne({_id:id})

        let bannerLink;

        if(bannerLabel=="category"){
            bannerLink=req.body.category
           }
           else if(bannerLabel=="product"){
            bannerLink=req.body.product
           }
           else if(bannerLabel=="coupon"){
            bannerLink=req.body.coupon
           }
           else{
            bannerLink="general"
           }


        banner.bannerlink=bannerLink;
        banner.label = bannerLabel;
        banner.title = bannerTitle;
        banner.subtitle = bannerSubtitle;
        banner.color=req.body.bannerColor
        if (req.file) {
            banner.image = {
            public_id: req.file.filename, 
            url: `/uploads/${req.file.filename}` 
        }
    }

        await banner.save()
        res.redirect('/admin/bannerList')
        } catch (error) {
        console.log(error);
        res.send("Error Occurred");   
    }
}

const deleteBanner=async(req,res)=>{
    try {
        const id=req.params.id;
        const deletedBanner = await bannerModel.findByIdAndDelete(id)
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error)
        res.send(error)
        
    }
}





module.exports={
    bannerList,
    addbanner,
    addBannerPost,
    unlistBanner,
    updateBanner,
    updateBannerPost,
    deleteBanner

}