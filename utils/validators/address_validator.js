const bnameValid =(fullname)=>{
    nameRegex=/^[A-Za-z]+$/
    return fullname.length>1 && nameRegex.test(fullname)
}

const adphoneValid=(phone)=>{
    phonRegex=/^[0-9]{10}$/
    return phonRegex.test(phone)
}

const pincodeValid=(code)=>{
    pincodeRegex=/^[0-9]{6}$/
    return pincodeRegex.test(code)
}

module.exports={
    bnameValid,
    adphoneValid,
    pincodeValid,
    
}