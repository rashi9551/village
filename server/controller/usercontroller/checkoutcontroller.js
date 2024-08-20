const catModel = require("../../model/category_model");
const userModel = require("../../model/user_model");
const cartModel = require("../../model/cart_model");
const productModel = require("../../model/product_model");
const orderModel = require("../../model/order_model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const KEY_ID = process.env.KEY_ID;
const key_secret = process.env.key_secret;
const couponModel = require("../../model/coupon_model");
const walletModel = require("../../model/wallet_Model");
const moment = require("moment");
const { default: ShortUniqueId } = require('short-unique-id');
let date = moment();
const {bnameValid,adphoneValid,pincodeValid}=require("../../../utils/validators/address_validator")
const flash=require('express-flash')

const checkoutreload = async (req, res) => {
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
    const cartId = req.body.cartId;

    req.session.chadInfo=req.body;

    const userId = req.session.userId;
    console.log("userid =-=-=-=-=-=-", req.session.userId);
    
    const existingUser = await userModel.findOne({ _id: userId });
    const availableCoupons = await couponModel.find({
      couponCode: { $nin: existingUser.usedCoupons },
      status: true,
    });
    console.log("exixteing user", existingUser);
    const fullnamevalid=bnameValid(fullname)
    const saveasvalid=bnameValid(saveas)
    const adnameValid=bnameValid(adname)
    const streetValid=bnameValid(street)
    const pincodevalid=pincodeValid(pincode)
    const cityValid=bnameValid(city)
    const stateValid=bnameValid(state)
    const countryValid=bnameValid(country)
    const phoneValid=adphoneValid(phone)
    console.log(fullnamevalid,saveasvalid,streetValid,"]=--=-=-=-");
    if(!fullnamevalid)
{
req.flash("fullnameerror","Enter a valid name")
 return res.redirect(`/checkoutpage?cartId=${cartId}`)
}
if(!saveasvalid)
{
req.flash("saveaserror","Enter a valid addresstype")
return res.redirect(`/checkoutpage?cartId=${cartId}`)
}
if(!adnameValid)
{
req.flash("adnameerror","Enter a valid address")
return res.redirect(`/checkoutpage?cartId=${cartId}`)
}
if(!streetValid)
{
req.flash("streeterror","enter a valid street")
return res.redirect(`/checkoutpage?cartId=${cartId}`)

}
if(!pincodevalid)
{
req.flash("pincodeerror","Enter a valid Pincode")
return res.redirect(`/checkoutpage?cartId=${cartId}`)
}

if(!cityValid)
{
req.flash("cityerror","Enter Valid City")
return res.redirect(`/checkoutpage?cartId=${cartId}`)

}
if(!stateValid){
    req.flash("stateerror","Enter valid state")
    return res.redirect(`/checkoutpage?cartId=${cartId}`)
  }
if(!countryValid){
    req.flash("countryerror",'Enter valid country')
    return res.redirect(`/checkoutpage?cartId=${cartId}`)
  }
if(!phoneValid){
    req.flash("phoneerror","Enter valid number ")
    return res.redirect(`/checkoutpage?cartId=${cartId}`)

}

if (existingUser) {
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
  console.log(existingAddress,"ithu ello okeyeeeeee");
      if (existingAddress) {
        return res.redirect(`/checkoutpage?cartId=${cartId}`)
      }
      req.session.chadInfo=null

      console.log("its user", existingAddress);
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
      console.log("work aaayi");
    }

    const categories = await catModel.find();
    const addresslist = await userModel.findOne({ _id: userId });
    if (!addresslist) {
      console.log("user not foound");
      res.render("users/serverError")     }
    const addresses = addresslist.address;
    if (!cartId) {
      console.log("cart Id not found");
      res.render("users/serverError")     }
    const cart = await cartModel.findById(cartId).populate("item.productId");
    if (!cart) {
      console.log("cart not found");
      res.render("users/serverError")     
    }

    const cartItems = cart.item.map((cartItem) => ({
      productNme: cartItem.productId.name,
      quantity: cartItem.quantity,
      itemTotal: cartItem.total,
    }));
    console.log("cart total", cartItems);
    res.render("users/checkout", { availableCoupons,addresses, cartItems, categories, cart });
  } catch (error) {
    console.log(error);
    res.render("users/serverError")
  }
};

