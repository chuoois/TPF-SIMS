const Joi = require("joi");

/**
 * Worker Validation Schemas
 * Validate dữ liệu đầu vào cho các API của Worker
 */

// Validate params :id (pk_order_item_id) - phải là số nguyên dương
const taskIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "ID sản phẩm phải là số",
    "number.integer": "ID sản phẩm phải là số nguyên",
    "number.positive": "ID sản phẩm phải lớn hơn 0",
    "any.required": "Vui lòng cung cấp ID sản phẩm",
  }),
});

// Validate body khi thợ gửi ảnh hoàn thành (mảng URL)
const completeTaskSchema = Joi.object({
  finishedImages: Joi.array()
    .items(
      Joi.string().uri().messages({
        "string.base": "Mỗi URL ảnh phải là chuỗi",
        "string.uri": "URL ảnh không hợp lệ",
      })
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      "array.base": "Danh sách ảnh phải là mảng",
      "array.min": "Vui lòng tải lên ít nhất 1 ảnh sản phẩm hoàn thành",
      "array.max": "Tối đa 10 ảnh",
      "any.required": "Vui lòng tải lên ảnh sản phẩm hoàn thành",
    }),
});

// Validate body khi chủ từ chối (reject)
const rejectTaskSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    "string.base": "Lý do phải là chuỗi",
    "string.min": "Lý do từ chối phải có ít nhất 5 ký tự",
    "string.max": "Lý do từ chối không được quá 500 ký tự",
    "any.required": "Vui lòng nhập lý do từ chối",
  }),
});

/**
 * Middleware factory: validate request theo schema
 * @param {Joi.Schema} schema - Schema cần validate
 * @param {'body'|'params'|'query'} source - Nguồn dữ liệu cần validate
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Trả về tất cả lỗi, không dừng ở lỗi đầu tiên
      stripUnknown: true, // Loại bỏ các trường không khai báo trong schema
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: messages,
      });
    }

    // Gán lại giá trị đã validate (đã strip unknown)
    req[source] = value;
    next();
  };
};

module.exports = {
  taskIdSchema,
  completeTaskSchema,
  rejectTaskSchema,
  validate,
};
