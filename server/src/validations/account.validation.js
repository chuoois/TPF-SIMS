const Joi = require('joi');

const createAccountSchema = Joi.object({
  email: Joi.string().email().max(255).required().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập email',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập email',
  }),
  password: Joi.string().min(6).max(255).allow(null, '').optional().messages({
    'string.base': 'Mật khẩu phải là một chuỗi ký tự',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'string.max': 'Mật khẩu không được vượt quá 255 ký tự',
  }),
  role_id: Joi.number().integer().required().messages({
    'number.base': 'Role ID phải là một số',
    'number.integer': 'Role ID phải là số nguyên',
    'any.required': 'Vui lòng chọn vai trò (role_id)',
  }),
  full_name: Joi.string().max(255).required().messages({
    'string.base': 'Họ tên phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập họ tên',
    'string.max': 'Họ tên không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập họ tên',
  }),
  phone_number: Joi.string().max(20).allow(null, '').optional().messages({
    'string.base': 'Số điện thoại phải là một chuỗi ký tự',
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  dob: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Ngày sinh không hợp lệ',
  }),
  gender: Joi.number().valid(0, 1).allow(null, '').optional().messages({
    'number.base': 'Giới tính phải là số',
    'any.only': 'Giới tính chỉ nhận giá trị 0 (Nữ) hoặc 1 (Nam)',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const updateAccountSchema = Joi.object({
  role_id: Joi.number().integer().optional().messages({
    'number.base': 'Role ID phải là một số',
    'number.integer': 'Role ID phải là số nguyên',
  }),
  full_name: Joi.string().max(255).optional().messages({
    'string.base': 'Họ tên phải là một chuỗi ký tự',
    'string.empty': 'Họ tên không được để trống',
    'string.max': 'Họ tên không được vượt quá 255 ký tự',
  }),
  password: Joi.string().min(6).max(255).allow(null, '').optional().messages({
    'string.base': 'Mật khẩu phải là một chuỗi ký tự',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'string.max': 'Mật khẩu không được vượt quá 255 ký tự',
  }),
  phone_number: Joi.string().max(20).allow(null, '').optional().messages({
    'string.base': 'Số điện thoại phải là một chuỗi ký tự',
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  dob: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Ngày sinh không hợp lệ',
  }),
  gender: Joi.number().valid(0, 1).allow(null, '').optional().messages({
    'number.base': 'Giới tính phải là số',
    'any.only': 'Giới tính chỉ nhận giá trị 0 (Nữ) hoặc 1 (Nam)',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const toggleStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required().messages({
    'number.base': 'Trạng thái phải là số',
    'any.only': 'Trạng thái chỉ nhận giá trị 0 (Khóa) hoặc 1 (Kích hoạt)',
    'any.required': 'Vui lòng truyền trạng thái (status)',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  createAccountSchema,
  updateAccountSchema,
  toggleStatusSchema,
};
