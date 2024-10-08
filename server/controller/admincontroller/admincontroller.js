// modules importing 
const adminmodel = require("../../model/user_model");
const categoryModel = require("../../model/category_model");
const orderModel=require("../../model/order_model")
const bcrypt = require("bcryptjs");
const ExcelJS = require('exceljs');
const fs=require('fs')
const os=require('os')
const path=require('path')
const puppeteer=require('puppeteer')
const {isFutureDate}=require('../../../utils/validators/admin_validator')
const flash=require("express-flash");
const { log } = require("console");

const { chromium } = require('playwright');




// admin login page
const login = async (req, res) => {
  try {
    if(req.session.isadAuth){
      return res.redirect("/admin/adminpannel")
    }
    res.render("admin/adminlogin.ejs");
  } catch (error) {
    console.log(error);
    res.render("users/serverError");
  }
};

// admin login action 
const adminlogin = async (req, res) => {
  try {
    const trues = "true";
    const user = await adminmodel.findOne({ isAdmin: trues });
    console.log(req.body);
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
      res.render("admin/adminlogin", { passworderror: "invalid password/username" });
    }
  } catch (error) {
    console.log(error);
    res.render("users/serverError");
  }
};

// admin pannel page 
const adminpannel = async (req, res) => {
  try {
      res.render("admin/adminpannel",{expressFlash:{
        derror:req.flash('derror')
      }});
    
  } catch (error) {
    console.log(error);
    res.render("users/serverError");
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
    res.render("users/serverError");
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
    res.render("users/serverError");
  }
};

// admin searchview 
const searchview = async (req, res) => {
  try {
      const user = req.session.searchuser;
      res.render("admin/userslist", { users: user });
    
  } catch (error) {
    console.log(error);
    res.render("users/serverError");
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
    res.render("users/serverError");
  }
};




// admin logout 
const adlogout = async (req, res) => {
  try {
      req.session.isadAuth = false;
      res.redirect('/admin')
  
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const chartData=async(req,res)=>{
  try {
      const selected=req.body.selected
      console.log(selected);
      if(selected=='month'){
          const orderByMonth= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          month:{$month:'$createdAt'},
                      },
                      count:{$sum:1},
                  }
              }
          ])
          const salesByMonth= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          month:{$month:'$createdAt'},
                      },
                      totalAmount: { $sum: '$totalPrice' },
                      
                  }
              }
          ])
          console.log('order2',orderByMonth);
          console.log('sales2',salesByMonth);
          const responseData = {
              order: orderByMonth,
              sales: salesByMonth
            };
            
            
            res.status(200).json(responseData);
      }
      else if(selected=='year'){
          const orderByYear= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          year:{$year:'$createdAt'},
                      },
                      count:{$sum:1},
                  }
              }
          ])
          const salesByYear= await orderModel.aggregate([
              {
                  $group:{
                      _id:{
                          year:{$year:'$createdAt'},
                      },
                      totalAmount: { $sum: '$totalPrice' },
                  }
              }
          ])
          console.log('order1',orderByYear);
          console.log('sales1',salesByYear);
          const responseData={
              order:orderByYear,
              sales:salesByYear,
          }
          res.status(200).json(responseData);
      }
      
    }
  catch(err){
    console.log(err);
    res.send("Error Occured")
    }

}

// const downloadsales = async (req, res) => {
//   try {
//       const { startDate, endDate } = req.body;

//       let sdate=isFutureDate(startDate)
//       let edate=isFutureDate(endDate)

//       if(sdate){
//         req.flash('derror','invalid date')
//         return res.redirect('/admin/adminpannel')
//       }
//       if(edate){
//         req.flash('derror','invalid date')
//         return res.redirect('/admin/adminpannel')

//       }

//       const salesData = await orderModel.aggregate([
//           {
//               $match: {
//                   createdAt: {
//                       $gte: new Date(startDate),
//                       $lt: new Date(endDate),
//                   },
//               },
//           },
//           {
//               $group: {
//                   _id: null,
//                   totalOrders: { $sum: 1 },
//                   totalAmount: { $sum: '$totalPrice' },
//               },
//           },
//       ]);
//       console.log("ithu sales",salesData);

//       const products = await orderModel.aggregate([
//           {
//               $match: {
//                   createdAt: {
//                       $gte: new Date(startDate),
//                       $lt: new Date(endDate),
//                   },
//               },
//           },
//           {
//               $unwind: '$items',
//           },
//           {
//               $group: {
//                   _id: '$items.productId',
//                   totalSold: { $sum: '$items.quantity' },
//               },
//           },
//           {
//               $lookup: {
//                   from: 'products',
//                   localField: '_id',
//                   foreignField: '_id',
//                   as: 'productDetails',
//               },
//           },
//           {
//               $unwind: '$productDetails',
//           },
//           {
//               $project: {
//                   _id: 1,
//                   totalSold: 1,
//                   productName: '$productDetails.name',
//               },
//           },
//           {
//               $sort: { totalSold: -1 },
//           },
//       ]);

