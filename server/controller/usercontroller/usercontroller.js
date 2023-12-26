// modules importing 
const userModel = require("../../model/user_model");
const otpModel = require("../../model/user_otpmodel");
const otpgenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const bannerModel=require('../../model/banner_model')
const WalletModel=require('../../model/wallet_Model')
const bcrypt = require("bcryptjs");
const mongoose=require('mongoose')
const {
  nameValid,
  emailValid,
  phoneValid,
  confirmpasswordValid,
  passwordValid,
} = require("../../../utils/validators/usersignupvalidators");
const Email=process.env.Email
const pass=process.env.pass
const catModel = require("../../model/category_model");
const productModel = require("../../model/product_model");
const { product } = require("../admincontroller/productcontroller");


// otp generating function 
const generateotp = () => {
  const otp = otpgenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
  console.log("Generated OTP:", otp);
  return otp;
};

// otp email sending function 
const sendmail = async (email, otp) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Email, // replace with your Gmail username
        pass: pass, // replace with your Gmail password
      },
    });

    var mailOptions = {
      from: "Village<theVillage@gmail.com>",
      to: email,
      subject: "E-Mail Verification",
      text: "Your OTP is:" + otp,
    };

    // Use async/await for sending mail to make sure it completes before logging success
    await transporter.sendMail(mailOptions);

    console.log("E-mail sent successfully");
  } catch (err) {
    console.log("Error in sending mail:", err);
  }
};


// home page rendering 
const index = async (req, res) => {
  try {
    const [categories, banners] = await Promise.all([
      catModel.find(),
      bannerModel.find()
    ]);

    console.log(categories);
    console.log(banners);

    res.render("users/index", { categories, banners });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const bannerURL=async(req,res)=>{
  try{

      const bannerId=req.query.id
      console.log(bannerId);
      const banner=await bannerModel.findOne({_id:bannerId})
      if(banner.label=="category"){
        console.log("ithu banner link",banner.bannerLink)
          const categoryId=new mongoose.Types.ObjectId(banner.bannerlink)
          const  category=await catModel.findOne({_id: categoryId})
          res.redirect(`/shop/?category=${categoryId}`)
          
      }
      else if(banner.label=="product"){
        console.log("ithu banner link",banner.bannerLink)
          const productId=new mongoose.Types.ObjectId(banner.bannerlink)
          const  product=await productModel.findOne({_id: productId})
          console.log("product indo",product)
          res.redirect(`/singleproduct/${productId}`)
      
      }
      else if(banner.label=="coupon"){
          const couponId=new mongoose.Types.ObjectId(banner.bannerlink)
          const  coupon=await couponModel.findOne({_id: couponId})
          res.redirect("/profile")
      
      }
      else{
          res.redirect("/")
      }

  }
  catch(err){
      console.log(err);
      res.send(err)
  }
}
// shoping page 
const shop = async (req, res) => {
  try {
    const category = req.query.category;
    const products = await productModel.find({$and:[{category},{status:true}] }).exec();
    const categories = await catModel.find();
    const ctCategory = categories.find(cat => cat._id.toString() === category);
    const categoryName =ctCategory ? ctCategory.name : null;
    const theCategory = await catModel.find({_id:category})
    res.render("users/shop", {theCategory, categoryName,categories,products, selectedCategory: category });
    console.log("ipooooo",theCategory)
  } catch (error) {
    console.log(error);
    res.status(500).send("error occured");
  }
};


const searchProducts = async (req, res) => {
  try {
  const searchProduct = req.body.searchProducts;

  
    const data = await catModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, 'i') },
    });

    const productdata=await productModel.findOne({
      name:{$regex: new RegExp(`^${searchProduct}`, 'i')}
    });

    const result = await catModel.aggregate([
      {
        $match: {
          types: {
            $elemMatch: {
              $regex: new RegExp(`^${searchProduct}`, 'i')
            }
          }
        }
      },
      {
        $unwind: "$types"
      },
      {
        $match: {
          "types": {
            $regex: new RegExp(`^${searchProduct}`, 'i')
          }
        }
      },
      {
        $project: {
          _id: 0,
          categoryName: "$name", // Add other fields as needed
          matchingType: "$types"
        }
      }
    ]);
    console.log("nskbvbnsc ",result);
    
    
    
    
  
  
    
    if (data){
      const categoryId=data._id
      return res.redirect(`/shop?category=${categoryId}`)
    }
    else if (result.length!==0) {
      const categoryData=result[0].matchingType
      const foundCategory = await catModel.findOne({
          types: {
            $in: [categoryData]
          }
        });
    
      res.redirect(`/filterProducts?category=${foundCategory._id}&filterType=${categoryData}`);

    }
    
    else if(productdata){
      const productId=productdata._id
      return res.redirect(`/singleproduct/${productId}`)
    }
    else{
      res.redirect('/')
    }
  }
  catch (err) {
    console.error(err);

    // Sending a more informative error response
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};


