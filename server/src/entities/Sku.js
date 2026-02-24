const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Sku",
    tableName: "sku",

    columns: {
        pk_sku_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        sku_code: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        sku_type: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
        wood_type: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        size: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        sku_color: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
        sku_status: {
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
        product: {
            type: "many-to-one",
            target: "Product",
            joinColumn: {
                name: "fk_product_id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        woodType: {
            type: "many-to-one",
            target: "WoodType",
            joinColumn: {
                name: "fk_wood_type_id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        warehouseInventories: {
            type: "one-to-many",
            target: "WarehouseInventory",
            inverseSide: "sku",
        },
    },
});
