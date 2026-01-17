const router = require("express").Router();
const { productModel: Product } = require("../models");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "抓取商品失敗，伺服器錯誤" });
  }
});

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name, tags, price, img, category } = req.body;
    const newProduct = new Product({ name, tags, price, img, category });
    try {
      const savedProduct = await newProduct.save();
      res.json(savedProduct);
    } catch (err) {
      res.status(400).json({ message: "新增商品失敗", error: err });
    }
  }
);

module.exports = router;
