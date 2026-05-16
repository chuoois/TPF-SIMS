const Joi = require('joi');

const orderItemSchema = Joi.object({
  fk_product_id: Joi.number().integer().required().messages({
    'number.base': 'ID sản phẩm phải là một số',
    'any.required': 'Vui lòng cung cấp ID sản phẩm',
  }),
  item_name: Joi.string().max(255).allow(null, '').optional(),
  item_img: Joi.string().allow(null, '').optional(),
  item_quantity: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.min': 'Số lượng tối thiểu là 1',
  }),
  item_price: Joi.number().min(0).allow(null).optional().messages({
    'number.min': 'Giá bán không được âm',
  }),
  item_material: Joi.string().allow(null, '').optional(),
  item_color: Joi.string().allow(null, '').optional(),
  item_size: Joi.any().optional(),
  item_warranty: Joi.number().integer().min(0).allow(null).optional(),
  item_note: Joi.string().allow(null, '').optional(),
  item_is_bundle: Joi.number().valid(0, 1).allow(null).optional(),
  item_bundle_items: Joi.any().allow(null).optional(),
  item_is_gift: Joi.number().valid(0, 1).allow(null).optional(),
  is_finished: Joi.number().valid(0, 1).allow(null).optional(),
  customer_img: Joi.array().items(Joi.string()).allow(null).optional(),
  design_img: Joi.array().items(Joi.string()).allow(null).optional(),
}).unknown(false);

const createOrderSchema = Joi.object({
  fk_customer_id: Joi.number().integer().required().messages({
    'any.required': 'Vui lòng chọn khách hàng',
  }),
  fulfillment_method: Joi.string().max(100).allow(null, '').optional(),

  expected_fulfillment_date: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Ngày giao hàng dự kiến không hợp lệ',
  }),
  note: Joi.string().allow(null, '').optional(),
  deposit_amount: Joi.number().min(0).allow(null).optional().messages({
    'number.min': 'Số tiền cọc không được âm',
  }),
  received_amount: Joi.number().min(0).allow(null).optional().messages({
    'number.min': 'Số tiền thu thêm không được âm',
  }),
  delivery_image: Joi.any().optional(),
  deposit_method: Joi.string().max(50).allow(null, '').optional(),
  deposit_date: Joi.date().allow(null, '').optional(),
  deposit_proof_img: Joi.array().items(Joi.string()).allow(null).optional(),
  address: Joi.string().max(255).allow(null, '').optional(),
  total_amount: Joi.number().min(0).required().messages({
    'any.required': 'Vui lòng cung cấp tổng tiền đơn hàng',
    'number.min': 'Tổng tiền không được âm',
  }),
  order_status: Joi.number().integer().allow(null).optional(),
  order_type: Joi.number().integer().allow(null).optional(),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'array.min': 'Đơn hàng phải có ít nhất 1 sản phẩm',
    'any.required': 'Vui lòng cung cấp danh sách sản phẩm',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  createOrderSchema,
};
