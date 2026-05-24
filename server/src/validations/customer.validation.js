const Joi = require('joi');

const createCustomerSchema = Joi.object({
  customer_code: Joi.string().max(50).allow(null, '').optional().messages({
    'string.base': 'Mã khách hàng phải là một chuỗi ký tự',
    'string.max': 'Mã khách hàng không được vượt quá 50 ký tự',
  }),
  full_name: Joi.string().max(150).required().messages({
    'string.base': 'Họ tên phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập họ tên khách hàng',
    'string.max': 'Họ tên không được vượt quá 150 ký tự',
    'any.required': 'Vui lòng nhập họ tên khách hàng',
  }),
  email: Joi.string().email().max(255).allow(null, '').optional().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
  }),
  phone_number: Joi.string().max(20).allow(null, '').optional().messages({
    'string.base': 'Số điện thoại phải là một chuỗi ký tự',
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  address: Joi.string().max(255).required().messages({
    'string.base': 'Địa chỉ phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập địa chỉ',
    'string.max': 'Địa chỉ không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập địa chỉ',
  }),
  gender: Joi.number().valid(1, 2, 3).allow(null, 0, '').optional().messages({
    'number.base': 'Giới tính phải là số',
    'any.only': 'Giới tính không hợp lệ (1: Nam, 2: Nữ, 3: Khác)',
  }),
  dob: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Ngày sinh không hợp lệ',
  }),
  note: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Ghi chú phải là một chuỗi ký tự',
  }),
  fk_user_account_id: Joi.number().integer().allow(null, '').optional().messages({
    'number.base': 'ID tài khoản liên kết phải là số',
    'number.integer': 'ID tài khoản liên kết phải là số nguyên',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const updateCustomerSchema = Joi.object({
  customer_code: Joi.string().max(50).allow(null, '').optional().messages({
    'string.base': 'Mã khách hàng phải là một chuỗi ký tự',
    'string.max': 'Mã khách hàng không được vượt quá 50 ký tự',
  }),
  full_name: Joi.string().max(150).optional().messages({
    'string.base': 'Họ tên phải là một chuỗi ký tự',
    'string.empty': 'Họ tên không được để trống',
    'string.max': 'Họ tên không được vượt quá 150 ký tự',
  }),
  email: Joi.string().email().max(255).allow(null, '').optional().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
  }),
  phone_number: Joi.string().max(20).allow(null, '').optional().messages({
    'string.base': 'Số điện thoại phải là một chuỗi ký tự',
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  address: Joi.string().max(255).optional().messages({
    'string.base': 'Địa chỉ phải là một chuỗi ký tự',
    'string.empty': 'Địa chỉ không được để trống',
    'string.max': 'Địa chỉ không được vượt quá 255 ký tự',
  }),
  gender: Joi.number().valid(1, 2, 3).allow(null, 0, '').optional().messages({
    'number.base': 'Giới tính phải là số',
    'any.only': 'Giới tính không hợp lệ (1: Nam, 2: Nữ, 3: Khác)',
  }),
  dob: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Ngày sinh không hợp lệ',
  }),
  note: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Ghi chú phải là một chuỗi ký tự',
  }),
  fk_user_account_id: Joi.number().integer().allow(null, '').optional().messages({
    'number.base': 'ID tài khoản liên kết phải là số',
    'number.integer': 'ID tài khoản liên kết phải là số nguyên',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
