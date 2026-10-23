const {EntitySchema} = require("typeorm");

const Person = new EntitySchema({
    name:"Person",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        firstName:{
            type:"varchar",
            length:50,
            name:"first_name"
        },
        lastName:{
            type:"varchar",
            length:50,
            name:"last_name",
        },
        email:{
            type:"varchar",
            length:100,
            name:"email",
            unique:true
        }
    },
    relations:{
        addresses:{
            type:"one-to-many",
            target:"Address",
            inverseSide:"person",
            cascade:true
        },
        phoneNumbers:{
            type:"one-to-many",
            target:"PhoneNumber",
            inverseSide:"person",
            cascade:true
        }
    }
})

module.exports = Person;