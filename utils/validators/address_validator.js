const bnameValid =(fullname)=>{
    try{
    const nameRegex = /^[A-Za-z\s]+$/;
    return fullname.length>1 && nameRegex.test(fullname)
    }catch(error){
        console.log(error);
        res.render("users/serverError")
    }
}

const adphoneValid=(phone)=>{
    try {
        const phonRegex=/^[0-9]+$/;
        return phonRegex.test(phone)
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError")

    }
}

const pincodeValid=(code)=>{
    try {
        const pincodeRegex=/^[0-9]*$/;

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