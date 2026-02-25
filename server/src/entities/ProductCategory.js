const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ProductCategory",
    tableName: "product_category",

    columns: {
        pk_product_category_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        category_code: {
            type: "varchar",
            length: 50,
            unique: true,
        },
        category_name: {
            type: "varchar",
            length: 150,
        },
        category_status: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
        created_at: {
            type: "datetime",
            createDate: true,
            nullable: true,
        },
        updated_at: {
            type: "datetime",
            updateDate: true,
            nullable: true,
        },
    },
});