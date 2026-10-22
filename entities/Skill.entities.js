const {EntitySchema} = require("typeorm");

const Skill = new EntitySchema({
    name:"Skill",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        skillName:{
            type:"varchar",
            length:50,
            name:"skill_name"
        },
        category:{
            type:"varchar",
            length:50,
            name:"category"
        },
        description:{
            type:"varchar",
            name:"description"
        }
    },
    relations:{
        mentor:{
            type:"many-to-many",
            target:"Mentor",
            inverseSide:"skill",
            joinTable:{
                name:"mentor-skills"
            }
        },
        personSkill:{
            type:"one-to-many",
            target:"personSkill",
            inverseSide:"skill"
        },
        projectSkills:{
            type:"one-to-many",
            target:"projectSkill",
            inverseSide:"skill"
        }

    }
})

module.exports = Skill