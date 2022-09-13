const path = require("path");
const fs = require("fs");
const stripe = require("stripe")(
  "pk_test_51LhE3hHEiCYNvTktqBXqTjwWf8EYMRcEkLdHIFgI3ythlzsHagZpJUOzlH90IMjfeLzDz7aRz0sFZmPqcXvGigot00Syc247NG"
);

const pdfDocument = require("pdfkit");

const Order = require("../models/orders");
const Product = require("../models/products");

const PRODUCT_ITEM_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProductNumber = 0;
  Product.find()
    .countDocuments()
    .then((totalCount) => {
      totalProductNumber = totalCount;
      return Product.find()
        .skip((page - 1) * PRODUCT_ITEM_PER_PAGE)
        .limit(PRODUCT_ITEM_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: totalProductNumber > page * PRODUCT_ITEM_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProductNumber / PRODUCT_ITEM_PER_PAGE),
      });
    });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId).then((product) => {
    res.render("shop/product-detail", {
      product,
      path: "/products",
      pageTitle: product.title,
    });
  });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProductNumber = 0;
  Product.find()
    .countDocuments()
    .then((totalCount) => {
      totalProductNumber = totalCount;
      return Product.find()
        .skip((page - 1) * PRODUCT_ITEM_PER_PAGE)
        .limit(PRODUCT_ITEM_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: totalProductNumber > page * PRODUCT_ITEM_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProductNumber / PRODUCT_ITEM_PER_PAGE),
      });
    });
};

exports.getCart = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    const cartProducts = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      cartProducts,
    });
  });
};

exports.getCheckout = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    const cartProducts = user.cart.items;
    let totalPrice = 0;
    cartProducts?.map((product) => {
      totalPrice += product.quantity * product.productId.price;
    });
    console.log("total:\n", totalPrice);
    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      cartProducts,
      totalPrice,
    });
  });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId).then((product) => {
    req.user
      .addToCart(product)
      .then(() => res.redirect("/cart"))
      .catch((err) => {
        console.log("error in adding product to cart: \n", err);
        next(err);
      });
  });
};

exports.postDeleteCartItem = (req, res, next) => {
  const { productId } = req.body;
  req.user
    .deleteCartItemById(productId)
    .then(() => res.redirect("cart"))
    .catch((e) => next(e));
};

exports.postAddOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const cartProducts = user.cart.items.map((item) => ({
        quantity: item.quantity,
        product: { ...item.productId._doc },
      }));
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: cartProducts,
      });
      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      console.log("err in adding orders: \n", err);
      next(err);
    });
};

exports.getPay = (req, res) => {
  const line_items = [];
  req.user.populate("cart.items.productId").then((user) => {
    return stripe.checkout.sessions.create({
      line_items: user.cart.items?.map((product) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.productId.title,
            },
            unit_amount: product.productId.price,
          },
          quantity: product.quantity,
        }
      }),
      mode: "payment",
      success_url: req.protocal + "://" + req.get("host") + "checkout/success",
      cancel_url: req.protocal + "://" + req.get("host") + "checkout/cancel",
    });
  }).then((session) => {
    res.redirect(303, session.url);
  })
};

exports.getOrders = (req, res) => {
  Order.find({ "user.userId": req.user._id }).then((ordersResult) => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      ordersResult,
    });
  });
};

exports.getOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("couldn't find the order"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("this user is not autherized for this action"));
      }
      const pdfDoc = new pdfDocument();
      const filename = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoice", filename);
      let totalPay = 0;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + filename + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(24).text("The invoice");
      pdfDoc.text("-------------------------------");
      order.products.map((productObj, index) => {
        totalPay += productObj.product.price;
        pdfDoc
          .fontSize(16)
          .text(
            index +
              "." +
              productObj.product.title +
              " x " +
              productObj.quantity +
              "  " +
              "$" +
              productObj.product.price
          );
      });

      pdfDoc.fontSize(20).text("-------------------------------");
      pdfDoc.fontSize(24).text("total: $" + totalPay);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
