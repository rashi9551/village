const userModel = require("../model/user");
const otpModel = require("../model/user_otpmodel");
const otpgenerator = require("otp-generator");
const nodemailer = require("nodemailer");

const bcrypt = require("bcryptjs");

const {
  nameValid,
  emailValid,
  phoneValid,
  confirmpasswordValid,
  passwordValid,
} = require("../../utils/validators/usersignupvalidators");
const { Email, pass } = require("../../.env");

const generateotp = () => {
  const otp = otpgenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
  console.log("Generated OTP:", otp);
  return otp;
};
const sendmail = async (email, otp) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Email,
        pass: pass,
      },
    });

    var mailOptions = {
      from: "Village<thefurnify@gmail.com>",
      to: email,
      subject: "E-Mail Verification",
      text: "Your OTP is:" + otp,
    };

    transporter.sendMail(mailOptions);
    console.log("E-mail sent sucessfully");
  } catch (err) {
    console.log("error in sending mail:", err);
  }
};

const index = async (req, res) => {
  await res.render("user/index");
};

const signin = async (req, res) => {
  await res.render("user/signin");
};

const signup = async (req, res) => {
  await res.render("user/signup");
};
const signotp = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const cpassword = req.body.confirm_password;

    const isusernameValid = nameValid(username);
    const isEmailValid = emailValid(email);
    const isPhoneValid = phoneValid(phone);
    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    const emailExist = await userModel.findOne({ email: email });
    if (emailExist) {
      res.render("user/signup", { emailerror: "E-mail already exits" });
    } else if (!isusernameValid) {
      res.render("user/signup", { nameerror: "Enter a valid Name" });
    } else if (!isEmailValid) {
      res.render("user/signup", { emailerror: "Enter a valid E-mail" });
    } else if (!isPhoneValid) {
      res.render("user/signup", { phoneerror: "Enter a valid Phone Number" });
    } else if (!ispasswordValid) {
      res.render("user/signup", {
        passworderror: "Password should contain one(A,a,2)",
      });
    } else if (!iscpasswordValid) {
      res.render("user/signup", {
        cpassworderror: "Password and Confirm password should be match",
      });
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const user = new userModel({
        username: username,
        email: email,
        phone: phone,
        password: hashedpassword,
      });
      req.session.user = user;
      req.session.signup = true;
      req.session.forgot = false;

      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 30 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);
      await sendmail(email, otp);
      res.redirect("/otp");
    }
  } catch (err) {
    console.error("Error:", err);
    res.send("error");
  }
};
const otp = async (req, res) => {
  try {
    res.render("user/otp");
  } catch {
    res.status(200).send("error occured");
  }
};
const verifyotp = async (req, res) => {
  try {
    const enteredotp = req.body.otp;
    const user = req.session.user;
    console.log(enteredotp);
    console.log(req.session.user);
    const email = req.session.user.email;
    const userdb = await otpModel.findOne({ email: email });
    const otp = userdb.otp;
    const expiry = userdb.expiry;
    console.log(otp);
    if (enteredotp == otp && expiry.getTime() >= Date.now()) {
      user.isVerified = true;
      try {
        if (req.session.signup) {
          await userModel.create(user);
          res.redirect("/");
        } else if (req.session.forgot) {
          res.redirect("/newpassword");
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while saving user data");
      }
    } else {
      res.status(400).send("Wrong OTP or Time Expired");
    }
  } catch (error) {
    console.log(err);
    res.status(500).send("error occured");
  }
};
const resendotp = async (req, res) => {
  try {
    const email = req.session.user.email;
    const otp = generateotp();
    console.log(otp);

    const currentTimestamp = Date.now();
    const expiryTimestamp = currentTimestamp + 60 * 1000;
    await otpModel.updateOne(
      { email: email },
      { otp: otp, expiry: new Date(expiryTimestamp) }
    );
    await sendmail(email, otp);
  } catch (err) {
    console.log(err);
  }
};
const login = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await userModel.findOne({ username: username });

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    const passwordmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (passwordmatch && !user.status) {
      // Authentication successful
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.isAuth = true;
      res.redirect("/");
    } else {
      // Authentication failed
      res.render("user/signin", { passworderror: "incorrect password" });
    }
  } catch (error) {
    // Error occurred, could be due to user not found or other issues
    res.render("user/signin", { username: "incorrect username" });
  }
};
const forgotpassword = async (req, res) => {
  try {
    res.render("user/forgot");
  } catch {
    res.status(200).send("error occured");
  }
};
const forgotverify = async (req, res) => {
  try {
    const email = req.body.email;
    const emailexist = await userModel.findOne({ email: email });
    // req.session.id=emailexist._id
    console.log(emailexist);
    if (emailexist) {
      req.session.forgot = true;
      req.session.signup = false;
      req.session.user = { email: email };
      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 60 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);

      await sendmail(email, otp);
      res.redirect("/otp");
    } else {
      res.render("user/forgotpass", { emaile: "E-Mail Not Exist" });
    }
  } catch (err) {
    res.status(400).send("error occurred: " + err.message);
    console.log(err);
  }
};
const newpassword = async (req, res) => {
  try {
    res.render("user/newpassword");
  } catch {
    res.status(400).send("error occured");
  }
};
const resetpassword = async (req, res) => {
  try {
    const password = req.body.newPassword;
    const cpassword = req.body.confirmPassword;

    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    if (!ispasswordValid) {
      res.render("users/newpassword", {
        perror: "Password should contain (A,a,@)",
      });
    } else if (!iscpasswordValid) {
      res.render("users/newpassword", { cperror: "Passwords not match" });
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const email = req.session.user.email;
      await userModel.updateOne({ email: email }, { password: hashedpassword });
      res.redirect("/");
    }
  } catch {
    res.status(400).send("error occured");
  }
};

module.exports = {
  index,
  signin,
  signup,
  signotp,
  login,
  otp,
  verifyotp,
  resendotp,
  forgotpassword,
  forgotverify,
  newpassword,
  resetpassword,
};
