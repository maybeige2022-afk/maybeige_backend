const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(6).max(100).required().email(),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)"))
      .required()
      .messages({
        "string.pattern.base": "密碼必須包含至少一個英文字母和一個數字",
        "string.min": "密碼長度至少需要 6 位",
      }),
    phone: Joi.string().allow(""),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(100).required().email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports = { registerValidation, loginValidation };
