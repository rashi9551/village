const adisAuth = (req, res, next) => {
  try {
    if (req.session.isadAuth) {
      next();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    res.render("users/serverError");
  }
};

const logoutAdmin = (req, res, next) => {
  try {
    if (!req.session.admin) {
      next();
      
    } else{
      console.log("ajdhgasjhdga");
      res.redirect("/admin/adminpanel");
    }
  } catch (error) {
    console.log(error);
    res.render("users/serverError");
  }
};

module.exports = {
  adisAuth,
  logoutAdmin,
};
