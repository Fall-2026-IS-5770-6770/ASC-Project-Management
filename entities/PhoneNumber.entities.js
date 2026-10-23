const {EntitySchema} = require("typeorm");

const PhoneNumber = new EntitySchema({
    name:"PhoneNumber",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        number:{
            type:"varchar",
            length:20,
            name:"number"
        },
        label:{
            type:"varchar",
            length:20,
            name:"label",
            nullable:true
        }
    },
    relations:{
        person:{
            type:"many-to-one",
            target:"Person",
            inverseSide:"phoneNumbers",
            joinColumn:true,
            onDelete:"CASCADE"
        }
    }
})

module.exports = PhoneNumber;