const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Warehouse",
    tableName: "warehouse",

    columns: {
        pk_warehouse_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        warehouse_code: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        warehouse_name: {
            type: "varchar",
            length: 150,
            nullable: false,
        },
        address: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        phone: {
            type: "varchar",
            length: 20,
            nullable: true,
        },
        warehouse_status: {
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
        warehouseInventories: {
            type: "one-to-many",
            target: "WarehouseInventory",
            inverseSide: "warehouse",
        },
    },
});