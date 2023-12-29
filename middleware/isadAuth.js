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

module.exports={
    adisAuth
}