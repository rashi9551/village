const adisAuth=(req,res,next)=>{
    try {
        if(req.session.isadAuth)
    {
        next()
    }
    else{
        res.redirect("/admin")
    }
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}

const logoutAdmin = (req, res, next) => {
    if(!req.session.admin){
        next()
    } else {
        res.redirect('/admin/adminpanel')
    }
}

module.exports={
    adisAuth,
    logoutAdmin
}