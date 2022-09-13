const {validationResult} = require("express-validator");

const Product = require("../models/products");
const { deleteFile } = require("../util/file");


exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editProduct: false,
    hasError: false,
    errorMessage: "",
    errorArray: [],
    product: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editProduct: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: "Image you uploading has a problem",
      errorArray: [{param: "image"}],
    });
  }
  const imageUrl = image.path;
  const errorMessage = validationResult(req);
  if (!errorMessage.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editProduct: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: errorMessage.array()[0].msg,
      errorArray: errorMessage.array(),
    });
  }
  const userId = req.user;
  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId,
  });
  product
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => {
      console.log("error in creating product: \n", err);
      next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const { editProduct } = req.query;
  if (editProduct !== "true") {
    return res.redirect("/admin/products");
  }
  const { productId } = req.params;
  Product.findById(productId).then((product) => {
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editProduct: true,
      product: product,
      productId,
      hasError: false,
      errorMessage: "",
      errorArray: [],
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { title, price, description, productId } = req.body;
  const image = req.file;
  const errorMessage = validationResult(req);
  if (!errorMessage.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editProduct: true,
      hasError: true,
      product: { title, price, description, productId },
      productId,
      errorMessage: errorMessage.array()[0].msg,
      errorArray: errorMessage.array(),
    });
  }
  const userId = req.user._id;
   Product.findById(productId).then((product) => {
    if (product.userId.toString() != userId.toString()) {
      return null;
    }
    product.title = title;
    product.price = price;
    if(image){
    deleteFile(product.imageUrl);
    product.imageUrl = image.path;
  }
    product.description = description;
    product.userId = userId;
    return product.save();
   }).then(() => {
    res.redirect("/admin/products");
  }).catch((error) => {
    console.log("error in editing product: \n", error);
    next(error);
  });
};

exports.deleteProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId).then((product) => {
    if(!product) {
      next(new Error("product not found!!"))
    }
    deleteFile(product.imageUrl);
   return Product.findOneAndDelete({_id : product._id, userId: req.user._id});
  }).then(() => res.status(200).json({message: "success"}))
    .catch((err) => res.status(500).json({message: "failed"}));
};


exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id}).then((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};