//       const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Sales Report</title>
//         <style>
//             body {
//                 margin-left: 20px;
//             }
//         </style>
//     </head>
//     <body>
//         <h2 align="center"> Sales Report</h2>
//         Start Date:${startDate}<br>
//         End Date:${endDate}<br> 
//         <center>
//             <table style="border-collapse: collapse;">
//                 <thead>
//                     <tr>
//                         <th style="border: 1px solid #000; padding: 8px;">Sl N0</th>
//                         <th style="border: 1px solid #000; padding: 8px;">Product Name</th>
//                         <th style="border: 1px solid #000; padding: 8px;">Quantity Sold</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${products
//                         .map(
//                             (item, index) => `
//                             <tr>
//                                 <td style="border: 1px solid #000; padding: 8px;">${index + 1}</td>
//                                 <td style="border: 1px solid #000; padding: 8px;">${item.productName}</td>
//                                 <td style="border: 1px solid #000; padding: 8px;">${item.totalSold}</td>
//                             </tr>`
//                         )
//                         .join("")}
//                     <tr>
//                         <td style="border: 1px solid #000; padding: 8px;"></td>
//                         <td style="border: 1px solid #000; padding: 8px;">Total No of Orders</td>
//                         <td style="border: 1px solid #000; padding: 8px;">${salesData[0]?.totalOrders || 0}</td>
//                     </tr>
//                     <tr>
//                         <td style="border: 1px solid #000; padding: 8px;"></td>
//                         <td style="border: 1px solid #000; padding: 8px;">Total Revenue</td>
//                         <td style="border: 1px solid #000; padding: 8px;">${salesData[0]?.totalAmount || 0}</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </center>
//     </body>
//     </html>
// `;


//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();
//       await page.setContent(htmlContent);

//       // Generate PDF
//       const pdfBuffer = await page.pdf();

//       await browser.close();

//       const downloadsPath = path.join(os.homedir(), 'Downloads');
//       const pdfFilePath = path.join(downloadsPath, 'sales.pdf');

//       // Save the PDF file locally
//       fs.writeFileSync(pdfFilePath, pdfBuffer);

//       // Send the PDF as a response
//       res.setHeader('Content-Length', pdfBuffer.length);
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', 'attachment; filename=sales.pdf');
//       res.status(200).end(pdfBuffer);
//   } catch (err) {
//       console.error(err);
//       res.render("users/serverError");
//     }
// };

const downloadsales = async (req, res) => {
  try {
      const { startDate, endDate } = req.body;

      let sdate = isFutureDate(startDate);
      let edate = isFutureDate(endDate);

      if (sdate) {
        req.flash('derror', 'invalid date');
        return res.redirect('/admin/adminpannel');
      }
      if (edate) {
        req.flash('derror', 'invalid date');
        return res.redirect('/admin/adminpannel');
      }

      const salesData = await orderModel.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(startDate),
                      $lt: new Date(endDate),
                  },
              },
          },
          {
              $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalAmount: { $sum: '$totalPrice' },
              },
          },
      ]);

      const products = await orderModel.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(startDate),
                      $lt: new Date(endDate),
                  },
              },
          },
          {
              $unwind: '$items',
          },
          {
              $group: {
                  _id: '$items.productId',
                  totalSold: { $sum: '$items.quantity' },
              },
          },
          {
              $lookup: {
                  from: 'products',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'productDetails',
              },
          },
          {
              $unwind: '$productDetails',
          },
          {
              $project: {
                  _id: 1,
                  totalSold: 1,
                  productName: '$productDetails.name',
              },
          },
          {
              $sort: { totalSold: -1 },
          },
      ]);

      const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sales Report</title>
        <style>
            body {
                margin-left: 20px;
            }
        </style>
    </head>
    <body>
        <h2 align="center"> Sales Report</h2>
        Start Date:${startDate}<br>
        End Date:${endDate}<br> 
        <center>
            <table style="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px;">Sl No</th>
                        <th style="border: 1px solid #000; padding: 8px;">Product Name</th>
                        <th style="border: 1px solid #000; padding: 8px;">Quantity Sold</th>
                    </tr>
                </thead>
                <tbody>
                    ${products
                        .map(
                            (item, index) => `
                            <tr>
                                <td style="border: 1px solid #000; padding: 8px;">${index + 1}</td>
                                <td style="border: 1px solid #000; padding: 8px;">${item.productName}</td>
                                <td style="border: 1px solid #000; padding: 8px;">${item.totalSold}</td>
                            </tr>`
                        )
                        .join("")}
                    <tr>
                        <td style="border: 1px solid #000; padding: 8px;"></td>
                        <td style="border: 1px solid #000; padding: 8px;">Total No of Orders</td>
                        <td style="border: 1px solid #000; padding: 8px;">${salesData[0]?.totalOrders || 0}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 8px;"></td>
                        <td style="border: 1px solid #000; padding: 8px;">Total Revenue</td>
                        <td style="border: 1px solid #000; padding: 8px;">${salesData[0]?.totalAmount || 0}</td>
                    </tr>
                </tbody>
            </table>
        </center>
    </body>
    </html>
      `;

      // Launch Playwright's Chromium browser
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      // Generate PDF
      const pdfBuffer = await page.pdf();

      await browser.close();

      const downloadsPath = path.join(os.homedir(), 'Downloads');
      const pdfFilePath = path.join(downloadsPath, 'sales.pdf');

      // Ensure the directory exists
      if (!fs.existsSync(downloadsPath)) {
        fs.mkdirSync(downloadsPath, { recursive: true });
      }

      // Save the PDF file locally
      fs.writeFileSync(pdfFilePath, pdfBuffer);

      // Send the PDF as a response
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales.pdf');
      res.status(200).end(pdfBuffer);
  } catch (err) {
      console.error('Error generating sales report:', err);
      res.render("users/serverError", { error: err.message });
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
  chartData,
  downloadsales
};
