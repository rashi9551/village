const alphanumValid =(name)=>{
    try {
        nameRegex= /^(?! )[A-Za-z0-9 ]*(?<! )$/;
        return nameRegex.test(name)
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError") 
    }
}

const onlyNumbers =(str)=>{
    try {
        const numbersOnlyRegex =/^[1-9][0-9]*(\.[0-9]+)?$/;
        return str.length>0 && numbersOnlyRegex.test(str);
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError") 
    }
}

const zerotonine = (str) => {
    try {
        const numbersOnlyRegex = /^(0|[1-9][0-9]*)$/;
        return str.length > 0 && numbersOnlyRegex.test(str);
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError") 
    }
}

const uppercaseAlphanumValid = (input) => {
    try {
        const regex = /^[A-Z0-9]*$/;
        return regex.test(input);
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError") 
    }
}


const isFutureDate = (selectedDate) => {
    try {
        const selectedDateTime = new Date(selectedDate);
        const currentDate = new Date();
        return selectedDateTime > currentDate;
        
    } catch (error) {
        console.log(error);
        res.render("users/serverError") 
    }
}
module.exports={
    alphanumValid,
    onlyNumbers,
    zerotonine,
    uppercaseAlphanumValid,
    isFutureDate
}