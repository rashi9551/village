const mongoose = require("mongoose");
const catModel = require("../../model/category_model");
const productModel = require("../../model/product_model");

const searchProducts = async (req, res) => {
  try {
    const searchProduct = req.body.searchProducts;

    const data = await catModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, "i") },
    });

    const productdata = await productModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, "i") },
    });

    const result = await catModel.aggregate([
      {
        $match: {
          types: {
            $elemMatch: {
              $regex: new RegExp(`^${searchProduct}`, "i"),
            },
          },
        },
      },
      {
        $unwind: "$types",
      },
      {
        $match: {
          types: {
            $regex: new RegExp(`^${searchProduct}`, "i"),
          },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: "$name", // Add other fields as needed
          matchingType: "$types",
        },
      },
    ]);
    console.log("nskbvbnsc ", result);

    if (data) {
      const categoryId = data._id;
      return res.redirect(`/shop?category=${categoryId}`);
    } else if (result.length !== 0) {
      const categoryData = result[0].matchingType;
      const foundCategory = await catModel.findOne({
        types: {
          $in: [categoryData],
        },
      });

      res.redirect(
        `/filterProducts?category=${foundCategory._id}&filterType=${categoryData}`
      );
    } else if (productdata) {
      const productId = productdata._id;
      return res.redirect(`/singleproduct/${productId}`);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);

    // Sending a more informative error response
    res.render("users/serverError")

  }
};

const filterProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const selectedType = req.query.filterType;
    const sortOption = req.query.sortOption;

    let products;

    const filterConditions = {
      category: category,
      status: true,
    };
    if (selectedType && selectedType !== "All") {
      filterConditions.type = selectedType;
    }
    if (sortOption === "-1") {
      products = await productModel
        .find(filterConditions)
        .sort({ price: -1 })
        .exec();
    } else if (sortOption === "1") {
      products = await productModel
        .find(filterConditions)
        .sort({ price: 1 })
        .exec();
    } else {
      products = await productModel.find(filterConditions).exec();
    }
    const categories = await catModel.find();
    const ctCategory = categories.find(
      (cat) => cat._id.toString() === category
    );
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
    res.render("users/serverError")
  }
};

function getSortingLabel(sortOption) {
  if (sortOption === "-1") {
    return "Price: High To Low";
  } else if (sortOption === "1") {
    return "Price: Low To High";
  } else {
    return "Default Sorting"; // Add more labels based on your sorting options
  }
}

const sortProducts = async (req, res) => {
  try {
    const sortOption = parseInt(req.query.sortPro, 10);
    const selectedType = req.query.type;
    const category = req.query.category;

    let products;
    console.log(sortOption);

    if (selectedType == "All") {
      products = await productModel
        .find({ $and: [{ category: category }, { status: true }] })
        .sort({ price: sortOption })
        .exec();
    } else {
      products = await productModel
        .find({ $and: [{ category: category }, { status: true }] })
        .sort({ price: sortOption })
        .exec();
    }
    let sorting;
    if (sortOption === "-1") {
      sorting = "Price: High To Low";
    } else if (sortOption == "1") {
      sorting = "Price: Low To High";
    }
    console.log("propro", products);
    const categories = await catModel.find();
    const ctCategory = categories.find((cat) => cat.id.toString() === category);
    const categoryName = ctCategory ? ctCategory.name : null;
    const theCategory = await catModel.find({ _id: category });
    res.render("users/shop", {
      selectedType,
      theCategory,
      categoryName,
      categories,
      products: products,
      sortoption: sortOption,
      selectedCategory: category,
      sorting,
    });
    console.log("ipoppop", theCategory);
  } catch (error) {
    console.log(error);
    res.render("users/serverError")
  }
};

// single product page
const singleproduct = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("haywanu", id);
    const product = await productModel.findOne({ _id: id }).populate({
      path: "userRatings.userId",
      select: "username",
    });
    console.log("haywanu", product);

    const type = product.type;

    const convertedId = new mongoose.Types.ObjectId(id);

    const result = await productModel.aggregate([
      {
        $match: { _id: convertedId },
      },
      {
        $unwind: { path: "$userRatings", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$userRatings.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalRatings = result.length > 0 ? result[0].totalRatings : 0;

    console.log("hey there", result);

    console.log(averageRating, totalRatings);

    const similar = await productModel
      .find({ type: type, _id: { $ne: id } })
      .limit(4);
    console.log("similar", similar);
    const categories = await catModel.find();
    product.images = product.images.map((image) => image.replace(/\\/g, "/"));
    console.log("Image Path:", product.images[0]);
    console.log("ithu rateng aa ", product.userRatings[0]);
    res.render("users/singleproduct", {
      categories,
      product: product,
      similar,
      averageRating,
      totalRatings,
    });
  } catch (err) {
    console.log("Shopping Page Error:", err);
    res.render("users/serverError")
  }
};

module.exports = {
  filterProducts,
  sortProducts,
  searchProducts,
  singleproduct,
};
