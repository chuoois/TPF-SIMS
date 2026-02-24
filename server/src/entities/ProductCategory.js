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
            nullable: false,
        },
        category_name: {
            type: "varchar",
            length: 150,
            nullable: false,
        },
        category_status: {
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
        products: {
            type: "one-to-many",
            target: "Product",
            inverseSide: "productCategory",
        },
    },
});
