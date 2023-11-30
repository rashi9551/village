const catModel=require("../model/category_model")
const userModel=require("../model/user_model") 
const bcrypt=require("bcryptjs")


const {
    nameValid,
    emailValid,
    phoneValid,
    confirmpasswordValid,
    passwordValid,
  } = require("../../utils/validators/usersignupvalidators");

const userdetails=async(req,res)=>{
    try {
        const userid =req.session.userId
        console.log("id:",userid);
        const userdata=await userModel.findOne({_id:userid})
        const categories=await catModel.find()
        res.render("users/userdetails",{categories,userData:userdata})
    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const profileEdit=async(req,res)=>{
    try {
        const userId=req.session.userId
        const userData=await userModel.findOne({_id:userId})
        const categories=await catModel.find()
        res.render("users/editprofile",{userData:userData,categories})

    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const profileUpdate=async(req,res)=>{
    try {
        const id=req.session.userId
        const{username,phone,email}=req.body
        console.log("values:",username,phone,email);
        const data=await userModel.updateOne({_id:id},{$set:{username:username,phone:phone}})
        console.log(data);
        res.redirect("/userdetails")
        
    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const newAddress=async(req,res)=>{
    try{
        const categories = await catModel.find();
        res.render('users/newAddress',{categories})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const updateAddress=async(req,res)=>{
    try {
        const { saveas,fullname,adname,street,pincode,city,state,country,phone } = req.body;
        const userId = req.session.userId;
        console.log("id", userId);

        const existingUser = await userModel.findOne({ _id: userId });

        if (existingUser) {
            // Corrected query to find existing address for the user
            const existingAddress = await userModel.findOne({
                '_id': userId,
                'address': {
                    $elemMatch: {
                        'fullname': fullname,
                        'adname': adname,
                        'street': street,
                        'pincode': pincode,
                        'city': city,
                        'state': state,
                        'country': country,
                        'phonenumber': phone
                    }
                }
            });
            
            if (existingAddress) {
                // req.flash('address', 'This Address already existed');
                return res.redirect('/addAddress');
            }

            existingUser.address.push({
                saveas:saveas,
                fullname: fullname,
                adname:adname,
                street: street,
                pincode: pincode,
                city: city,
                state:state,
                country:country,
                phonenumber:phone
               
            });

            await existingUser.save();

            // req.flash('address', 'Address added successfully');
            return res.redirect('/userdetails');
        }
        const newAddress = await userModel.create({
            userId: userId,
            address: {
                saveas:saveas,
                fullname: fullname,
                adname:adname,
                street: street,
                pincode: pincode,
                city: city,
                state:state,
                country:country,
                phonenumber:phone
               
            },
        });
        res.redirect('/userdetails');
    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const editaddress=async(req,res)=>{
    try {
        const addressid=req.params.addressId
        const userid=req.session.userId
        console.log("the id is:",addressid);
        const user = await userModel.findById(userid);
        const addressToEdit = user.address.id(addressid);
        console.log(addressToEdit);
        const categories=await catModel.find()
        res.render("users/editaddress",{addressToEdit,categories})
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}

const editaddressupdate = async (req, res) => {
    try {
        const { saveas, fullname, adname, street, pincode, city, state, country, phone } = req.body;
        const addressId=req.params.addressId
        const userId = req.session.userId;
        console.log("id", userId);

        // Check if the new address already exists for the user excluding the currently editing address
        const isAddressExists = await userModel.findOne({
            '_id': userId,
            'address': {
                $elemMatch: {
                    '_id': { $ne: addressId }, // Exclude the currently editing address
                    'saveas': saveas,
                    'fullname': fullname,
                    'adname': adname,
                    'street': street,
                    'pincode': pincode,
                    'city': city,
                    'state': state,
                    'country': country,
                    'phonenumber': phone
                }
            }
        });

        if (isAddressExists) {
            // Address with the same details already exists, handle it accordingly
            return res.status(400).send('Address already exists');
        }

        // Update the existing address based on the addressId
        const result = await userModel.updateOne(
            { '_id': userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.saveas': saveas,
                    'address.$.fullname': fullname,
                    'address.$.adname': adname,
                    'address.$.street': street,
                    'address.$.pincode': pincode,
                    'address.$.city': city,
                    'address.$.state': state,
                    'address.$.country': country,
                    'address.$.phonenumber': phone
                }
            }
        );

        // Check if the update was successful
        
            res.redirect('/userdetails');
    } catch (err) {
        res.status(500).send('Error occurred');
        console.log(err);
    }
};

const deleteAddress=async(req,res)=>{
    try {
        const addressId=req.params.addressId
        const userId=req.session.userId
        const data=await userModel.updateOne({_id:userId,"address._id":addressId},{$pull:{address:{_id:addressId}}})
        console.log("ithaahnu data",data);
        res.redirect("/userdetails")
    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}

const changepassword=async(req,res)=>{
    try {
        const userid=req.session.userId
        const password=req.body.newPassword
        const cpassword=req.body.confirmPassword
        const ispasswordvalid=passwordValid(password)
        const isconfirmpasswordvallid=confirmpasswordValid(cpassword,password)
        const categories=await catModel.find()
        const user = await userModel.findById(userid);
        

        if(!ispasswordvalid)
        {
            console.log("passwor not valid");
            res.render("users/userdetails",{perror:"passworld have (A,a,@)",categories:categories,userData:user})
        }
        else if(!isconfirmpasswordvallid)
        {
            res.render("users/userdetails",{cperror:"passworld dont matched",categories:categories,userData:user})
        }
        else{
            const hashedpassword=await bcrypt.hash(password,10)
            await userModel.updateOne({_id:userid},{password:hashedpassword})
            res.redirect("/userdetails")
        }

    } catch (error) {
        console.log(error);
        res.send(error)
        
    }
}
module.exports={
    userdetails,
    profileEdit,
    profileUpdate,
    newAddress,
    updateAddress,
    editaddress,
    editaddressupdate,
    deleteAddress,
    changepassword

}