const { EntitySchema } = require("typeorm");

class ProjectType {
    constructor(id, name, description, typicalDurationWeeks, typicalDeliverables = [], typicalSkillIds = [], audit = null) {
        if (id !== undefined) this.id = id;
        this.name = name;
        this.description = description;
        this.typicalDurationWeeks = typicalDurationWeeks;
        this.typicalDeliverables = typicalDeliverables || [];
        this.typicalSkillIds = typicalSkillIds || [];
        this.audit = audit;
    }
}

const ProjectTypeSchema = new EntitySchema({
    name: "ProjectType",
    target: ProjectType,
    tableName: "project_types",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
            unique: true,
            nullable: false,
        },
        description: {
            type: "text",
            nullable: true,
        },
        typicalDurationWeeks: {
            type: "int",
            nullable: true,
        },
        typicalDeliverables: {
            type: "simple-json",
            nullable: true,
        },
        typicalSkillIds: {
            type: "simple-json",
            nullable: true,
        },
        audit: {
            type: "simple-json",
            nullable: true,
        },
    },
});

ProjectTypeSchema.ProjectType = ProjectType;
ProjectTypeSchema.ProjectTypeSchema = ProjectTypeSchema;

module.exports = ProjectTypeSchema;
