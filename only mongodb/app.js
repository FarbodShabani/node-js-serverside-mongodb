const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const mongoConnect = require("./util/database").mongoConnect;

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Users = require('./models/users');
const rootDir = require("./util/path");
const appController = require("./controllers/error");

app.set("view engine" ,"ejs")

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
    Users.fetchUserById("62f3be9862be48a2701b8990").then((user) => {
        req.user = new Users(user.username, user.email, user.cart, user._id);
        next();
    }).catch((err) => console.log("having problem with adding user", err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(appController.get404);

mongoConnect(() => {
    app.listen(2828);
});