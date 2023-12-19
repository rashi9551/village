// modules importing 
const adminmodel = require("../../model/user_model");
const categoryModel = require("../../model/category_model");
const bcrypt = require("bcryptjs");
// const session=require("../../middleware")



// admin login page
const login = async (req, res) => {
  try {
    res.render("admin/adminlogin.ejs");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// admin login action 
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

// admin pannel page 
const adminpannel = async (req, res) => {
  try {
      res.render("admin/adminpannel");
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin userlist 
const userslist = async (req, res) => {
  try {
      const user = await adminmodel.find({});
      console.log(user);
      res.render("admin/userslist", { users: user });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin user update 
const userupdate = async (req, res) => {
  try {
      const email = req.params.email;
      const user = await adminmodel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.status = !user.status;
      if(user.status)
      {
        req.session.isAuth=false;
      }

      await user.save();
      res.redirect("/admin/userslist");
   
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin searchuser 
const searchuser = async (req, res) => {
  try {
      const searchName = req.body.search;
      const data = await adminmodel.find({
        username: { $regex: new RegExp(`^${searchName}`, `i`) },
      });
      req.session.searchuser = data;
      res.redirect("/admin/searchview");
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin searchview 
const searchview = async (req, res) => {
  try {
      const user = req.session.searchuser;
      res.render("admin/userslist", { users: user });
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

// admin sorting 
const filter = async (req, res) => {
  try {
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
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};




// admin logout 
const adlogout = async (req, res) => {
  try {
      req.session.isadAuth = false;
      req.session.destroy();
  
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// module exporting 
module.exports = {
  adminlogin,
  login,
  adminpannel,
  userslist,
  userupdate,
  searchuser,
  searchview,
  filter,
  adlogout,
};
