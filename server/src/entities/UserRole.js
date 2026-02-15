const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserRole",
  tableName: "user_role",

  columns: {
    pk_role_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    role_code: {
      type: "varchar",
      length: 50,
    },
    role_name: {
      type: "varchar",
      length: 255,
    },
    description: {
      type: "text",
      nullable: true,
    },
    timestamp: {
      type: "datetime",
      createDate: true,
    },
  },

  relations: {
    userAccounts: {
      type: "one-to-many",
      target: "UserAccount",
      inverseSide: "role",
    },
  },
});
