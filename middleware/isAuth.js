const userModel = require("../server/model/user_model");

const loged=async(req,res,next)=>{
    try {
        const user= await userModel.findOne({_id:req.session.userId})
        if(req.session.isAuth&&user&&user.status==false)
    {
        next()
    }
    else{
        res.render("users/signin");
    }
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}
const iflogged=async(req,res,next)=>{
    if(req.session.isAuth){
      res.redirect('/')
    }else{
      next()
    }
  }

const logedtohome=async(req,res,next)=>{
    try {
            const user= await userModel.findOne({_id:req.session.userId})
            if(req.session.isAuth &&user && user.status==false){
              next()
            }
              else{
                res.redirect('/profile')
              }
            
    
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}
const forgot=(req,res,next)=>{
    try {
        if (req.session.forgot) {
            next()
        }
        else{
            res.redirect("/");
        }
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}

const signforgot=(req,res,next)=>{
    try {
        if (req.session.signup || req.session.forgot) {
            next()
        }
        else{
            res.redirect("/");
        }
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}

const checkSessionVariable = (variableName,redirectPath) => {
    return (req, res, next) => {
      
      if (req.session[variableName]) {

        next();
      } else {
      
        res.redirect(redirectPath);
      }
    };
  };






module.exports={
    loged,
    logedtohome,
    forgot,
    signforgot,
    checkSessionVariable,
    iflogged
    
}