const placeorder = async (req, res) => {
  try {
    const categories = await catModel.find({});
    const addressId = req.body.selectedAddressId;
    const user = await userModel.findOne({
      address: { $elemMatch: { _id: addressId } },
    });
    if (!user) {
      res.render("users/serverError")    
     }
    const selectedAddress = user.address.find((address) =>
      address._id.equals(addressId)
    );
    const userId = req.session.userId;
    const username = selectedAddress.fullname;
    const paymentMethod = req.body.selectedPaymentOption;

    const items = req.body.selectedProductNames.map((productName, index) => ({
      productName: req.body.selectedProductNames[index],
      productId: new mongoose.Types.ObjectId(
        req.body.selectedProductIds[index]
      ),
      quantity: parseInt(req.body.selectedQuantities[index]),
      price: parseInt(req.body.selectedCartTotals[index]),
    }));
    const uid = new ShortUniqueId();

const order = new orderModel({
  orderId: uid.randomUUID(6),
  userId: userId,
  userName: username,
  items: items,
  totalPrice: parseInt(req.body.carttotal),
  shippingAddress: selectedAddress,
  paymentMethod: paymentMethod,
  updatedAt: date.format("YYYY-MM-DD HH:mm"),
  createdAt: date.format("YYYY-MM-DD HH:mm"),
  status: "pending",
});

    console.log("items", items);
    if(req.session.checkout){
      await order.save();
    }

    for (const item of items) {
      await cartModel.updateOne(
        { userId: userId },
        { $pull: { item: { productId: item.productId } } }
      );
      await cartModel.updateOne({ userId: userId }, { $set: { total: 0 } });
    }

    for (const item of items) {
      await productModel.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    req.session.checkout=false

    res.render("users/order_confirmation", { order, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const instance = new Razorpay({ key_id: KEY_ID, key_secret: key_secret });

const upi = async (req, res) => {
  console.log("body:", req.body);
  var options = {
    amount: 500,
    currency: "INR",
    receipt: "order_rcpt",
  };
  instance.orders.create(options, function (err, order) {
    console.log("order1 :", order);
    res.send({ orderId: order.id });
  });
};

const wallettransaction = async (req, res) => {
  try {
    console.log("ibda indu mwoney");
    const userid = req.session.userId;
    const amount = req.body.amount;
    const user = await walletModel.findOne({ userId: userid });
    console.log(userid);
    const wallet = user.wallet;
    console.log("ithu wallet", wallet);

    if (user.wallet >= amount) {
      user.wallet -= amount;
      await user.save();
      const wallet = await walletModel.findOne({ userId: userid });
      wallet.walletTransactions.push({
        reason: "order placed",
        type: "Debited",
        amount: amount,
        date: date.format("YYYY-MM-DD HH:mm"),
      });
      await wallet.save();
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "dont have enought money" });
    }
  } catch (error) {
    console.log(error);
    res.render("users/serverError")
  }
};

const checkoutpage = async (req, res) => {
  try {
    const categories = await catModel.find();
    const cartId = req.query.cartId;
    const userId = req.session.userId;
    const user = await userModel.findById(userId);
    const availableCoupons = await couponModel.find({
      couponCode: { $nin: user.usedCoupons },
      status: true,
    });
    console.log(req.flash());
    console.log("coupons", availableCoupons);

    const addresslist = await userModel.findOne({ _id: userId });

    if (!addresslist) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    const addresses = addresslist.address;

    const cart = await cartModel.findById(cartId).populate("item.productId");

    for (const cartItem of cart.item || []) {
      const product = await productModel.findById(cartItem.productId);

      if (cartItem.quantity > product.stock) {
        console.log(
          "Selected quantity exceeds available stock for productId:",
          cartItem.productId
        );
        const nonitemid = cartItem.productId;
        const theitem = await productModel.findOne({ _id: nonitemid });
        const nameitem = theitem.name;
        return res.render("users/cart", {
          cart,
          categories,
          message: ` The product ${nameitem}'s quantity Exceeds StockLimit..!!`,
        });
      }
    }

    const cartItems = (cart.item || []).map((cartItem) => ({
      productId: cartItem.productId._id,
      productName: cartItem.productId.name,
      price: cartItem.productId.price,
      quantity: cartItem.quantity,
      itemTotal: cartItem.total,
    }));

    console.log("Cart Total:", cart.total,availableCoupons);

    res.render("users/checkout", {
      availableCoupons,
      addresses,
      cartItems,
      categories,
      cart,
      cartId,
    });
  } catch (err) {
    console.error(err);
    res.render("users/serverError")
  }
};

module.exports = {
  checkoutreload,
  placeorder,
  upi,
  wallettransaction,
  checkoutpage,
};
