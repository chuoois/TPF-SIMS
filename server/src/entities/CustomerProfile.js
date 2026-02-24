const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CustomerProfile",
  tableName: "customer_profile",

  columns: {
    pk_customer_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    customer_code: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    full_name: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    address: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    gender: {
      type: "varchar",
      length: 10,
      nullable: true,
    },
    dob: {
      type: "date",
      nullable: true,
    },
    phone_number: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    customer_type: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    note: {
      type: "text",
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
});
