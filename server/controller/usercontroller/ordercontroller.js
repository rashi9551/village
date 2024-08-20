const catModel = require("../../model/category_model");
const walletModel = require("../../model/wallet_Model");
const moment = require("moment");
const orderModel = require("../../model/order_model");
const productModel = require("../../model/product_model");
const easyinvoice = require('easyinvoice')

const orderhistory = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const [categories, od] = await Promise.all([
      catModel.find(),
      orderModel.find({ userId: userId})
    ])
  
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
    res.render("users/serverError")
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
              reason:"order cancelled",
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
              reason:"item cancelled",
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
            reason:"item returned",
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
            date: new Date(),
            type: "Credited",
            reason:"order returned",
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

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(orderId);
    const order = await orderModel.findOne({ orderId: orderId }).populate({
      path: "items.productId",
      select: "name",
    });
    console.log("jfthgcxfdshgdfrtc",order);
    const pdfBuffer = await generateInvoice(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      ` attachment; filename=invoice-${order.orderId}.pdf`
    );
    res.send(pdfBuffer);
    

  }
  
   catch (error) {
    console.log(error);
    res.send(error);
  }
};

const generateInvoice=async (order)=>{
  try{
    console.log("kayari");
    let totalAmount = order.totalPrice;
    const data = {
      documentTitle: "Invoice",
      currency: "INR",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      sender: {
        company: "Village",
        address: "123 Main Street, Banglore, India",
        zip: "651323",
        city: "Banglore",
        country: "INDIA",
        phone: "9544429615",
        email: "villageVillage.com",
        website: "www.villageVillage.online",
      },
      invoiceNumber: "INV-${order.orderId}",
      invoiceDate: new Date().toJSON(),
      products: order.items.map((item) => ({
        quantity: item.quantity,
        description: item.productName,
        price: item.price,
      })),

      total: parseInt(totalAmount),
      tax: 0,
      bottomNotice: "Thank you for shopping at VillageFurni!",
    };
  const result = await easyinvoice.createInvoice(data);
  const pdfBuffer = Buffer.from(result.pdf, "base64");

  return pdfBuffer;
}catch(error){
    console.log(error);
}


}
module.exports = {
  itemcancelling,
  itemreturning,
  singleOrderPage,
  orderReturn,
  orderhistory,
  ordercancelling,
  downloadInvoice,
};
