const router = require("express").Router();
const { registerValidation, loginValidation } = require("../validation");
const { userModel: User } = require("../models");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const tokenObject = { _id: user._id, email: user.email, role: user.role };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET, {
        expiresIn: "3d",
      });
      res.redirect(
        `${process.env.FRONTEND_URL}/google-success?token=${encodeURIComponent(
          "JWT " + token
        )}&email=${encodeURIComponent(user.email)}&role=${encodeURIComponent(
          user.role
        )}`
      );
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
    }
  }
);

// Login
router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已被註冊過囉！");
  const newUser = new User({
    email: req.body.email.toLowerCase().trim(),
    username: req.body.username,
    password: req.body.password,
    phone: req.body.phone,
    role: "customer",
  });
  try {
    const savedUser = await newUser.save();
    res.status(200).send({ msg: "歡迎加入！註冊成功", savedObject: savedUser });
  } catch (err) {
    res.status(400).send({ message: "註冊失敗", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
    });
    if (!user || !(await user.comparePassword(req.body.password)))
      return res.status(401).send("帳號或密碼錯誤。");
    const tokenObject = { _id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
    res.send({ success: true, token: "JWT " + token, user });
  } catch (err) {
    res.status(400).send("登入異常");
  }
});

// coupon
router.post(
  "/validate-coupon",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { couponCode } = req.body;
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "找不到使用者。" });

      const TARGET_CODE = "MERRY CHRISTMAS";

      const inputCode = couponCode ? couponCode.trim() : "";

      if (inputCode !== TARGET_CODE) {
        return res
          .status(400)
          .json({ success: false, message: "代碼錯誤，請檢查代碼是否正確" });
      }

      if (user.usedCoupons && user.usedCoupons.includes(TARGET_CODE)) {
        return res.status(400).json({
          success: false,
          message: "此折扣碼每個帳號限用一次，您已經領取過囉！",
        });
      }

      res.status(200).json({
        success: true,
        message: "代碼套用成功！",
        discount: 50,
      });
    } catch (err) {
      console.error("折扣碼驗證錯誤:", err);
      res.status(500).json({ success: false, message: "伺服器驗證出錯。" });
    }
  }
);

// upadte
router.patch(
  "/update-info",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { username, phone } = req.body;
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { username, phone },
        { new: true }
      );
      res.status(200).send({ success: true, message: "變更成功" });
    } catch (err) {
      res.status(400).send("更新失敗");
    }
  }
);

// myAccount
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    res.status(200).send({
      email: req.user.email,
      username: req.user.username,
      phone: req.user.phone,
    });
  }
);

// reset password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "找不到此信箱。" });
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });
    const mailOptions = {
      from: `"網站客服" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "重設您的密碼",
      text: `請點擊連結重設密碼：${process.env.FRONTEND_URL}/reset-password/${token}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "郵件已發送。" });
  } catch (err) {
    res.status(500).json({ message: "發信失敗" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "連結無效或已過期。" });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ success: true, message: "密碼更新成功。" });
  } catch (err) {
    res.status(500).json({ success: false, message: "重設失敗" });
  }
});

module.exports = router;
