const router = require("express").Router();
const Order = require("../models/order-model");
const User = require("../models/user-model");

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "請先登入後再下單" });
  }

  try {
    const {
      products,
      totalPrice,
      recipient,
      shippingFee,
      discount,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!recipient || !products) {
      return res.status(400).json({ message: "資料填寫不完整" });
    }

    const newOrder = new Order({
      user: req.user._id,
      orderId: `ORD${Date.now()}`,
      items: products,
      total: totalPrice,
      customer: {
        name: recipient.name,
        phone: recipient.phone,
        email: recipient.email,
      },
      shippingFee: Number(shippingFee) || 0,
      discount: Number(discount) || 0,
      paymentMethod,
      status: "處理中",
    });

    const savedOrder = await newOrder.save();

    if (discount > 0 && couponCode === "MERRY CHRISTMAS") {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { usedCoupons: "MERRY CHRISTMAS" },
      });
      console.log(
        `[系統] 使用者 ${req.user._id} 已核銷折扣碼：MERRY CHRISTMAS`
      );
    }

    res.status(201).json({ success: true, savedOrder });
  } catch (err) {
    console.error("訂單儲存失敗:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/my-orders", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "系統錯誤", error: err.message });
  }
});

module.exports = router;
