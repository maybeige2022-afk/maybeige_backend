const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const authRoute = require("./routes").auth;
const orderRoute = require("./routes").order;
const productRoute = require("./routes/product-route");
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

// connect to DB
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connected to MongoDB Atlas."))
  .catch((err) => console.log(err));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://maybeige-frontend.onrender.com",
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// API
app.use("/api/user", authRoute);
app.use(
  "/api/orders",
  passport.authenticate("jwt", { session: false }),
  orderRoute
);
app.use("/api/product", productRoute);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
