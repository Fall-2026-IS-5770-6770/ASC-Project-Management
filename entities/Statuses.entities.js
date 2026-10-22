const {EntitySchema} = require("typeorm");

const Statuses = new EntitySchema({
    name:"Statuses",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        name:{
            type:"varchar",
            name:"statusName"
        },
        description:{
            type:"varchar",
            length:50,
            name:"statusDesc"
        }
    },
    relations:{
        projectStatuses:{
            type:"many-to-many",
            target:"statusId",
            inverseSide:"statuses"
        },
    }
})

module.exports = Statuses;