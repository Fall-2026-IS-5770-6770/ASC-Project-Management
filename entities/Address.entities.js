const {EntitySchema} = require("typeorm");

const Address = new EntitySchema({
    name:"Address",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        street:{
            type:"varchar",
            length:100,
            name:"street"
        },
        city:{
            type:"varchar",
            length:100,
            name:"city",
        },
        state:{
            type:"varchar",
            length:50,
            name:"state"
        },
        zipCode:{
            type:"varchar",
            length:10,
            name:"zip_code"
        }
    },
    relations:{
        person:{
            type:"many-to-one",
            target:"Person",
            inverseSide:"addresses",
            joinColumn:true,
            onDelete:"CASCADE"
        }
    }
})

module.exports = Address;