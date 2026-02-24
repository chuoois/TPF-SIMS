const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WarehouseInventory",
    tableName: "warehouse_inventory",

    columns: {
        pk_warehouse_inventory_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        quantity_available: {
            type: "int",
            nullable: true,
        },
        quantity_reserved: {
            type: "int",
            nullable: true,
        },
        quantity_defect: {
            type: "int",
            nullable: true,
        },
        minimum_stock: {
            type: "int",
            nullable: true,
        },
        maximum_stock: {
            type: "int",
            nullable: true,
        },
        location_code: {
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
        warehouse: {
            type: "many-to-one",
            target: "Warehouse",
            joinColumn: {
                name: "fk_warehouse_id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        sku: {
            type: "many-to-one",
            target: "Sku",
            joinColumn: {
                name: "fk_sku_id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    },
});
