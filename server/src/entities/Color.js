const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Color",
    tableName: "color",

    columns: {
        pk_color_id: {
            type: "varchar",
            length: 36,
            primary: true,
        },
        color_code: {
            type: "varchar",
            length: 50,
            unique: true,
        },
        color_name: {
            type: "varchar",
            length: 100,
        },
        color_status: {
            type: "varchar",
            length: 50,
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
