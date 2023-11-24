const adminmodel = require("../model/user");
const categoryModel = require("../model/category_model");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    res.render("admin/adminlogin.ejs");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
const adminlogin = async (req, res) => {
  try {
    const trues = "true";
    const user = await adminmodel.findOne({ isAdmin: trues });
    const passwordmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log(user.password);
    if (passwordmatch) {
      console.log("admin is in");
      req.session.isadAuth = true;
      res.redirect("/admin/adminpannel");
    } else {
      console.log("username thettahnu mwoney");
      res.render("admin/adminlogin", { passworderror: "invalid password" });
    }
  } catch (error) {
    console.log(error);
    res.render("admin/adminlogin", { username: "incorrect username" });
  }
};
const adminpannel = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      res.render("admin/adminpannel");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    res.send(error);
  }
};
const userslist = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const user = await adminmodel.find({});
      console.log(user);
      res.render("admin/userslist", { users: user });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const userupdate = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const email = req.params.email;
      const user = await adminmodel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.status = !user.status;
      await user.save();
      res.redirect("/admin/userslist");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const searchuser = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const searchName = req.body.search;
      const data = await adminmodel.find({
        username: { $regex: new RegExp(`^${searchName}`, `i`) },
      });
      req.session.searchuser = data;
      res.redirect("/admin/searchview");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const searchview = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const user = req.session.searchuser;
      res.render("admin/userslist", { users: user });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const filter = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const option = req.params.option;
      if (option === "A-Z") {
        user = await adminmodel.find().sort({ username: 1 });
      } else if (option === "Z-A") {
        user = await adminmodel.find().sort({ username: -1 });
      } else if (option === "Blocked") {
        user = await adminmodel.find({ status: true });
      } else {
        user = await adminmodel.find();
      }
      res.render("admin/userslist", { users: user });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const category = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const category = await categoryModel.find({});
      res.render("admin/categories", { cat: category });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const newcat = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      res.render("admin/addcategories");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
  }
};
const addcategory = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const catName = req.body.categoryName;
      const catdes = req.body.description;
      await categoryModel.insertMany({ name: catName, description: catdes });
      res.redirect("/admin/category");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const unlistcat = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const id = req.params.id;
      const category = await categoryModel.findOne({ _id: id });
      category.status = !category.status;
      await category.save();
      res.redirect("/admin/category");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const updatecat = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const id = req.params.id;
      const cat = await categoryModel.findOne({ _id: id });
      res.render("admin/updatecat", { itemcat: cat });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const updatecategory = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      const id = req.params.id;
      const catName = req.body.categoryName;
      const catdec = req.body.description;
      await categoryModel.updateOne(
        { _id: id },
        { name: catName, description: catdec }
      );
      res.redirect("/admin/category");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const adlogout = async (req, res) => {
  try {
    if (req.session.isadAuth) {
      req.session.isadAuth = false;
      req.session.destroy();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

module.exports = {
  adminlogin,
  login,
  adminpannel,
  userslist,
  userupdate,
  searchuser,
  searchview,
  filter,
  category,
  newcat,
  addcategory,
  unlistcat,
  updatecat,
  updatecategory,
  adlogout,
};
