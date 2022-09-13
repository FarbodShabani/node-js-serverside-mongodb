const mongoDb = require("mongodb");
const getDb = require("../util/database").getDb;

const objectId = mongoDb.ObjectId;

class Product {
  constructor(title, imageUrl, price, description, id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
    this._id = id && new objectId(id);
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne(
          { _id: this._id },
          {
            $set: this,
          }
        )
        .then(() => {
          console.log("product successfully updated");
        })
        .catch((error) => {
          throw error;
        });
    } else {
      dbOp = db
        .collection("products")
        .insertOne(this)
        .then(() => {
          console.log("product have been saved in collection");
        })
        .catch((err) => {
          throw err;
        });
    }
    return dbOp;
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((error) => {
        throw error;
      });
  }

  static getCartProducts = (cart) => {
    const productIds = cart.items.map((product) => product.productId);
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((productDetail) => ({
          ...productDetail,
          quantity: cart.items.find(
            (cartItem) =>
              cartItem.productId.toString() === productDetail._id.toString()
          ).quantity,
        }));
      });
  }

  static getOrdersProduct = (orders, cb) => {
  const result = orders.map(({orderList}) => {
      const productIds = orderList.items.map((product) => product.productId);
      const db = getDb();
      return db
        .collection("products")
        .find({ _id: { $in: productIds } })
        .toArray()
        .then((products) => {
          return products.map((productDetail) => ({
            ...productDetail,
            quantity: orderList.items.find(
              (cartItem) =>
                cartItem.productId.toString() === productDetail._id.toString()
            ).quantity,
          }));
        })
    });
    return result;
  }

  static fetchById = (productId) => {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new objectId(productId) })
      .next()
      .then((product) => product)
      .catch((error) => {
        throw error;
      });
  };

  static deleteById = (productId) => {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new objectId(productId) })
      .then(() => console.log("product deleted"))
      .catch((err) => console.log("deletting product error: \n", err));
  };
}

module.exports = Product;
