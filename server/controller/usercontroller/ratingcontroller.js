const productModel = require("../../model/product_model");

const ratePage = async (req, res) => {
  try {
    const { id, rating, review } = req.query;
    const userId = req.session.userId;

    const productId = id;

    const product = await productModel.findById(productId);

    if (!product) {
      res.render("users/serverError")
    }

    const existingUserRating = product.userRatings.find(
      (userRating) => userRating.userId.toString() === userId
    );

    if (existingUserRating) {
      existingUserRating.rating = rating;
      existingUserRating.review = review;
    } else {
      product.userRatings.push({ userId, rating, review });
    }

    await product.save();

    res.redirect("/orderhistory");
  } catch (err) {
    console.log(err);
    res.render("users/serverError")
  }
};

module.exports = {
  ratePage,
};
