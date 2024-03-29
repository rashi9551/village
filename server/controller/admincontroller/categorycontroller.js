const adminmodel = require("../../model/user_model");
const categoryModel = require("../../model/category_model");
const flash=require('express-flash')
const {alphanumValid,onlyNumbers,AlphaOnly}=require('../../../utils/validators/admin_validator')


const category = async (req, res) => {
    try {
        const category = await categoryModel.find({});
        res.render("admin/categories", { cat: category });
      
    } catch (error) {
      console.log(error);
      res.render("users/serverError");
    }
  };
  
  // admin new category page
  const newcat = async (req, res) => {
    try {
        res.render("admin/addcategories",{
          expressFlash: {
            
            caterror: req.flash('caterror'),
            catDesError: req.flash('catDesError'),
            catNameError: req.flash('catNameError')
          }
        });
     
    } catch (error) {
      console.log(error);
      res.render("users/serverError");

    }
  };
  
  // admin new category adding 
  const addcategory = async (req, res) => {
    try {
      const catName = req.body.categoryName;
      const catDes = req.body.description;
      const catNameValid=AlphaOnly(catName)
      const catDesValid=AlphaOnly(catDes)

        
      const categoryExists = await categoryModel.findOne({ name:{ $regex: new RegExp("^" + catName + "$", "i") }});
      console.log(categoryExists);
  
      if (categoryExists) {
          console.log("Category exists");
          req.flash('caterror','category Already Exists')
          return res.redirect('/admin/newcat')
      }
      else if (!catNameValid) {
        req.flash('catNameError','Invalid category Name')
        return res.redirect('/admin/newcat')
      }
      else if (!catDesValid) {
        req.flash('catDesError','Invalid category Description')
        return res.redirect('/admin/newcat')
      }
       else {
          await categoryModel.create({ name: catName, description: catDes });
          console.log("Category created");
          res.redirect('/admin/category');
      }
     
    } catch (error) {
      console.log(error);
      res.render("users/serverError");
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
      res.render("users/serverError");
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
      res.render("users/serverError");
    }
  };
  
  
  // admin category updating
  const updatecategory = async (req, res) => {
    try {
        const id = req.params.id;
        const catName = req.body.categoryName;
        const catdec = req.body.description;
        const catNameValid=AlphaOnly(catName)
        const catDesValid=AlphaOnly(catDes)
        const categoryExists = await categoryModel.findOne({ name:{ $regex: new RegExp("^" + catName + "$", "i") }});


        if (categoryExists) {
          console.log("Category exists");
          req.flash('caterror','category Already Exists')
          return res.redirect('/admin/newcat')
      }
      else if (!catNameValid) {
        req.flash('catNameError','Invalid category Name')
        return res.redirect('/admin/newcat')
      }
      else if (!catDesValid) {
        req.flash('catDesError','Invalid category Description')
        return res.redirect('/admin/newcat')
      }
      else{
        await categoryModel.updateOne(
          { _id: id },
          { name: catName, description: catdec }
        );
        res.redirect("/admin/category");
      }
      
    } catch (error) {
      console.log(error);
      res.render("users/serverError");
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