const filterProducts=async(req,res)=>{
  try {
    const category=req.query.category;
    const selectedType=req.query.filterType;
    const sortOption=req.query.sortOption;
    
    let products;

    const filterConditions={
      category:category,
      status:true,
    }
    if(selectedType&&selectedType !=='All')
    {
      filterConditions.type=selectedType;
    }
    if(sortOption==='-1')
    {
      products=await productModel.find(filterConditions).sort({price:-1}).exec();

    }else if(sortOption==='1')
    {
      products=await productModel.find(filterConditions).sort({price:1}).exec();
    }else{
      products = await productModel.find(filterConditions).exec();

    }
    const categories = await catModel.find();
        const ctCategory = categories.find(cat => cat._id.toString() === category);
        const categoryName = ctCategory ? ctCategory.name : null;
        const theCategory = await catModel.find({ _id: category });

        res.render("users/shop", {
            selectedType,
            theCategory,
            categoryName,
            categories,
            products,
            selectedCategory: category,
            sorting: getSortingLabel(sortOption), // Pass the sorting label to the view
        });

        console.log("ipooooo", theCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send("error occured");
  }
}

function getSortingLabel(sortOption) {
  if (sortOption === '-1') {
      return 'Price: High To Low';
  } else if (sortOption === '1') {
      return 'Price: Low To High';
  } else {
      return 'Default Sorting'; // Add more labels based on your sorting options
  }
}

const sortProducts=async(req,res)=>{
  try {
    const sortOption = parseInt(req.query.sortPro, 10);    
    const selectedType=req.query.type
    const category=req.query.category

    let products;
    console.log(sortOption);

    if(selectedType=='All')
    {
      products=await productModel.find({$and:[{category:category},{status:true}]}).sort({price:sortOption}).exec()

    }
    else{
      products=await productModel.find({$and:[{category:category},{status:true}]}).sort({price:sortOption}).exec()
        
      
    }
    let sorting;
    if(sortOption==='-1'){
      sorting="Price: High To Low"
    }
    else if(sortOption=='1'){
      sorting="Price: Low To High"
    }
    console.log("propro",products);
    const categories=await catModel.find();
    const ctCategory=categories.find(cat=>cat.id.toString()===category)
    const categoryName =ctCategory ? ctCategory.name : null;
    const theCategory = await catModel.find({_id:category})
    res.render("users/shop", {selectedType,theCategory, categoryName,categories,products:products,sortoption:sortOption, selectedCategory: category ,sorting});
    console.log("ipoppop",theCategory);

  } catch (error) {
    console.log(error);
    res.send(error)
  }
}

// single product page 
const singleproduct=async(req,res)=>{
  try{
      const id=req.params.id
      console.log("haywan",id);
      const product = await productModel
      .findOne({ _id: id })
      .populate({
        path: 'userRatings.userId',
        select: 'username'
      });        
      const type= product.type;

      const convertedId = new mongoose.Types.ObjectId(id);
      

      const result = await productModel.aggregate([
          {
            $match: {_id:convertedId}
          },
          {
            $unwind:{ path:"$userRatings",
            preserveNullAndEmptyArrays: true
          }
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$userRatings.rating" },
              totalRatings: { $sum: 1 }
            }
          }
        ]);
        
        const averageRating = result.length > 0 ? result[0].averageRating : 0;
        const totalRatings = result.length > 0 ? result[0].totalRatings : 0;

        console.log('hey there',result);

        console.log(averageRating,totalRatings);


      const similar = await productModel
      .find({ type: type, _id: { $ne: id } })
      .limit(4);
      console.log("similar",similar);
      const categories = await catModel.find();
      product.images = product.images.map(image => image.replace(/\\/g, '/'));
      console.log('Image Path:', product.images[0]);
      console.log("ithu rateng aa ",product.userRatings[0])
      res.render('users/singleproduct',{categories,product:product,similar,averageRating,totalRatings})
      
  }
  catch(err){
      console.log("Shopping Page Error:",err);
      res.status(500).send('Internal Server Error');
    }

}

