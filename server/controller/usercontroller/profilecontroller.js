const catModel = require("../../model/category_model");
const cartModel = require("../../model/cart_model");
const userModel = require("../../model/user_model");
const bcrypt = require("bcryptjs");
const puppeteer=require('puppeteer')
const favModel = require("../../model/favourite_model");
const walletModel = require("../../model/wallet_Model");
const key_id = process.env.key_id;
const key_secret = process.env.key_secret;
const Razorpay = require("razorpay");

const {
  nameValid,
  emailValid,
  phoneValid,
  confirmpasswordValid,
  passwordValid,
} = require("../../../utils/validators/usersignupvalidators");
const orderModel = require("../../model/order_model");
const productModel = require("../../model/product_model");
const { category } = require("../admincontroller/admincontroller");
const couponModel = require("../../model/coupon_model");

const userdetails = async (req, res) => {
  try {
    const userid = req.session.userId;
    console.log("id:", userid);
    const userdata = await userModel.findOne({ _id: userid });
    const categories = await catModel.find();
    res.render("users/userdetails", { categories, userData: userdata });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const profileEdit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userData = await userModel.findOne({ _id: userId });
    const categories = await catModel.find();
    res.render("users/editprofile", { userData: userData, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const profileUpdate = async (req, res) => {
  try {
    const id = req.session.userId;
    const { username, phone, email } = req.body;
    console.log("values:", username, phone, email);
    const data = await userModel.updateOne(
      { _id: id },
      { $set: { username: username, phone: phone } }
    );
    console.log(data);
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const newAddress = async (req, res) => {
  try {
    const categories = await catModel.find();
    res.render("users/newAddress", { categories });
  } catch (err) {
    res.status(500).send("error occured");
    console.log(err);
  }
};

const updateAddress = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const userId = req.session.userId;
    console.log("id", userId);

    const existingUser = await userModel.findOne({ _id: userId });

    if (existingUser) {
      // Corrected query to find existing address for the user
      const existingAddress = await userModel.findOne({
        _id: userId,
        address: {
          $elemMatch: {
            fullname: fullname,
            adname: adname,
            street: street,
            pincode: pincode,
            city: city,
            state: state,
            country: country,
            phonenumber: phone,
          },
        },
      });

      if (existingAddress) {
        // req.flash('address', 'This Address already existed');
        return res.redirect("/addAddress");
      }

      existingUser.address.push({
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      });

      await existingUser.save();

      // req.flash('address', 'Address added successfully');
      return res.redirect("/userdetails");
    }
    const newAddress = await userModel.create({
      userId: userId,
      address: {
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      },
    });
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const editaddress = async (req, res) => {
  try {
    const addressid = req.params.addressId;
    const userid = req.session.userId;
    console.log("the id is:", addressid);
    const user = await userModel.findById(userid);
    const addressToEdit = user.address.id(addressid);
    console.log(addressToEdit);
    const categories = await catModel.find();
    res.render("users/editaddress", { addressToEdit, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const editaddressupdate = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    console.log("id", userId);

    // Check if the new address already exists for the user excluding the currently editing address
    const isAddressExists = await userModel.findOne({
      _id: userId,
      address: {
        $elemMatch: {
          _id: { $ne: addressId }, // Exclude the currently editing address
          saveas: saveas,
          fullname: fullname,
          adname: adname,
          street: street,
          pincode: pincode,
          city: city,
          state: state,
          country: country,
          phonenumber: phone,
        },
      },
    });

    if (isAddressExists) {
      // Address with the same details already exists, handle it accordingly
      return res.status(400).send("Address already exists");
    }

    // Update the existing address based on the addressId
    const result = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.saveas": saveas,
          "address.$.fullname": fullname,
          "address.$.adname": adname,
          "address.$.street": street,
          "address.$.pincode": pincode,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.phonenumber": phone,
        },
      }
    );

    // Check if the update was successful

    res.redirect("/userdetails");
  } catch (err) {
    res.status(500).send("Error occurred");
    console.log(err);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const data = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log("ithaahnu data", data);
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const changepassword = async (req, res) => {
  try {
    const userid = req.session.userId;
    const password = req.body.newPassword;
    const newpassword = req.body.confirmPassword;
    const ispasswordvalid = passwordValid(newpassword);
    // const isconfirmpasswordvallid=confirmpasswordValid(cpassword,password)
    const categories = await catModel.find();
    const user = await userModel.findById(userid);
    const passwordmatch = await bcrypt.compare(password, user.password);
    if (passwordmatch) {
      if (!ispasswordvalid) {
        console.log("passwor not valid");
        res.render("users/userdetails", {
          perror: "passworld have (A,a,@)",
          categories: categories,
          userData: user,
        });
      }
      // if(!isconfirmpasswordvallid)
      // {
      //     res.render("users/userdetails",{cperror:"passworld dont matched",categories:categories,userData:user})
      // }
      else {
        const newhashedpassword = await bcrypt.hash(newpassword, 10);
        await userModel.updateOne(
          { _id: userid },
          { password: newhashedpassword }
        );
        res.redirect("/userdetails");
      }
    } else {
      res.render("users/userdetails", {
        perror: "old password is incorrect",
        categories: categories,
        userData: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const orderhistory = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const categories = await catModel.find({});
    const od = await orderModel.find({ userId: userId });
    const allOrderItems = [];
    od.forEach((order) => {
      allOrderItems.push(...order.items);
    });
    const orders = await orderModel.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $sort: {
          createdAt: -1, // Sort in ascending order (use -1 for descending order)
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);
    const updatedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productDetails: order.productDetails.find(
          (product) => product._id.toString() === item.productId.toString()
        ),
      })),
    }));

    res.render("users/orderhistory", {
      od,
      orders: updatedOrders,
      categories,
      allOrderItems,
    });
  } catch (err) {
    console.log(err);
  }
};

const ordercancelling = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.userId;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Cancelled" }
    );
    const result = await orderModel.findOne({ _id: id });
    if (
      result.paymentMethod == "Razorpay" ||
      result.paymentMethod == "Wallet"
    ) {
      const user = await walletModel.findOne({ userId: userId });

      const refund = result.totalPrice;

      const currentWallet = user.wallet;
      console.log(currentWallet);

      const newWallet = currentWallet + refund;
      console.log(newWallet);
      const amountUpdate = await walletModel.updateOne(
        { userId: userId },
        {
          $set: { wallet: newWallet },
          $push: {
            walletTransactions: {
              reason:"oreder cancelled",
              date: new Date(),
              type: "Credited", // or 'debit' depending on your use case
              amount: refund, // Replace with the actual amount you want to add
            },
          },
        }
      );
    }
    console.log("result", result);
    const items = result.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    for (const item of items) {
      const product = await productModel.findOne({ _id: item.productId });
      product.stock += item.quantity;
      await product.save();
    }

    res.redirect("/orderhistory");
  } catch (err) {
    res.status(500).send("error occured");
    console.log(err);
  }
};

const itemcancelling = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });

    const itemIndex = order.items.findIndex((item) => item.productId == id);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in the order");
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (order.paymentMethod == "Razorpay" || order.paymentMethod == "Wallet") {
      const user = await walletModel.findOne({ userId: userId });

      const refund = order.items[itemIndex].price;

      const currentWallet = user.wallet;
      console.log(currentWallet);

      const newWallet = currentWallet + refund;
      console.log(newWallet);
      const amountUpdate = await walletModel.updateOne(
        { userId: userId },
        {
          $set: { wallet: newWallet },
          $push: {
            walletTransactions: {
              reason:"item Cancelled",
              date: new Date(),
              type: "Credited", // or 'debit' depending on your use case
              amount: refund, // Replace with the actual amount you want to add
            },
          },
        }
      );
    }

    const nonCancelledItems = order.items.filter(
      (item) => item.status !== "cancelled"
    );

    if (nonCancelledItems.length < 2) {
      order.status = "Cancelled";

      await orderModel.updateOne(
        { _id: orderId, "items.productId": order.items[itemIndex].productId },
        {
          $set: {
            "items.$.status": "cancelled", // Update the status of the specific item in the array
            updatedAt: new Date(),
          },
        }
      );

      await order.save();
      return res.redirect(`/singleOrder/${orderId}`);
    }

    const result = await orderModel.updateOne(
      { _id: orderId, "items.productId": order.items[itemIndex].productId },
      {
        $set: {
          "items.$.status": "cancelled", // Update the status of the specific item in the array
          totalPrice: order.totalPrice - order.items[itemIndex].price,
          updatedAt: new Date(),
        },
      }
    );

    res.redirect(`/singleOrder/${orderId}`);
  } catch (err) {
    console.log(err);
    res.send("couldnt cancel");
  }
};
const itemreturning=async(req,res)=>{
  try{
      const userId=req.session.userId
      const id=req.params.id
      const orderId=req.params.orderId
  
      const order = await orderModel.findOne({ _id:orderId });

      const user=await walletModel.findOne({userId:userId})



      
      const itemIndex = order.items.findIndex(item => item.productId == id);
  
      if (itemIndex === -1) {
          return res.status(404).send("Item not found in the order");
      }
  
  
      if (!order) {
          return res.status(404).send("Order not found");
      }

      const refund=order.items[itemIndex].price;
      console.log("refundAmount",refund)

      const currentWallet = user.wallet; 
      const newWallet = currentWallet + refund;
      const amountUpdate = await walletModel.updateOne(
          { userId: userId },
          {
            $set: { wallet: newWallet },
            $push: {
              walletTransactions: {
                reason:"ordered item returned",
                date: new Date(),
                type: 'Credited', 
                amount: refund, 
              },
            },
          }
        ); 
  

      const nonReturnedItems = order.items.filter(item => item.status !== 'returned');


      if (nonReturnedItems.length < 2) {

          order.status='Returned'

          await orderModel.updateOne(
              { _id: orderId ,'items.productId': order.items[itemIndex].productId},
              {
                $set: {
                  'items.$.status': 'returned', 
                  updatedAt: new Date(),
                },
              }
            );

       await order.save()
     return res.redirect(`/singleOrder/${orderId}`)
        
      }
  
   
      const result = await orderModel.updateOne(
          { _id: orderId ,'items.productId': order.items[itemIndex].productId},
          {
            $set: {
              'items.$.status': 'returned', 
              totalPrice: order.totalPrice - order.items[itemIndex].price,
              updatedAt: new Date(),
            },
          }
        );
  
      res.redirect(`/singleOrder/${orderId}`)
  
  
      
      }
      catch(err){
          console.log(err);
          res.send("couldnt cancel")
      }
}

