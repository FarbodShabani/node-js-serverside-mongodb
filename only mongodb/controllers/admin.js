const Product = require("../models/products");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editProduct: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(
    title,
    imageUrl,
    price,
    description,
    null,
    req.user._id
  );
  product
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => {
      throw err;
    });
};

exports.getEditProduct = (req, res, next) => {
  const { editProduct } = req.query;
  if (editProduct !== "true") {
    return res.redirect("/");
  }
  const { productId } = req.params;
  Product.fetchById(productId).then((product) => {
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editProduct: true,
      product: product,
      productId,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { title, imageUrl, price, description, productId } = req.body;
  const product = new Product(title, imageUrl, price, description, productId);
  product.save().then(() => {
    res.redirect("/admin/products");
  });
};

exports.deleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.deleteById(productId)
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log("error in deleting product: ", err));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};
