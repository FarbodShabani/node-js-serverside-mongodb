const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  mongoClient
    .connect(
      "mongodb+srv://saina:puma1999sh@cluster0.riyzl.mongodb.net/shop?retryWrites=true&w=majority"
    )
    .then((client) => {
      _db = client.db("shop");
      callback(); 
    })
    .catch((err) => {
      console.log("error in connecting to mongodb server", err);
      throw err;
    });
  };
  
  const getDb = () => {
    if(_db) {
      return _db;
    }
    throw 'No DB found!';
  }
  
  exports.mongoConnect = mongoConnect;
  exports.getDb = getDb;
