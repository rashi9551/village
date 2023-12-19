const bannerModel=require('../../model/banner_model')

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
        res.render("admin/newBanner")
        
    } catch (error) {
        console.log(err);
        res.send("Error Occurred");
    }
}

const addBanner=async(req,res)=>{
    try {
        const {bannerLabel,bannerTitle,bannerimage,bannerSubtitle}=req.body

        const newBanner= new bannerModel({
            label:bannerLabel,
            title:bannerTitle,
            subtitle:bannerSubtitle,

            image:{
                public_id:req.file.filename,
                url:`/uploads/${req.file.filename}`

            }
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
        console.log(err);
        res.send("Error Occurred");     
    }
}


module.exports={
    bannerList,
    addbannerpage,
    addBanner

}