const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Product",
    tableName: "product",

    columns: {
        pk_product_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        product_name: {
            type: "varchar",
            length: 150,
            nullable: false,
        },
        product_img: {
            type: "varchar",
            length: 225,
            nullable: true,
        },
        purchase_price: {
            type: "decimal",
            precision: 15,
            scale: 2,
            nullable: true,
        },
        selling_price: {
            type: "decimal",
            precision: 15,
            scale: 2,
            nullable: true,
        },
        product_status: {
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
        productCategory: {
            type: "many-to-one",
            target: "ProductCategory",
            joinColumn: {
                name: "fk_product_category_id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        skus: {
            type: "one-to-many",
            target: "Sku",
            inverseSide: "product",
        },
    },
});