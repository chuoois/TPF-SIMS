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
      nullable: false,
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
