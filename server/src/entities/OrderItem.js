const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "OrderItem",
  tableName: "order_item",

  columns: {
    pk_order_item_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    fk_order_id: {
      type: "varchar",
      length: 36,
      nullable: false,
    },
    fk_sku_id: {
      type: "varchar",
      length: 36,
      nullable: true,
    },
    custom_product_name: {
      type: "varchar",
      length: 150,
      nullable: true,
    },
    custom_wood_type: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    custom_size: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    custom_color: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    custom_note: {
      type: "text",
      nullable: true,
    },
    quantity: {
      type: "int",
      nullable: false,
    },
    unit_price: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: { name: "fk_order_id" },
      onDelete: "CASCADE",
    },
    sku: {
      type: "many-to-one",
      target: "Sku",
      joinColumn: { name: "fk_sku_id" },
    },
  },
});