// user profile page 
const profile = async (req, res) => {
  try {
      const categories = await catModel.find();
      const id = req.session.userId;
      const user = await userModel.findOne({ _id: id }); // Assuming you want to find the first user
      console.log(user.username);
      const name = user.username;
      res.render("users/profile", { categories, name });
      console.log(req.session.user);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// user signup page 
const signup = async (req, res) => {
  await res.render("users/signup");
};

// user otp sneding 
const signotp = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const cpassword = req.body.confirm_password;
    let referralCode;
        if(req.body.referralCode){
        referralCode=req.body.referralCode
        }

    const isusernameValid = nameValid(username);
    const isEmailValid = emailValid(email);
    const isPhoneValid = phoneValid(phone);
    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    const emailExist = await userModel.findOne({ email: email });
    if (emailExist) {
      res.render("users/signup", { emailerror: "E-mail already exits" });
    } else if (!isusernameValid) {
      res.render("users/signup", { nameerror: "Enter a valid Name" });
    } else if (!isEmailValid) {
      res.render("users/signup", { emailerror: "Enter a valid E-mail" });
    } else if (!isPhoneValid) {
      res.render("users/signup", { phoneerror: "Enter a valid Phone Number" });
    } else if (!ispasswordValid) {
      res.render("users/signup", {
        passworderror: "Password should contain one(A,a,2)",
      });
    } else if (!iscpasswordValid) {
      res.render("users/signup", {
        cpassworderror: "Password and Confirm password should be match",
      });
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const user = new userModel({
        username: username,
        email: email,
        phone: phone,
        password: hashedpassword,
      });
      if(referralCode){
        req.session.referralCode=referralCode
        }
      req.session.user = user;
      req.session.signup = true;
      req.session.forgot = false;

      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 30 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);
      await sendmail(email, otp);
      res.redirect("/otp");
    }
  } catch (err) {
    console.error("Error:", err);
    res.send("error");
  }
};

// otp page rendering 
const otp = async (req, res) => {
  try {
      res.render("users/otp");
  } catch {
    res.status(200).send("error occured");
  }
};

