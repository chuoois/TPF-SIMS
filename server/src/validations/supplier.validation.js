const Joi = require('joi');

/**
 * Supplier Joi Validation Schema
 * Created By: Antigravity
 * Created Date: 19/05/2026
 */

const createSupplierSchema = Joi.object({
  supplier_name: Joi.string().max(255).required().messages({
    'string.base': 'Tên nhà cung cấp phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập tên nhà cung cấp',
    'string.max': 'Tên nhà cung cấp không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập tên nhà cung cấp',
  }),
  contact_person: Joi.string().max(255).allow(null, '').optional().messages({
    'string.base': 'Người liên hệ phải là một chuỗi ký tự',
    'string.max': 'Người liên hệ không được vượt quá 255 ký tự',
  }),
  phone_number: Joi.string().max(20).allow(null, '').optional().messages({
    'string.base': 'Số điện thoại phải là một chuỗi ký tự',
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  email: Joi.string().email().max(255).allow(null, '').optional().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
  }),
  address: Joi.string().max(255).required().messages({
    'string.base': 'Địa chỉ phải là một chuỗi ký tự',
    'string.empty': 'Vui lòng nhập địa chỉ',
    'string.max': 'Địa chỉ không được vượt quá 255 ký tự',
    'any.required': 'Vui lòng nhập địa chỉ',
  }),
  tax_code: Joi.string().max(50).allow(null, '').optional().messages({
    'string.base': 'Mã số thuế phải là một chuỗi ký tự',
    'string.max': 'Mã số thuế không được vượt quá 50 ký tự',
  }),
  note: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Ghi chú phải là một chuỗi ký tự',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const updateSupplierSchema = Joi.object({
  supplier_name: Joi.string().max(255).optional().messages({
    'string.base': 'Tên nhà cung cấp phải là một chuỗi ký tự',
    'string.empty': 'Tên nhà cung cấp không được để trống',
    'string.max': 'Tên nhà cung cấp không được vượt quá 255 ký tự',
  }),
  contact_person: Joi.string().max(255).allow(null, '').optional().messages({
    'string.base': 'Người liên hệ phải là một chuỗi ký tự',
    'string.max': 'Người liên hệ không được vượt quá 255 ký tự',
  }),
  phone_number: Joi.string().max(20).allow(null, '').optional().messages({
    'string.base': 'Số điện thoại phải là một chuỗi ký tự',
    'string.max': 'Số điện thoại không được vượt quá 20 ký tự',
  }),
  email: Joi.string().email().max(255).allow(null, '').optional().messages({
    'string.base': 'Email phải là một chuỗi ký tự',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 255 ký tự',
  }),
  address: Joi.string().max(255).optional().messages({
    'string.base': 'Địa chỉ phải là một chuỗi ký tự',
    'string.empty': 'Địa chỉ không được để trống',
    'string.max': 'Địa chỉ không được vượt quá 255 ký tự',
  }),
  tax_code: Joi.string().max(50).allow(null, '').optional().messages({
    'string.base': 'Mã số thuế phải là một chuỗi ký tự',
    'string.max': 'Mã số thuế không được vượt quá 50 ký tự',
  }),
  note: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Ghi chú phải là một chuỗi ký tự',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  createSupplierSchema,
  updateSupplierSchema,
};
