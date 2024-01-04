const catModel = require("../../model/category_model");
const cartModel = require("../../model/cart_model");
const userModel = require("../../model/user_model");
const bcrypt = require("bcryptjs");
const favModel = require("../../model/favourite_model");
const {
  passwordValid,
} = require("../../../utils/validators/usersignupvalidators");
const productModel = require("../../model/product_model");

const userdetails = async (req, res) => {
  try {
    const userid = req.session.userId;
    console.log("id:", userid);
    const userdata = await userModel.findOne({ _id: userid });
    const categories = await catModel.find();
    console.log("rnthhanu", userdata.address);
    res.render("users/userdetails", { categories, userData: userdata });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const profileEdit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userData = await userModel.findOne({ _id: userId });
    const categories = await catModel.find();
    res.render("users/editprofile", { userData: userData, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const profileUpdate = async (req, res) => {
  try {
    const id = req.session.userId;
    const { username, phone, email } = req.body;
    console.log("values:", username, phone, email);
    const data = await userModel.updateOne(
      { _id: id },
      { $set: { username: username, phone: phone } }
    );
    console.log(data);
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const newAddress = async (req, res) => {
  try {
    const categories = await catModel.find();
    res.render("users/newAddress", { categories });
  } catch (err) {
    res.status(500).send("error occured");
    console.log(err);
  }
};

const updateAddress = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const userId = req.session.userId;
    console.log("id", userId);

    const existingUser = await userModel.findOne({ _id: userId });

    if (existingUser) {
      // Corrected query to find existing address for the user
      const existingAddress = await userModel.findOne({
        _id: userId,
        address: {
          $elemMatch: {
            fullname: fullname,
            adname: adname,
            street: street,
            pincode: pincode,
            city: city,
            state: state,
            country: country,
            phonenumber: phone,
          },
        },
      });

      if (existingAddress) {
        // req.flash('address', 'This Address already existed');
        return res.redirect("/addAddress");
      }

      existingUser.address.push({
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      });

      await existingUser.save();

      // req.flash('address', 'Address added successfully');
      return res.redirect("/userdetails");
    }
    const newAddress = await userModel.create({
      userId: userId,
      address: {
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      },
    });
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const editaddress = async (req, res) => {
  try {
    const addressid = req.params.addressId;
    const userid = req.session.userId;
    console.log("the id is:", addressid);
    const user = await userModel.findById(userid);
    const addressToEdit = user.address.id(addressid);
    console.log(addressToEdit);
    const categories = await catModel.find();
    res.render("users/editaddress", { addressToEdit, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const editaddressupdate = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    console.log("id", userId);

    // Check if the new address already exists for the user excluding the currently editing address
    const isAddressExists = await userModel.findOne({
      _id: userId,
      address: {
        $elemMatch: {
          _id: { $ne: addressId }, // Exclude the currently editing address
          saveas: saveas,
          fullname: fullname,
          adname: adname,
          street: street,
          pincode: pincode,
          city: city,
          state: state,
          country: country,
          phonenumber: phone,
        },
      },
    });

    if (isAddressExists) {
      // Address with the same details already exists, handle it accordingly
      return res.status(400).send("Address already exists");
    }

    // Update the existing address based on the addressId
    const result = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.saveas": saveas,
          "address.$.fullname": fullname,
          "address.$.adname": adname,
          "address.$.street": street,
          "address.$.pincode": pincode,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.phonenumber": phone,
        },
      }
    );

    // Check if the update was successful

    res.redirect("/userdetails");
  } catch (err) {
    res.status(500).send("Error occurred");
    console.log(err);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const data = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log("ithaahnu data", data);
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const changepassword = async (req, res) => {
  try {
    const userid = req.session.userId;
    const password = req.body.newPassword;
    const newpassword = req.body.confirmPassword;
    const ispasswordvalid = passwordValid(newpassword);
    // const isconfirmpasswordvallid=confirmpasswordValid(cpassword,password)
    const categories = await catModel.find();
    const user = await userModel.findById(userid);
    const passwordmatch = await bcrypt.compare(password, user.password);
    if (passwordmatch) {
      if (!ispasswordvalid) {
        console.log("passwor not valid");
        res.render("users/userdetails", {
          perror: "passworld have (A,a,@)",
          categories: categories,
          userData: user,
        });
      }
      // if(!isconfirmpasswordvallid)
      // {
      //     res.render("users/userdetails",{cperror:"passworld dont matched",categories:categories,userData:user})
      // }
      else {
        const newhashedpassword = await bcrypt.hash(newpassword, 10);
        await userModel.updateOne(
          { _id: userid },
          { password: newhashedpassword }
        );
        res.redirect("/userdetails");
      }
    } else {
      res.render("users/userdetails", {
        perror: "old password is incorrect",
        categories: categories,
        userData: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const addtofavourite = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;

    let fav;
    if (userId) {
      fav = await favModel.findOne({ userId: userId });
    }
    if (!fav) {
      fav = await favModel.findOne({ sessionId: req.session.id });
    }

    if (!fav) {
      fav = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    const productExist = fav.item.findIndex((item) => item.productId == pid);

    if (productExist !== -1) {
      fav.item[productExist].quantity += 1;
      fav.item[productExist].total = fav.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        price: price,
      };
      fav.item.push(newItem);
    }

    if (userId && !fav.userId) {
      fav.userId = userId;
    }

    await fav.save();
    res.redirect("/favouritespage");
  } catch (err) {
    console.error(err);
    res.render("users/serverError")
  }
};
const favouritespage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.id;
    const categories = await catModel.find();
    let fav;

    if (userId) {
      fav = await favModel.findOne({ userId: userId }).populate({
        path: "item.productId",
        select: "images name price",
      });
    } else {
      fav = await favModel.findOne({ sessionId: sessionId }).populate({
        path: "item.productId",
        select: "images name price",
      });
    }

    if (!fav || !fav.item) {
      cart = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    res.render("users/favourites.ejs", { fav, categories });
  } catch (err) {
    console.error(err);
    res.render("users/serverError")
  }
};

const deletefav = async (req, res) => {
  try {
    const userId = req.session.userId;
    const pid = req.params.id;
    const result = await favModel.updateOne(
      { userId: userId },
      { $pull: { item: { _id: pid } } }
    );
    const updatefav = await favModel.findOne({ userId: userId });
    const newTotal = updatefav.item.reduce((acc, item) => acc + item.total, 0);
    updatefav.total = newTotal;
    await updatefav.save();
    res.redirect("/favouritespage");
  } catch (error) {
    console.log(error);
    res.render("users/serverError")
  }
};
const addtocartviafav = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const stock = product.stock;
    const quantity = 1;
    console.log("session id", req.session.id);
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId });
    }
    if (!cart) {
      cart = await cartModel.findOne({ sessionId: req.session.id });
    }

    if (!cart) {
      console.log("creating a new cart");
      cart = new cartModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    const productExist = cart.item.findIndex((item) => item.productId == pid);

    if (productExist !== -1) {
      cart.item[productExist].quantity += 1;
      cart.item[productExist].total = cart.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        quantity: 1,
        price: price,
        stock: stock,
        total: quantity * price,
      };
      cart.item.push(newItem);
    }

    if (userId && !cart.userId) {
      cart.userId = userId;
    }

    cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);

    await cart.save();
    res.redirect("/cartpage");
  } catch (error) {
    console.error(error);
    res.render("users/serverError")
  }
};

module.exports = {
  userdetails,
  profileEdit,
  profileUpdate,
  newAddress,
  updateAddress,
  editaddress,
  editaddressupdate,
  deleteAddress,
  changepassword,
  addtofavourite,
  favouritespage,
  deletefav,
  addtocartviafav,
};
