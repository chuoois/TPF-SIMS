const Joi = require('joi');

/**
 * Import Validation – Phiếu Nhập Kho
 * Created By: HieuNM
 */

// ── Schema cho dòng sản phẩm lẻ / bộ ──────────────────────
const importLineSchema = Joi.object({
  id: Joi.number().integer().allow(null).optional(),
  isBundle: Joi.boolean().required(),

  // Dòng lẻ
  productId: Joi.number().integer().allow(null).optional(),
  productCode: Joi.string().max(100).allow('', null).optional(),
  productName: Joi.string().max(255).allow('', null).optional(),
  qty: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải lớn hơn 0',
  }),
  importPrice: Joi.number().min(0).max(1000000000).allow(null).optional().messages({
    'number.min': 'Giá nhập không được âm',
    'number.max': 'Giá nhập không được vượt quá 1 tỷ đồng',
  }),
  unitIds: Joi.array().items(Joi.string().max(100)).max(500).allow(null).optional(),
  details: Joi.string().max(500).allow('', null).optional(),
  category: Joi.string().max(100).allow('', null).optional(),
  materialType: Joi.string().max(100).allow('', null).optional(),
  color: Joi.string().max(100).allow('', null).optional(),
  productType: Joi.string().valid('RAW', 'CUSTOM', 'FINISHED').allow('', null).optional(),

  // Dòng bộ
  bundleCode: Joi.string().max(100).allow('', null).optional(),
  bundleName: Joi.string().max(255).allow('', null).optional(),
  bundleQty: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.integer': 'Số bộ phải là số nguyên',
    'number.min': 'Số bộ phải lớn hơn 0',
  }),
  bundlePrice: Joi.number().min(0).max(1000000000).allow(null).optional().messages({
    'number.min': 'Giá bộ không được âm',
    'number.max': 'Giá bộ không được vượt quá 1 tỷ đồng',
  }),
  bundleUnitIds: Joi.array().items(Joi.string().max(100)).max(500).allow(null).optional(),
  items: Joi.array().items(
    Joi.object({
      _id: Joi.any().optional(),
      name: Joi.string().max(255).required().messages({
        'any.required': 'Vui lòng nhập tên món lẻ',
        'string.empty': 'Tên món lẻ không được để trống',
      }),
      qty: Joi.number().integer().min(1).required().messages({
        'number.min': 'Số lượng món lẻ tối thiểu là 1',
        'any.required': 'Vui lòng nhập số lượng món lẻ',
      }),
      productNote: Joi.string().max(255).allow('', null).optional(),
    }).unknown(true)
  ).allow(null).optional(),
}).unknown(true);

// ── Schema tạo phiếu nhập ─────────────────────────────────
const createImportReceiptSchema = Joi.object({
  importDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Ngày nhập phải đúng định dạng YYYY-MM-DD',
      'any.required': 'Vui lòng chọn ngày nhập',
      'string.empty': 'Ngày nhập không được để trống',
    }),
  supplier: Joi.string().max(200).allow('', null).optional(),
  note: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'Ghi chú không được vượt quá 500 ký tự',
  }),
  invoiceImgUrl: Joi.string().uri().allow('', null).optional().messages({
    'string.uri': 'URL ảnh chứng từ không hợp lệ',
  }),
  manufacturingOrderId: Joi.number().integer().allow(null).optional(),
  lines: Joi.array()
    .items(importLineSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'Phiếu nhập cần có ít nhất 1 mặt hàng',
      'array.max': 'Phiếu nhập không được vượt quá 50 mặt hàng',
      'any.required': 'Vui lòng thêm mặt hàng vào phiếu nhập',
    }),
}).unknown(false).messages({
  'object.unknown': 'Trường {#label} không được phép có trong request',
});

// ── Middleware validate ────────────────────────────────────
const validateCreateImportReceipt = (req, res, next) => {
  const { error, value } = createImportReceiptSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ message: `Dữ liệu không hợp lệ: ${messages}` });
  }

  // ── Validate khoảng ngày nhập ──────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(value.importDate);
  const diffDays = (selectedDate - today) / (1000 * 60 * 60 * 24);
  if (diffDays > 7) {
    return res.status(400).json({ message: 'Ngày nhập không được vượt quá 7 ngày so với hôm nay' });
  }
  if (diffDays < -365) {
    return res.status(400).json({ message: 'Ngày nhập không được cách hôm nay quá 1 năm' });
  }

  // ── Deep validate từng dòng ────────────────────────────
  for (let i = 0; i < (value.lines || []).length; i++) {
    const line = value.lines[i];
    const lineLabel = `Dòng ${i + 1}`;

    if (line.isBundle) {
      if (!line.bundleName || !line.bundleName.trim()) {
        return res.status(400).json({ message: `${lineLabel}: Tên bộ sản phẩm không được để trống` });
      }
      const bundleQty = parseInt(line.bundleQty) || 0;
      if (bundleQty <= 0) {
        return res.status(400).json({ message: `${lineLabel}: Số bộ phải lớn hơn 0` });
      }
      const bundlePrice = parseFloat(line.bundlePrice) || 0;
      if (bundlePrice <= 0) {
        return res.status(400).json({ message: `${lineLabel} (${line.bundleName}): Giá bộ phải lớn hơn 0` });
      }
      if (!line.items || line.items.length === 0) {
        return res.status(400).json({ message: `${lineLabel}: Bộ sản phẩm cần có ít nhất 1 món lẻ` });
      }
      for (const it of line.items) {
        if (!it.name || !String(it.name).trim()) {
          return res.status(400).json({ message: `${lineLabel}: Tên món lẻ không được để trống` });
        }
        if (!it.qty || parseInt(it.qty) <= 0) {
          return res.status(400).json({ message: `${lineLabel}: Số lượng món lẻ "${it.name}" phải lớn hơn 0` });
        }
      }
    } else {
      if (!line.productName || !line.productName.trim()) {
        return res.status(400).json({ message: `${lineLabel}: Tên sản phẩm không được để trống` });
      }
      const qty = parseInt(line.qty) || 0;
      if (qty <= 0) {
        return res.status(400).json({ message: `${lineLabel} (${line.productName}): Số lượng phải lớn hơn 0` });
      }
      const importPrice = parseFloat(line.importPrice) || 0;
      if (importPrice <= 0) {
        return res.status(400).json({ message: `${lineLabel} (${line.productName}): Giá nhập phải lớn hơn 0` });
      }
    }
  }

  // ── Validate không trùng unitIds trong cùng phiếu ─────
  const allUnitIds = [];
  for (const line of value.lines || []) {
    const ids = line.unitIds || line.bundleUnitIds || [];
    for (const uid of ids) {
      if (uid && allUnitIds.includes(uid)) {
        return res.status(400).json({ message: `Mã định danh "${uid}" bị trùng lặp trong phiếu nhập` });
      }
      if (uid) allUnitIds.push(uid);
    }
  }

  req.body = value;
  next();
};

module.exports = { validateCreateImportReceipt };
