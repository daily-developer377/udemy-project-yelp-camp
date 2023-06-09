const express = require("express");
const app = express();
const path = require("path");
const Campground = require("./models/campground");
const mongoose = require("mongoose");
const campground = require("./models/campground");
const { Console } = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const session = require("express-session");
const flash = require("connect-flash");

const { campgroundSchema, reviewSchema } = require("./schemas");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp", {
    // useNewParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
  })
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log("Error occured");
    console.log(err);
  });

const campgrounds = require("./routes/campground"); //requiring routes of campground
const reviews = require("./routes/review"); //requiring routes of review

app.engine("ejs", ejsMate); //to enable boiler plate
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //use for method override so we can use _method while using methodOverride
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 7,
    maxAge: 1000 * 60 * 60 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
// setting flash to all routes we want to set it before the routes
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

// error temp based
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "something went wrong";
  res.status(statusCode).render("campgrounds/error.ejs", { err });
});

app.listen("3000", () => {
  console.log("Server started localhost 3000");
});
