const productModel = require("../model/product_model");
const categoryModel = require("../model/category_model");
const fs = require("fs");
const path = require("path");

const product = async (req, res) => {
  try {
    const products = await productModel.find({}).populate({
      path: "category",
      select: "name",
    });
    res.render("admin/product", { product: products });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const newproduct = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    console.log("categories"), categories;
    res.render("admin/newproduct", { category: categories });
  } catch (error) {}
};

const addproduct = async (req, res) => {
  try {
    const { productName, parentCategory, images, stock, price, description } =
      req.body;
    console.log(
      "its yt",
      req.files.map((file) => file.path)
    );
    const newproduct = new productModel({
      name: productName,
      category: parentCategory,
      price: price,
      stock: stock,
      images: req.files.map((file) => file.path),
      description: description,
    });
    await newproduct.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const unlist = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    console.log(product);

    product.status = !product.status;
    await product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const deleteproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.deleteOne({ _id: id });
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const updatepro = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);
    console.log(product);
    res.render("admin/updateproduct", { product: product });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const editing = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);
    res.render("admin/editimg", { product: product });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const deleteimg = async (req, res) => {
  try {
    const pid = req.query.pid;
    const filename = req.query.filename;
    const imagePath = path.join("uploads", filename);

    if (fs.existsSync(filename)) {
      try {
        fs.unlinkSync(filename);
        console.log("Image deleted");
        res.redirect("/admin/product");

        await productModel.updateOne(
          { _id: pid },
          { $pull: { images: filename } }
        );
      } catch (err) {
        console.log("error deleting image:", err);
        res.status(500).send("Internal Server Error");
      }
    } else {
      console.log("Image not found");
    }
  } catch (err) {
    console.log(err);
    res.send("Error Occured");
  }
};
const updateimg = async (req, res) => {
  try {
    const id = req.params.id;
    const path = req;
    console.log(path);
    const newimg = req.files.map((file) => file.path);
    const product = await productModel.findById(id);
    product.images.push(...newimg);
    product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};
const updateproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { productName, stock, productprice, description } = req.body;
    const product = await productModel.findOne({ _id: id });
    product.name = productName;
    product.price = productprice;
    product.stock = stock;
    product.description = description;
    await product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};

module.exports = {
  product,
  newproduct,
  addproduct,
  unlist,
  deleteproduct,
  editing,
  updatepro,
  deleteimg,
  updateimg,
  updateproduct,
};
