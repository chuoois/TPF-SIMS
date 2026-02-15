const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "RefreshToken",
  tableName: "refresh_token",

  columns: {
    pk_refresh_token_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    token_hash: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    expires_at: {
      type: "datetime",
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
