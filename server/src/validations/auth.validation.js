const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập email',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập email',
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.base': 'Mật khẩu phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập mật khẩu',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'string.max': 'Mật khẩu không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập email',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập email',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
};
