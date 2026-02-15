const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserAccount",
  tableName: "user_account",

  columns: {
    pk_user_account_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    password_hash: {
      type: "varchar",
      length: 255,
    },
    status: {
      type: "tinyint",
      default: 1,
    },
    timestamp: {
      type: "datetime",
      createDate: true,
    },
  },

  relations: {
    role: {
      type: "many-to-one",
      target: "UserRole",
      joinColumn: {
        name: "fk_role_id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },

    profile: {
      type: "one-to-one",
      target: "UserProfile",
      inverseSide: "account",
    },

    systemLogs: {
      type: "one-to-many",
      target: "SystemLog",
      inverseSide: "userAccount",
    },

    refreshTokens: {
      type: "one-to-many",
      target: "RefreshToken",
      inverseSide: "userAccount",
    },
  },
});
