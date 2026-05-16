const Joi = require('joi');

/**
 * Product Validation Schemas
 * Joi schema cho việc tạo và cập nhật sản phẩm
 * Created By: ThinhBui
 * Created Date: 15/05/2026
 */

const sizeSchema = Joi.object({
  length: Joi.number().allow(null, '').optional(),
  width: Joi.number().allow(null, '').optional(),
  height: Joi.number().allow(null, '').optional(),
  note: Joi.string().allow(null, '').optional(),
}).allow(null).optional();

const pricingSchema = Joi.object({
  cost_price: Joi.number().min(0).default(0),
  raw_price: Joi.number().min(0).default(0),
  final_price: Joi.number().min(0).default(0),
  profit_margin: Joi.number().min(0).max(100).default(0),
  operating_margin: Joi.number().min(0).max(100).default(0),
}).allow(null).optional();

const createProductSchema = Joi.object({
  product_name: Joi.string().max(255).required().messages({
    'string.empty': 'Tên sản phẩm không được để trống',
    'any.required': 'Vui lòng nhập tên sản phẩm',
    'string.max': 'Tên sản phẩm không quá 255 ký tự',
  }),
  sku: Joi.string().max(100).required().messages({
    'string.empty': 'Mã sản phẩm (SKU) không được để trống',
    'any.required': 'Vui lòng nhập mã sản phẩm',
    'string.max': 'Mã sản phẩm không quá 100 ký tự',
  }),
  fk_category_id: Joi.number().integer().allow(null).optional(),
  fk_color_id: Joi.number().integer().allow(null).optional(),
  fk_material_id: Joi.number().integer().allow(null).optional(),
  fk_room_id: Joi.number().integer().allow(null).optional(),
  product_img: Joi.string().allow(null, '').optional(),
  description: Joi.string().allow(null, '').optional(),
  is_bundle: Joi.number().valid(0, 1).default(0),
  bundle_items: Joi.any().allow(null).optional(),
  product_type: Joi.string().valid('FINISHED', 'RAW', 'CUSTOM').default('FINISHED').messages({
    'any.only': 'Loại sản phẩm phải là FINISHED, RAW hoặc CUSTOM',
  }),
  warranty_months: Joi.number().integer().min(0).allow(null).optional().messages({
    'number.min': 'Thời hạn bảo hành không được âm',
  }),
  size: sizeSchema,
  is_gift: Joi.number().valid(0, 1).default(0),
  pricing: pricingSchema,
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép',
});

const updateProductSchema = Joi.object({
  product_name: Joi.string().max(255).optional().messages({
    'string.empty': 'Tên sản phẩm không được để trống',
    'string.max': 'Tên sản phẩm không quá 255 ký tự',
  }),
  sku: Joi.string().max(100).optional().messages({
    'string.empty': 'Mã sản phẩm (SKU) không được để trống',
    'string.max': 'Mã sản phẩm không quá 100 ký tự',
  }),
  fk_category_id: Joi.number().integer().allow(null).optional(),
  fk_color_id: Joi.number().integer().allow(null).optional(),
  fk_material_id: Joi.number().integer().allow(null).optional(),
  fk_room_id: Joi.number().integer().allow(null).optional(),
  product_img: Joi.string().allow(null, '').optional(),
  description: Joi.string().allow(null, '').optional(),
  is_bundle: Joi.number().valid(0, 1).optional(),
  bundle_items: Joi.any().allow(null).optional(),
  product_type: Joi.string().valid('FINISHED', 'RAW', 'CUSTOM').optional().messages({
    'any.only': 'Loại sản phẩm phải là FINISHED, RAW hoặc CUSTOM',
  }),
  warranty_months: Joi.number().integer().min(0).allow(null).optional().messages({
    'number.min': 'Thời hạn bảo hành không được âm',
  }),
  size: sizeSchema,
  is_gift: Joi.number().valid(0, 1).optional(),
  product_status: Joi.number().valid(0, 1).optional(),
  pricing: pricingSchema,
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép',
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
