const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WoodType",
    tableName: "wood_type",

    columns: {
        pk_wood_type_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        wood_code: {
            type: "varchar",
            length: 50,
            unique: true,
        },
        wood_name: {
            type: "varchar",
            length: 255,
        },
        wood_status: {
            type: "varchar",
            length: 20,
            default: "ACTIVE",
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
