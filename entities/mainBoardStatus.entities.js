const {EntitySchema} = require("typeorm");

const MainBoardStatus = new EntitySchema({
    name:"MainBoardStatus",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        name:{
            type:"varchar",
            length:50,
            name: "status_name"
        },
        description:{
            type:"text",
            name:"status_description"
        },
        order:{
            type:"bigint",
            generated:"increment"
        }
    },
    relations: {
        project: {
            type: "many-to-one",
            target: "Project",
            inverseSide: "mainBoardStatus",
            nullable: false,
            onDelete: "CASCADE",
            eager: true,
            joinColumn: {name: "project_id"}
        }
    }

})

module.exports = MainBoardStatus;