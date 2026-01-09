const router = require("express").Router();
const Product = require("../models/Products");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "抓取商品失敗" });
  }
});

module.exports = router;
