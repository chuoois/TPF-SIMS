const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "EmployeeSalary",
  tableName: "employee_salary",

  columns: {
    pk_employee_salary_id: {
      type: "varchar",
      length: 36,
      primary: true,
    },
    salary_month: {
      type: "date",
    },
    daily_rate: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    work_days: {
      type: "int",
      nullable: true,
    },
    product_rate: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    product_qty: {
      type: "int",
      nullable: true,
    },
    total_amount: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    payment_status: {
      type: "tinyint",
      default: 0,
    },
    payment_date: {
      type: "date",
      nullable: true,
    },
    note: {
      type: "text",
      nullable: true,
    },
    timestamp: {
      type: "datetime",
      createDate: true,
    },
  },

  relations: {
    userProfile: {
      type: "many-to-one",
      target: "UserProfile",
      joinColumn: {
        name: "fk_user_profile_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
});
