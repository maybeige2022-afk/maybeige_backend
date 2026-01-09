const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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
app.use(cors());
app.use("/api/user", authRoute);
app.use(
  "/api/orders",
  passport.authenticate("jwt", { session: false }),
  orderRoute
);
app.use("/api/product", productRoute);
app.use(express.static("public"));

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
