const mongoDb = require("mongodb");
const getDb = require("../util/database").getDb;
const Product = require("./products");

const objectId = mongoDb.ObjectId;

class Users {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db
      .collection("users")
      .insertOne(this)
      .then(() => console.log("User succesfully added."))
      .catch((err) => console.log("Adding User Failed because: \n", err));
  }

  addToCart(product) {
    const cartItemIndex = this.cart?.items?.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );

    let newQuantity = 1;
    let newCartItems = this.cart?.items?.length > 0 ? [...this.cart.items] : [];

    if (cartItemIndex >= 0) {
      newQuantity = this.cart.items[cartItemIndex].quantity + 1;
      newCartItems[cartItemIndex].quantity = newQuantity;
    } else {
      newCartItems.push({ productId: new objectId(product._id), quantity: 1 });
    }
    const updatedCart = {
      items: newCartItems,
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new objectId(this._id) },
        { $set: { cart: updatedCart } }
      )
      .then((res) => console.log("cart is updated"))
      .catch((err) => console.log("cart is not updated because: \n", err));
  }

  getCart() {
    const cartProductList = Product.getCartProducts(this.cart);
    return cartProductList;
  }

  deleteCartItemById(productId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      (product) => product.productId.toString() !== productId.toString()
    );
    const updatedCart = {
      items: updatedCartItems,
    };
    return db
      .collection("users")
      .updateOne(
        { _id: new objectId(this._id) },
        {
          $set: { cart: updatedCart },
        }
      )
      .then(() => console.log("item deleted successfully"))
      .catch((err) => console.log("item didn't deleted because: \n", err));
  }

  addOrder() {
    const db = getDb();
    const newOrder = {
      orderList: this.cart,
      userDetail: {
        userId: new objectId(this._id),
        username: this.username,
      },
    };
    return db
      .collection("orders")
      .insertOne(newOrder)
      .then(() => {
        this.cart = [];
        db.collection("users").updateOne(
          { _id: this._id },
          { $set: { cart: { items: [] } } }
        );
      })
      .catch((err) => console.log("error in creating order: \n", err));
  }

  getOrders(cb) {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "userDetail.userId": new objectId(this._id) })
      .toArray()
      .then((orders) => {
      return Product.getOrdersProduct(orders)
      })
      .catch((err) =>
        console.log("trouble in finding orders for this user because: \n", err)
      );
  }

  static fetchUserById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .find({ _id: new objectId(userId) })
      .next()
      .then((user) => {
        console.log("user found");
        return user;
      })
      .catch((err) => console.log("we didn't find user because: \n", err));
  }
}

module.exports = Users;
