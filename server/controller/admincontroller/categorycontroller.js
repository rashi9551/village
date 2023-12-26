const adminmodel = require("../../model/user_model");
const categoryModel = require("../../model/category_model");


const category = async (req, res) => {
    try {
        const category = await categoryModel.find({});
        res.render("admin/categories", { cat: category });
      
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };
  
  // admin new category page
  const newcat = async (req, res) => {
    try {
        res.render("admin/addcategories");
     
    } catch (error) {
      console.log(error);
    }
  };
  
  // admin new category adding 
  const addcategory = async (req, res) => {
    try {
      const catName = req.body.categoryName;
      const catDes = req.body.description;
  
      const categoryExists = await categoryModel.findOne({ name: catName });
  
      if (categoryExists) {
          console.log("Category exists");
          res.redirect('/admin/category');
      } else {
          await categoryModel.create({ name: catName, description: catDes });
          console.log("Category created");
          res.redirect('/admin/category');
      }
     
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };
  
  // admin category unlisting 
  const unlistcat = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await categoryModel.findOne({ _id: id });
        category.status = !category.status;
        await category.save();
        res.redirect("/admin/category");
     
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };
  
  // admin category update page
  const updatecat = async (req, res) => {
    try {
        const id = req.params.id;
        const cat = await categoryModel.findOne({ _id: id });
        res.render("admin/updatecat", { itemcat: cat });
      
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };
  
  
  // admin category updating
  const updatecategory = async (req, res) => {
    try {
        const id = req.params.id;
        const catName = req.body.categoryName;
        const catdec = req.body.description;
        await categoryModel.updateOne(
          { _id: id },
          { name: catName, description: catdec }
        );
        res.redirect("/admin/category");
      
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };

  module.exports={
    category,
    newcat,
    addcategory,
    unlistcat,
    updatecat,
    updatecategory,
  }