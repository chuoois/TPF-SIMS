const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserProfile",
  tableName: "user_profile",

  columns: {
    pk_user_profile_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    full_name: {
      type: "varchar",
      length: 255,
    },
    phone_number: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    dob: {
      type: "date",
      nullable: true,
    },
    gender: {
      type: "tinyint",
      nullable: true,
    },
    salary_type: {
      type: "tinyint",
      nullable: true,
    },
    timestamp: {
      type: "datetime",
      createDate: true,
    },
  },

  relations: {
    account: {
      type: "one-to-one",
      target: "UserAccount",
      joinColumn: {
        name: "fk_user_account_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    salaries: {
      type: "one-to-many",
      target: "EmployeeSalary",
      inverseSide: "userProfile",
    },
  },
});
