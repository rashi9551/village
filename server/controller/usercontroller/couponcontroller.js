const catModel = require("../../model/category_model");
const userModel = require("../../model/user_model");
const couponModel = require("../../model/coupon_model");
const moment = require("moment");

const couponsAndRewards = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const user = await userModel.findById(userId);
    const coupons = await couponModel.find({
      couponCode: { $nin: user.usedCoupons },
      status: true,
    });
    const categories = await catModel.find();
    res.render("users/rewardsPage", {
      categories,
      coupons,
      referralCode: userId,
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError")
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;
    console.log("ithu total", subtotal);
    const userId = req.session.userId;
    const coupon = await couponModel.findOne({ couponCode: couponCode });
    console.log(coupon);

    if (coupon && coupon.status === true) {
      const user = await userModel.findById(userId);

      if (user && user.usedCoupons.includes(couponCode)) {
        console.log("nvjksadnjkghakjvajkvnasdmvbasfhvb");
        res.json({ success: false, message: "Already Redeemed" });
      } else if (
        coupon.expiry > new Date() &&
        coupon.minimumPrice <= subtotal
      ) {
        console.log("Coupon is valid");
        let dicprice;
        let price;
        if (coupon.type === "percentageDiscount") {
          dicprice = (subtotal * coupon.discount) / 100;
          if (dicprice >= coupon.maxRedeem) {
            dicprice = coupon.maxRedeem;
          }
          price = subtotal - dicprice;
        } else if (coupon.type === "flatDiscount") {
          dicprice = coupon.discount;
          price = subtotal - dicprice;
        }

        console.log("ithu priceaahmu", price, dicprice);

        await userModel.findByIdAndUpdate(
          userId,
          { $addToSet: { usedCoupons: couponCode } },
          { new: true }
        );
        res.json({ success: true, dicprice, price });
      } else {
        res.json({ success: false, message: "Invalid Coupon" });
      }
    } else {
      res.json({ success: false, message: "Coupon not found" });
    }
  } catch (err) {
    console.error(err);
    res.render("users/serverError")
  }
};
const recokeCoupon = async (req, res) => {
  try {
    console.log("eeelu kayari");
    const { couponCode, subtotal } = req.body;
    const userId = req.session.userId;
    const coupon = await couponModel.findOne({ couponCode: couponCode });
    console.log(coupon);

    if (coupon) {
      const user = await userModel.findOne({ userId: userId });
      if (coupon.expiry > new Date() && coupon.minimumPrice <= subtotal) {
        console.log("Coupon is valid");
        const dprice = (subtotal * coupon.discount) / 100;
        const dicprice = 0;

        const price = subtotal;
        console.log(price);

        await userModel.findByIdAndUpdate(
          userId,
          { $pull: { usedCoupons: couponCode } },
          { new: true }
        );
        res.json({ success: true, dicprice, price });
      } else {
        res.json({ success: false, message: "Invalid Coupon" });
      }
    } else {
      res.json({ success: false, message: "coupon not found" });
    }
  } catch (error) {
    console.log(error);
    res.render("users/serverError")
  }
};

module.exports = {
  applyCoupon,
  recokeCoupon,
  couponsAndRewards,
};
