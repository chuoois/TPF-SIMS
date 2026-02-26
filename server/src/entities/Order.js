const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Order",
  tableName: "order",

  columns: {
    pk_order_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    order_code: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },
    order_type: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "'IN_STOCK'",
    },
    fk_customer_id: {
      type: "varchar",
      length: 36,
      nullable: true,
    },
    order_address: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    order_date: {
      type: "datetime",
      nullable: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    expected_delivery_date: {
      type: "date",
      nullable: true,
    },
    customer_note: {
      type: "text",
      nullable: true,
    },
    vat_rate: {
      type: "decimal",
      precision: 5,
      scale: 2,
      nullable: true,
    },
    deposit_amount: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    total_amount: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    order_status: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },

  relations: {
    customer: {
      type: "many-to-one",
      target: "CustomerProfile",
      joinColumn: { name: "fk_customer_id" },
      onDelete: "CASCADE",
    },
  },
});
