const catModel = require("../../model/category_model");
const puppeteer = require("puppeteer");
const walletModel = require("../../model/wallet_Model");
const moment = require("moment");
const orderModel = require("../../model/order_model");
const productModel = require("../../model/product_model");

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
    const result = await orderModel.findOneAndUpdate(
      { _id: id },
      { $set: { updatedAt: new Date() } },
      { new: true } // This option returns the updated document
    );
    if (
      result.paymentMethod == "Razorpay" ||
      result.paymentMethod == "Wallet"
    ) {
      const user = await walletModel.findOne({ userId: userId });

      const refund = result.totalPrice;
      console.log(user);

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
              reason: "oreder cancelled",
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
              reason: "item Cancelled",
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
const itemreturning = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });

    const user = await walletModel.findOne({ userId: userId });

    const itemIndex = order.items.findIndex((item) => item.productId == id);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in the order");
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const refund = order.items[itemIndex].price;
    console.log("refundAmount", refund);

    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            reason: "ordered item returned",
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    const nonReturnedItems = order.items.filter(
      (item) => item.status !== "returned"
    );

    if (nonReturnedItems.length < 2) {
      order.status = "Returned";

      await orderModel.updateOne(
        { _id: orderId, "items.productId": order.items[itemIndex].productId },
        {
          $set: {
            "items.$.status": "returned",
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
          "items.$.status": "returned",
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
            reason: "Order returned",
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );
    let date = moment();

    const result = await orderModel.findOne({ _id: id });
    result.updatedAt = date.toLocaleString();
    await result.save();

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

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(orderId);
    const order = await orderModel.findOne({ orderId: orderId });

    // Replace the following line with logic to fetch order details and generate dynamic HTML
    const orderHistoryContent = ` <!DOCTYPE html>
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
                                      <h5>Order ID: ${order.orderId}</h5>
                                      <h5>Order Status: ${order.status}</h5>
                                  </div>
                                  <div class="col-sm-6 text-sm-right">
                                      <h5>Order Date: ${order.createdAt.toLocaleString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        }
                                      )}</h5>
                                      <h5>Payment Method:${
                                        order.paymentMethod
                                      }</h5>
                                  </div>
                              </div>
      
                              <div class="mb-4">
                                  <h5>Shipping Address</h5>
                                  <p>${order.shippingAddress.fullname}<br>
                                      ${order.shippingAddress.adname}, 
                                      ${order.shippingAddress.street}<br>
                                      ${order.shippingAddress.city}, 
                                      ${order.shippingAddress.pincode}<br>
                                      ${order.shippingAddress.phonenumber}
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
                                      ${order.items
                                        .map(
                                          (item) => `
                                      <tr>
                                          <td>${item.productName}</td>
                                          <td>${item.singleprice}</td>
                                          <td>${item.quantity}</td>
                                          <td>${item.price}</td>
                                      </tr>`
                                        )
                                        .join("")}
                                          <tr>
                                              <td colspan="3">Total After Discount</td>
                                              <td>${order.totalPrice}</td>
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

    await page.setContent(orderHistoryContent, {
      waitUntil: "domcontentloaded",
    });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=order_invoice_${req.params.orderId}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  itemcancelling,
  itemreturning,
  singleOrderPage,
  orderReturn,
  orderhistory,
  ordercancelling,
  downloadInvoice,
};
