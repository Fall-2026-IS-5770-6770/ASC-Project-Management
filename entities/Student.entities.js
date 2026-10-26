const {EntitySchema} = require("typeorm");

// Defines the "student" table
// A student row has no name on it; the person relation holds the name and contact info
const Student = new EntitySchema({
    name:"Student", // Entity name; the table is created as "student"
    columns:{
        id:{
            type:"bigint",
            primary:true,
            generated:"increment"
        },
        major:{
            type:"varchar",
            length:100,
            nullable:true
        },
        graduationDate:{
            type:"date",
            name:"graduation_date",
            nullable:true
        },
        resumeUrl:{
            type:"varchar",
            length:255,
            name:"resume_url",
            nullable:true
        },
        minHoursPerWeek:{
            type:"real",
            name:"min_hours_per_week",
            nullable:true
        },
        maxHoursPerWeek:{
            type:"real",
            name:"max_hours_per_week",
            nullable:true
        },
        workApprovalStatus:{
            type:"varchar",
            length:20,
            name:"work_approval_status",
            default:"Pending"       // Approved, Pending, or Not Approved
        },
        availability:{
            type:"varchar",
            length:100,
            nullable:true
        }
    },
    relations:{
        // Each person can be at most one student
        person:{
            type:"one-to-one",
            target:"Person",
            inverseSide:"student",
            joinColumn:{
                name:"person_id"
            },
            nullable:false,
            eager:true
        },
        preferredProjectType:{
            type:"many-to-one",
            target:"ProjectType",
            inverseSide:"students",
            joinColumn:{
                name:"preferred_project_type_id"
            },
            nullable:true,
            eager:true
        },
        skills:{
            type:"many-to-many",
            target:"Skill",
            inverseSide:"students",
            joinTable:{
                name:"student_skills"
            }
        },
        // Past and present projects the student has worked on
        projects:{
            type:"many-to-many",
            target:"Project",
            inverseSide:"students",
            joinTable:{
                name:"student_projects"
            }
        }
    }
})

module.exports = Student;