const singleOrderPage = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await orderModel.findOne({ _id: id });
    const categories = await catModel.find({});
    res.render("users/orderDetails", { categories, order });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
const orderReturn = async (req, res) => {
  try {
    const userId = req.session.userId;

    const id = req.params.id;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Returned" }
    );
    const order = await orderModel.findOne({ _id: id });
    const user = await walletModel.findOne({ userId: userId });

    console.log("paranja order", order);
    const refund = order.totalPrice;
    console.log("refundAmount", refund);

    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            reason:"Order returned",
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    const result = await orderModel.findOne({ _id: id });

    const items = result.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    for (const item of items) {
      const product = await productModel.findOne({ _id: item.productId });
      product.stock += item.quantity;
      await product.save();
    }

    res.redirect("/orderhistory");
  } catch (err) {
    console.log(err);
  }
};

const addtofavourite = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const quantity = 1;

    let fav;
    if (userId) {
      fav = await favModel.findOne({ userId: userId });
    }
    if (!fav) {
      fav = await favModel.findOne({ sessionId: req.session.id });
    }

    if (!fav) {
      fav = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    const productExist = fav.item.findIndex((item) => item.productId == pid);

    if (productExist !== -1) {
      fav.item[productExist].quantity += 1;
      fav.item[productExist].total = fav.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        price: price,
      };
      fav.item.push(newItem);
    }

    if (userId && !fav.userId) {
      fav.userId = userId;
    }

    await fav.save();
    res.redirect("/favouritespage");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred");
  }
};
const favouritespage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.id;
    const categories = await catModel.find();
    let fav;

    if (userId) {
      fav = await favModel.findOne({ userId: userId }).populate({
        path: "item.productId",
        select: "images name price",
      });
    } else {
      fav = await favModel.findOne({ sessionId: sessionId }).populate({
        path: "item.productId",
        select: "images name price",
      });
    }

    if (!fav || !fav.item) {
      cart = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    res.render("users/favourites.ejs", { fav, categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred");
  }
};

const deletefav = async (req, res) => {
  try {
    const userId = req.session.userId;
    const pid = req.params.id;
    const result = await favModel.updateOne(
      { userId: userId },
      { $pull: { item: { _id: pid } } }
    );
    const updatefav = await favModel.findOne({ userId: userId });
    const newTotal = updatefav.item.reduce((acc, item) => acc + item.total, 0);
    updatefav.total = newTotal;
    await updatefav.save();
    res.redirect("/favouritespage");
  } catch (error) {
    console.error(err);
    res.status(500).send("Error occurred");
  }
};
const addtocartviafav = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const stock = product.stock;
    const quantity = 1;
    console.log("session id", req.session.id);
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId });
    }
    if (!cart) {
      cart = await cartModel.findOne({ sessionId: req.session.id });
    }

    if (!cart) {
      console.log("creating a new cart");
      cart = new cartModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    const productExist = cart.item.findIndex((item) => item.productId == pid);

    if (productExist !== -1) {
      cart.item[productExist].quantity += 1;
      cart.item[productExist].total = cart.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        quantity: 1,
        price: price,
        stock: stock,
        total: quantity * price,
      };
      cart.item.push(newItem);
    }

    if (userId && !cart.userId) {
      cart.userId = userId;
    }

    cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);

    await cart.save();
    res.redirect("/cartpage");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
};

