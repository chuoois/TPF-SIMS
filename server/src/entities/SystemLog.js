const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "SystemLog",
  tableName: "system_log",

  columns: {
    pk_system_log_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    description: {
      type: "text",
    },
    modified_by: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    timestamp: {
      type: "datetime",
      createDate: true,
    },
  },

  relations: {
    userAccount: {
      type: "many-to-one",
      target: "UserAccount",
      joinColumn: {
        name: "fk_user_account_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
});