// otp verifying page 
const verifyotp = async (req, res) => {
  try {
      const enteredotp = req.body.otp;
      const user = req.session.user;
      console.log(enteredotp);
      console.log(req.session.user);
      const email = req.session.user.email;
      const userdb = await otpModel.findOne({ email: email });
      const otp = userdb.otp;
      const expiry = userdb.expiry;
      console.log(otp);
      if (enteredotp == otp && expiry.getTime() >= Date.now()) {
        user.isVerified = true;
        user.isVerified = true;
            try {
                if(req.session.signup){
                await userModel.create(user)

                const userdata = await userModel.findOne({ email: email });
                req.session.userId = userdata._id;
                req.session.isAuth=true
                const referral=req.session.referralCode
                console.log("referal",referral);
                const winner=await WalletModel.findOne({userId:referral})
                console.log("winner",winner);
                if (winner) {
                    const updatedWallet = winner.wallet + 50;
                
                    await WalletModel.findOneAndUpdate(
                        { userId: referral },
                        { $set: { wallet: updatedWallet } },
                        { new: true }
                    );
                
                    const transaction = {
                        reason:"Wallet Rewards",
                        date: new Date(),
                        type: "Credited", 
                        amount: 50,
                    };
                
                    await WalletModel.findOneAndUpdate(
                        { userId: referral },
                        { $push: { walletTransactions: transaction } },
                        { new: true }
                    );
                
                    console.log("Added 50 to the user's wallet.");
                } else {
                    console.log("User not found with the provided referral code.");
                }

                res.redirect('/')
                
                }
                else if(req.session.forgot){
                   
                    res.redirect('/newpassword')
                    
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error occurred while saving user data');
            }
      } else {
        res.render("users/otp",{otperror:"Worng password/Time expired"});
      }
   
  } catch (error) {
    console.log(err);
    res.status(500).send("error occured");
  }
};
const resendotp = async (req, res) => {
  try {
    console.log("resend otp is working");
      const email = req.session.user.email;
      const otp = generateotp();
      console.log(otp);

      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 30 * 1000;
      await otpModel.updateOne(
        { email: email },
        { otp: otp, expiry: new Date(expiryTimestamp) }
      );
      await sendmail(email, otp);
    
  } catch (err) {
    console.log(err);
  }
};
const login = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await userModel.findOne({ username: username });

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    const passwordmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (passwordmatch && !user.status) {
      // Authentication successful
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.isAuth = true;
      res.redirect("/");
    } else{
      res.render("users/signin", { passworderror: "incorrect passwordor/username" });
    }
      // Authentication failed
  } catch (error) {
    res.render("users/signin", { passworderror: "incorrect passwordor/username" });

  }
};
const forgotpassword = async (req, res) => {
  try {
    res.render("users/forgot");
  } catch {
    res.status(200).send("error occured");
  }
};
const forgotverify = async (req, res) => {
  try {
    const email = req.body.email;
    const emailexist = await userModel.findOne({ email: email });
    // req.session.id=emailexist._id
    console.log(emailexist);
    if (emailexist) {
      req.session.forgot = true;
      req.session.signup = false;
      req.session.user = { email: email };
      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 60 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);

      await sendmail(email, otp);
      res.redirect("/otp");
    } else {
      res.render("users/forgot", { emaile: "E-Mail Not Exist" });
    }
  } catch (err) {
    res.status(400).send("error occurred: " + err.message);
    console.log(err);
  }
};
const newpassword = async (req, res) => {
  try {
      res.render("users/newpassword");
  } catch {
    res.status(400).send("error occured");
  }
};
const resetpassword = async (req, res) => {
  try {
      const password = req.body.newPassword;
      const cpassword = req.body.confirmPassword;

      const ispasswordValid = passwordValid(password);
      const iscpasswordValid = confirmpasswordValid(cpassword, password);

      if (!ispasswordValid) {
        res.render("users/newpassword", {
          perror: "Password should contain (A,a,@)",
        });
      } else if (!iscpasswordValid) {
        res.render("users/newpassword", { cperror: "Passwords not match" });
      } else {
        const hashedpassword = await bcrypt.hash(password, 10);
        const email = req.session.user.email;
        await userModel.updateOne(
          { email: email },
          { password: hashedpassword }
        );
        req.session.forgot = false;
        res.redirect("/");
      }
  } catch {
    res.status(400).send("error occured");
  }
};

const logout = async (req, res) => {
  try {
    
      req.session.isAuth = false;
      req.session.destroy();
      res.redirect("/");
    
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};



// modules exporting
module.exports = {
  index,
  signup,
  signotp,
  login,
  otp,
  verifyotp,
  resendotp,
  forgotpassword,
  forgotverify,
  newpassword,
  resetpassword,
  shop,
  singleproduct,
  profile,
  logout,
  filterProducts,
  sortProducts,
  searchProducts,
  bannerURL

};
