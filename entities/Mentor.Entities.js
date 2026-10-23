const {EntitySchema} = require('typeorm');

const Mentor = new EntitySchema({
    name:'Mentor',
    columns:{
        mentorId:{
            type:'bigint',
            primary:true,
            generated:'increment',
            name:'mentor_Id'
        },
        department:{
            type:'varchar',
            length:75
        },
        availability:{
            type:'varchar',
            length:100,
        },
        maxProjectLoad:{
            type:'smallint',
            name:'max_project_load'
        }
    },
    relations:{
        people:{
            type:'one-to-one',
            target:'People',
            inverseSide:'mentor',
            joinColumn:true,
            eager:true
        },
        projectTypes:{
            type:'many-to-one',
            target:'ProjectTypes',
            inverseSide:'mentor',
            nullable:false,
            eager:true
        },
        skills:{
            type:'many-to-many',
            target:'Skills',
            inverseSide:'mentors',
            joinTable:{
                name:'mentor_skills'
            }
        }
    }
})

module.exports = Mentor;