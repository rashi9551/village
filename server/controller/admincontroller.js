const adminmodel=require("../model/user")
const bcrypt=require("bcryptjs")


const login=async(req,res)=>{
    try {
        res.render("admin/adminlogin.ejs")
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}
const adminlogin=async(req,res)=>{
    try {
        const trues="true"
        const user= await adminmodel.findOne({isAdmin:trues})
        const passwordmatch= await bcrypt.compare(req.body.password, user.password)
        console.log(user.password);
        if(passwordmatch)
        {
            console.log("admin is in");
            req.session.isadAuth=true;
            res.redirect("/admin/adminpannel")
        }
        else
        {
            console.log("username thettahnu mwoney");
            res.render("admin/adminlogin",{passworderror:"invalid password"})
        }

        
    } catch (error) {
        console.log(error);
        res.render("admin/adminlogin",{username:"incorrect username"})
        
    }
}
const adminpannel=async(req,res)=>{
    try {
        res.render("admin/adminpannel")
        
    } catch (error) {
        res.send(error)
        
    }
}
const userslist=async(req,res)=>{
    try {
        const user= await adminmodel.find({})
        console.log(user);
        res.render("admin/userslist",{users:user})
        
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}






module.exports={
    adminlogin,
    login,
    adminpannel,
    userslist

}