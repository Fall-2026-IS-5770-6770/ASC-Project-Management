const {EntitySchema} = require("typeorm");

const PersonSkill = new EntitySchema({
    name:"PersonSkill",
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        proficiency:{
            type:"varchar",
            length:"50",
            name:"proficiency"
        },
        yearsExperience:{
            type:"smallint",
            name:"years_experience",
        },
        lastUsed:{
            type:"date",
            name:"last_used"
        }
    },
    relations:{
        people:{
            type:"many-to-one",
            target: "Person",
            inverseSide: "person_skills",
            nullable:false,
            joinColumn:{
                name:"person_id"
            }
        },
        skill:{
            type:"many-to-one",
            target:"Skill",
            inverseSide:"person_skill",
            nullable:false,
            joinColumn:{
                name:"skill_id"
            }
        }
    }
})

module.exports = PersonSkill