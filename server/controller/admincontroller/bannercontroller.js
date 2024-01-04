const bannerModel=require('../../model/banner_model')
const catModel=require('../../model/category_model')
const productModel=require('../../model/product_model')
const coupons=require('../../model/coupon_model')
const couponModel = require('../../model/coupon_model')
const { default: mongoose } = require('mongoose')
const flash=require('express-flash')
const {alphanumValid}=require('../../../utils/validators/admin_validator')

const bannerList=async(req,res)=>{
    try {
        const banners=await bannerModel.find({})
        res.render("admin/bannerList",{banners:banners})
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError");

        
    }
}

const addbanner=async(req,res)=>{
    try {
        const categories=await catModel.find();
        const products=await productModel.find();
        const coupons=await couponModel.find();
        res.render('admin/newBanner',{categories,products,coupons,bannerInfo:req.session.bannerInfo,expressFlash:{
            titleError:req.flash("titleError"),
            subtitleError:req.flash("subtitleError")
        }});
        req.session.bannerInfo=null
    }  catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const addBannerPost=async(req,res)=>{
    try {
        const {bannerLabel,bannerTitle,bannerimage,bannerSubtitle,bannerColor}=req.body

        const subtitleValid = alphanumValid(bannerSubtitle)

        const titleValid = alphanumValid(bannerTitle)

        if(!titleValid){
            req.flash("titleError","Invalid Entry !")
            return res.redirect("/admin/newbanner")
        }
        if(!subtitleValid){
            req.flash("subtitleError","Invalid Entry !")
            return res.redirect("/admin/newbanner")
        }
        req.session.bannerInfo=null;
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
            bannerlink:bannerLink
        })
        console.log("ithu banner link",bannerLink)

        await newBanner.save()
        const banners=await bannerModel.find()
        res.render("admin/bannerList",{banners:banners})
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError");
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
        res.render("users/serverError");
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
        res.render("users/serverError");
        
    }
}

const updateBannerPost=async(req,res)=>{
    try {
        const id = req.params.id
        const { bannerLabel,bannerTitle,bannerSubtitle,bannerImage } = req.body
        console.log("the file is here",req.file);
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
        res.render("users/serverError");
    }
}

const deleteBanner=async(req,res)=>{
    try {
        const id=req.params.id;
        const deletedBanner = await bannerModel.findByIdAndDelete(id)
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error)
        res.render("users/serverError");
        
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