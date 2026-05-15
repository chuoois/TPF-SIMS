const Joi = require("joi");

/**
 * ManufacturingOrder Validation Schemas
 * Created By: ThinhBui
 * Created Date: 13/05/2026
 */

const createManufacturingOrderSchema = Joi.object({
  fk_supplier_id: Joi.number().integer().allow(null),
  note: Joi.string().allow("", null),
  deposit_amount: Joi.number().min(0).default(0),
  expected_delivery_date: Joi.date().iso().allow(null),
  items: Joi.array().items(
    Joi.object({
      fk_product_id: Joi.number().integer().allow(null),
      fk_custom_request_item_id: Joi.number().integer().allow(null),
      item_name: Joi.string().required(),
      item_material: Joi.string().allow("", null),
      item_size: Joi.alternatives().try(Joi.object(), Joi.string().allow("", null)).allow(null),
      item_color: Joi.string().allow("", null),
      quantity: Joi.number().integer().min(1).required(),
      import_price: Joi.number().min(0).required(),
      expected_date: Joi.date().iso().allow(null),
      item_is_bundle: Joi.number().integer().valid(0, 1).default(0),
      item_bundle_items: Joi.array().items(Joi.object()).allow(null),
      note: Joi.string().allow("", null)
    })
  ).min(1).required()
});

const updateManufacturingStatusSchema = Joi.object({
  status: Joi.number().integer().valid(0, 1, 2, 3, 4).required()
});

module.exports = {
  createManufacturingOrderSchema,
  updateManufacturingStatusSchema
};
