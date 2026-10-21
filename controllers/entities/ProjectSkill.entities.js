const {EntitySchema} = require ("typeorm")

const ProjectSkill = new EntitySchema({
    name: "ProjectSkill",
    tableName: "project_skills",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        projectId: {
            type: Number,
            nullable: false
        },
        skillId: {
            type: Number,
            nullable: false
        },
        importance: {
            type: "enum",
            enum: ["required", "preferred"],
            nullable: false
        },
        minimumProficiency: {
            type: "enum",
            enum: ["Beginner", "Intermediate", "Advanced"],
            nullable: false
        },

    },
    uniques: [
        {
            name: "UQ_project_skill",
            columns: ["projectId", "skillId"]
        }
    ],

    relations: {
        project: {
            target: "Project",
            type: "many-to-one",
            joinColumn: { name: "projectId" },
            inverseSide: "projectSkills"
        },
        skill: {
            target: "Skill",
            type: "many-to-one",
            joinColumn: { name: "skillId" },
            inverseSide: "projectSkills"
        }
    }
})

module.exports = ProjectSkill