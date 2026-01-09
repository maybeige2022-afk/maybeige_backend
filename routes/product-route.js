const router = require("express").Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

router.post("/add", async (req, res) => {
  const { name, tags, price, img, category } = req.body;
  const newProduct = new Product({ name, tags, price, img, category });
  try {
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
