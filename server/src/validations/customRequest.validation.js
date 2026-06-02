const Joi = require('joi');

const itemSchema = Joi.object({
  id: Joi.number().integer().optional(),
  item_name: Joi.string().max(255).allow(null, '').optional().messages({
    'string.base': 'Tên sản phẩm phải là một chuỗi ký tự',
    'string.max': 'Tên sản phẩm không được vượt quá 255 ký tự',
  }),
  item_img: Joi.string().allow(null, '').optional(),
  item_quantity: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.base': 'Số lượng phải là một số',
    'number.min': 'Số lượng tối thiểu là 1',
  }),
  item_material: Joi.string().max(255).allow(null, '').optional(),
  item_size: Joi.any().optional(), // Hỗ trợ JSON hoặc chuỗi
  item_color: Joi.string().max(100).allow(null, '').optional(),
  item_price: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Giá sản phẩm phải là một số',
    'number.min': 'Giá sản phẩm không được âm',
  }),
  item_note: Joi.string().allow(null, '').optional(),
  is_finished: Joi.number().valid(0, 1).allow(null).optional(),
  customer_img: Joi.array().items(Joi.string()).allow(null).optional(),
  design_img: Joi.array().items(Joi.string()).allow(null).optional(),
  fk_supplier_id: Joi.number().integer().allow(null).optional(),
  expected_supplier_date: Joi.date().allow(null, '').optional(),
  item_cost_price: Joi.number().min(0).allow(null).optional(),

  item_is_bundle: Joi.number().valid(0, 1).allow(null).optional(),
  item_bundle_items: Joi.any().allow(null).optional(),
  item_warranty: Joi.number().integer().allow(null).optional(),
}).unknown(false);

const createRequestSchema = Joi.object({
  fk_customer_id: Joi.number().integer().required().messages({
    'number.base': 'ID khách hàng phải là một số',
    'number.integer': 'ID khách hàng phải là số nguyên',
    'any.required': 'Vui lòng cung cấp ID khách hàng (fk_customer_id)',
  }),
  address: Joi.string().max(255).allow(null, '').optional().messages({
    'string.base': 'Địa chỉ phải là một chuỗi ký tự',
    'string.max': 'Địa chỉ không được vượt quá 255 ký tự',
  }),
  order_status: Joi.number().integer().allow(null).optional(),
  order_type: Joi.number().integer().allow(null).optional(),
  note: Joi.string().allow(null, '').optional(),
  items: Joi.array().items(itemSchema).optional().messages({
    'array.base': 'Danh sách sản phẩm phải là một mảng',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const updateStatusSchema = Joi.object({
  status: Joi.number().integer().required().messages({
    'number.base': 'Trạng thái phải là một số',
    'number.integer': 'Trạng thái phải là số nguyên',
    'any.required': 'Vui lòng truyền trạng thái mới (status)',
  }),
  total_estimated_price: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Tổng giá dự toán phải là một số',
    'number.min': 'Tổng giá dự toán không được âm',
  }),
  note: Joi.string().allow(null, '').optional(),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

const updateRequestSchema = Joi.object({
  deposit_amount: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Số tiền cọc phải là một số',
    'number.min': 'Số tiền cọc không được âm',
  }),
  total_amount: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Tổng tiền phải là một số',
    'number.min': 'Tổng tiền không được âm',
  }),
  expected_fulfillment_date: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Ngày giao hàng dự kiến không hợp lệ',
  }),
  fulfillment_method: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': 'Phương thức giao hàng phải là một chuỗi ký tự',
    'string.max': 'Phương thức giao hàng không được vượt quá 100 ký tự',
  }),

  note: Joi.string().allow(null, '').optional(),
  items: Joi.array().items(itemSchema).optional().messages({
    'array.base': 'Danh sách sản phẩm phải là một mảng',
  }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

module.exports = {
  createRequestSchema,
  updateStatusSchema,
  updateRequestSchema,
};
