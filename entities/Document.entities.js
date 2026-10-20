const { EntitySchema } = require("typeorm");

const Document = new EntitySchema({
    name: 'Document',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: 'increment',
        },
        name: {
            type: 'varchar'
        },
        type: {
            type: 'varchar'
        },
        fileName: {
            type: 'varchar'
        },
        fileUrl: {
            type: 'varchar'
        },
        projectId: {
            type: 'int'
        },
        personId: {
            type: 'int'
        },
        uploadedDate: {
            type: 'date'
        },
        version: {
            type: 'varchar'
        },
        status: {
            type: 'varchar'
        }
    },
    relations: {
        project: {
            type: 'many-to-one',
            target: 'Project',
            joinColumn: { name: 'projectId' },
            inverseSide: 'projects'
        },
        uploader: {
            type: 'many-to-one',
            target: 'Person',
            joinColumn: { name: 'personId' },
            inverseSide: 'documents'
        }
    }
})

module.exports = Document;