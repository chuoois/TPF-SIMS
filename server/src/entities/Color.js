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
            nullable: false,
        },
        color_name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        color_status: {
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
});
