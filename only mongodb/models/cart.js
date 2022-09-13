// const fs = require("fs");
// const path = require("path");

// const rootDir = require("../util/path");

// const cartPath = path.join(rootDir, "data", "cart.json");



// module.exports = class Cart {
//     static addToCart = (productId, productPrice) => {
//         fs.readFile(cartPath, (err, fileContnet) => {
//             let cart = {products: [], totalPrice: 0};
//             if (!err && fileContnet.length > 0) {
//                 cart = JSON.parse(fileContnet);
//             }
//             const productCartIndex = cart.products.findIndex((cartProduct) => cartProduct.id == productId);
//             const existingProduct = cart.products[productCartIndex];
//             if (existingProduct) {
//                 const updateProducts = [...cart.products];
//                 updateProducts[productCartIndex] = {...existingProduct, qty: existingProduct.qty + 1};
//                 cart.products =  updateProducts;
//                 cart.totalPrice = cart.totalPrice + + productPrice;
//             } else {
//                 const updateProduct = {id : productId, qty : 1} ;
//                 cart = {products: [...cart.products, updateProduct], totalPrice: cart.totalPrice + +productPrice};
//             }
//             fs.writeFile(cartPath, JSON.stringify(cart) , (err) => {
//                 if(err)
//                 console.log('writting On cart error', err);
//             })
//         });
//     };

//     static deleteFromCart = (productId, productPrice, cb) => {
//         fs.readFile(cartPath, (err, fileContnet) => {
//             if (!err && fileContnet.length > 0) {
//                 const updatedCart = {...JSON.parse(fileContnet)};
//                 if (updatedCart.products.length <= 0) {
//                     return cb();
//                 }
//                 const deletedProduct = updatedCart.products.find((product) => product.id === productId);
//                 const updateProducts = updatedCart.products.filter((product) => product.id !== productId );
//                 const updatedTotalPrice = updatedCart.totalPrice - (productPrice * deletedProduct.qty);
//                 updatedCart.products = updateProducts;
//                 updatedCart.totalPrice = updatedTotalPrice;
//                 fs.writeFile(cartPath, JSON.stringify(updatedCart), (err) => {
//                     if(err)
//                     console.log('writting On cart error', err);
//                 });
//                 return cb();
//             }
//             return cb();
//         })
//     }

//     static getAllProducts = (cb) => {
//         fs.readFile(cartPath, (err, fileContent) => {
//             if (!err && fileContent.length > 0) {
//                 return cb(JSON.parse(fileContent));
//             } else {
//                 return cb(null);
//             }
//         })
//     }
// }