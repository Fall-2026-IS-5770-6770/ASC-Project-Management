const { EntitySchema } = require("typeorm");

const ProjectStatus = new EntitySchema({
  name: "ProjectStatus",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: "increment",
    },
    order: {
      type: "smallint",
      nullable: false,
    },
  },
  relations: {
    project: {
      type: "many-to-one",
      target: "Project",
      inverseSide: "statusColumns",
      nullable: false,
      onDelete: "CASCADE",
      eager: true,
    },
    status: {
      type: "many-to-one",
      target: "Status",
      inverseSide: "projectColumns",
      nullable: false,
      onDelete: "CASCADE",
      eager: true,
    },
  },
});

module.exports = ProjectStatus;
