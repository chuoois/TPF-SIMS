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
            nullable: false,
        },
        wood_name: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        wood_status: {
            type: "varchar",
            length: 20,
            nullable: true,
        },
        created_at: {
            type: "datetime",
            createDate: true,
        },
        updated_at: {
            type: "datetime",
            updateDate: true,
        },
    },

    relations: {
        skus: {
            type: "one-to-many",
            target: "Sku",
            inverseSide: "woodType",
        },
    },
});
