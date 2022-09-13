const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/pay', isAuth, shopController.getPay);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postDeleteCartItem);

router.post('/orders', isAuth, shopController.postAddOrders);

router.get('/checkout/success', isAuth, shopController.postAddOrders);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getOrder);


module.exports = router;
