const {EntitySchema} = require("typeorm");

const CommunicationChannel = new EntitySchema({
    name: "CommunicationChannel",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment"
        },
        type: {
            type: "varchar",
            length: 50,
            nullable: false
        },
        name: {
            type: "varchar",
            length: 300,
            nullable: false
        },
        url: {
            type: "varchar",
            length: 2050,
            nullable: true
        }
    },
    relations: {
        project:{
            type: "many-to-one",
            target: "Project",
            joinColumn: true,
            inverseSide: "communicationchannels",
            nullable: false
        },
        participants: {
            type: "many-to-many",
            target: "User",
            joinTable: true,
            inverseSide: "communicationchannels"
        }
    }
})

module.exports = CommunicationChannel;