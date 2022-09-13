const Cart = require("../models/cart");
const Product = require("../models/products");

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.fetchById(productId).then((product) => {
    res.render("shop/product-detail", {
      product,
      path: "/products",
      pageTitle: product.title,
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then((cartProducts) => {
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      cartProducts,
    });
  });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  Product.fetchById(productId).then((product) => {
    req.user
      .addToCart(product)
      .then(() => res.redirect("/cart"))
      .catch((err) => console.log("error in adding product to cart: \n", err));
  });
};

exports.postDeleteCartItem = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .deleteCartItemById(productId)
    .then(() => res.redirect("cart"))
    .catch((err) => console.log("error in redirecting"));
};

exports.postAddOrders = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => res.redirect("/orders"))
    .catch((err) => console.log("err in adding orders: \n", err));
};

exports.getOrders = (req, res) => {
  req.user.getOrders().then((ordersResult) => {
    Promise.all(ordersResult).then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
      });
    });
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
