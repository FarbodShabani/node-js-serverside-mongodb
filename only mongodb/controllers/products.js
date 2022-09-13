const Product = require("../models/products");


exports.getProducts = (req, res, next) => {
   Product.fetchAll((products) => {
     res.render("shop/product-list", {
       products,
       pageTitle: "shop",
       path: "/",
       hasProduct: products.length > 0,
     });
   });
  };

exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {
      pageTitle: "add-product",
      path: "/admin/add-product",
    });
  }

exports.getAdminProdcuts = (req, res, next) => {
    res.render("admin/products", {
      pageTitle: "admin-products",
      path: "/admin/products",
    });
  }

exports.postAddProducts = (req, res, next) => {
    const newProduct = new Product(req.body.title);
    newProduct.save();
    res.redirect("/");
  };