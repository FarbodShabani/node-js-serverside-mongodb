const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const CMS = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");


const rootDir = require("./util/path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const appController = require("./controllers/error");

const User = require("./models/users");

const isAuth = require("./middleware/is-auth");

const app = express();
const store = new CMS({
  uri: "",
  collection: "session",
});
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
const csrfProtection = csrf();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: multerStorage, fileFilter}).single("image"));
app.use(express.static(path.join(rootDir, "public")));
app.use("/images",express.static(path.join(rootDir, "images")));
app.use(
  session({
    secret: "this is my secret okey??!!!",
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);
app.use(flash());


app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});



app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id).then((user) => {
      if (!user) {
        next();
      }
      req.user = user;
      next();
    }).catch((error) => {next(new Error(error))})
  } else {
    next();
  }
});

app.use("/admin", isAuth, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500",appController.get500);
app.use(appController.get404);

app.use((error, req, res, next) => {
  console.log("error : \n", error);
  res.status(500).render('500', { pageTitle: 'Error occurred', path: '/500' });
});


mongoose
  .connect(
    ""
  )
  .then(() => app.listen("2828"))
  .catch((err) =>
    console.log("error when connecting to mongoose or listen to port : \n", err)
  );