const wallet = async (req, res) => {
  try {
  const userId = req.session.userId;
  const categories = await catModel.find({});
  const user = await walletModel.findOne({ userId: userId }).sort({ 'walletTransactions.date': -1});
  
  if (!user) {
      user = await walletModel.create({ userId: userId });
  }
  
  const userWallet = user.wallet;
  console.log(user.walletTransactions)
  const usertransactions=user.walletTransactions.reverse()
  
  res.render("users/wallet", { categories, userWallet ,usertransactions});
  } catch (err) {
  console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
const instance = new Razorpay({ key_id: key_id, key_secret: key_secret });

const walletupi = async (req, res) => {
  console.log("body:", req.body);
  var options = {
    amount: 500,
    currency: "INR",
    receipt: "order_rcpt",
  };
  instance.orders.create(options, function (err, order) {
    console.log("order1 :", order);
    res.send({ orderId: order.id });
  });
};

const walletTopup = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const Amount = parseFloat(req.body.Amount);
    console.log(Amount);
    const wallet = await walletModel.findOne({ userId: userId });
    wallet.wallet += Amount;
    wallet.walletTransactions.push({
      reason:"Wallet topup",
      type: "Credited",
      amount: Amount,
      date: new Date(),
    });

    await wallet.save();
    res.redirect("/wallet");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId
    console.log(orderId)
    const order=await orderModel.findOne({orderId:orderId})
   


    // Replace the following line with logic to fetch order details and generate dynamic HTML
    const orderHistoryContent =` <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="author" content="Your Company">
        <title>Order Invoice</title>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    </head>
    
    <body>
    
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h3 class="mb-0">Order Invoice</h3>
                        </div>
                        <div class="card-body">
                            <div class="row mb-4">
                                <div class="col-sm-6">
                                    <h5>Order ID: ${ order.orderId }</h5>
                                    <h5>Order Status: ${ order.status }</h5>
                                </div>
                                <div class="col-sm-6 text-sm-right">
                                    <h5>Order Date: ${order.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }</h5>
                                    <h5>Payment Method:${order.paymentMethod }</h5>
                                </div>
                            </div>
    
                            <div class="mb-4">
                                <h5>Shipping Address</h5>
                                <p>${order.shippingAddress.fullname }<br>
                                    ${ order.shippingAddress.adname }, ${ order.shippingAddress.street }<br>
                                    ${ order.shippingAddress.city }, ${ order.shippingAddress.pincode }<br>
                                    ${ order.shippingAddress.phonenumber }
                                </p>
                            </div>
    
                            <div class="mb-4">
                                <h5>Order Items</h5>
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    ${order.items.map(item => `
                                    <tr>
                                        <td>${item.productName}</td>
                                        <td>${item.singleprice}</td>
                                        <td>${item.quantity}</td>
                                        <td>${item.price}</td>
                                    </tr>`).join('')}
                                        <tr>
                                            <td colspan="3">Total After Discount</td>
                                            <td>${ order.totalPrice }</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    
    </body>
    
    </html>
    
    `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(orderHistoryContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order_invoice_${req.params.orderId}.pdf`);

    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
};

const couponsAndRewards=async (req,res)=>{
  try{

      const userId = req.session.userId;
      console.log(userId);
      const user = await userModel.findById(userId);
      const coupons = await couponModel.find({
        couponCode: { $nin: user.usedCoupons },
        status:true
      });
      const categories=await catModel.find()
      res.render('users/rewardsPage',{categories,coupons,referralCode:userId})
  }
  catch(err){
      console.log(err);
      res.send(err)
  }
}



module.exports = {
  userdetails,
  profileEdit,
  profileUpdate,
  newAddress,
  updateAddress,
  editaddress,
  editaddressupdate,
  deleteAddress,
  changepassword,
  orderhistory,
  ordercancelling,
  addtofavourite,
  favouritespage,
  deletefav,
  addtocartviafav,
  singleOrderPage,
  orderReturn,
  wallet,
  walletTopup,
  walletupi,
  itemcancelling,
  itemreturning,
  downloadInvoice,
  couponsAndRewards
};
