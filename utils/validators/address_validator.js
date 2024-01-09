const bnameValid =(fullname)=>{
    try{
    nameRegex=/^[A-Za-z]+$/
    return fullname.length>1 && nameRegex.test(fullname)
    }catch(error){
        console.log(error);
        res.render("users/serverError")
    }
}

const adphoneValid=(phone)=>{
    try {
        phonRegex=/^[0-9]{10}$/
        return phonRegex.test(phone)
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError")

    }
}

const pincodeValid=(code)=>{
    try {
        pincodeRegex=/^[0-9]{6}$/
        return pincodeRegex.test(code)
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError")      
    }
}

module.exports={
    bnameValid,
    adphoneValid,
    pincodeValid,
    
}