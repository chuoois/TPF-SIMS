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

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu cũ',
    'any.required': 'Vui lòng nhập mật khẩu cũ',
  }),
  newPassword: Joi.string().min(6).max(255).required().messages({
    'string.empty': 'Vui lòng nhập mật khẩu mới',
    'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'string.max': 'Mật khẩu mới không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập mật khẩu mới',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().max(150).required().messages({
    'string.empty': 'Vui lòng nhập họ và tên',
    'string.max': 'Họ và tên không được vượt quá 150 ký tự',
    'any.required': 'Vui lòng nhập họ và tên',
  }),
  phoneNumber: Joi.string().max(20).allow('', null).optional().messages({
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  dob: Joi.string().isoDate().allow('', null).optional().messages({
    'string.isoDate': 'Ngày sinh không đúng định dạng YYYY-MM-DD',
  }),
  gender: Joi.number().integer().valid(0, 1).allow(null).optional().messages({
    'number.base': 'Giới tính không hợp lệ',
    'any.only': 'Giới tính phải là Nam hoặc Nữ',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
};
