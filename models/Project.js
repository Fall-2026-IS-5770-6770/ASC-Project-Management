const axios = require('axios');

class Project{
      
    id;
    name
    description
    clientId
    mainBoardStatusId
    projectManagerId
    startDate
    midpointDate
    endDate
    budget
    estimatedHours
    notes


    constructor(id, name, description, clientId, mainBoardStatusId, projectManagerId, startDate, midpointDate, endDate, budget, estimatedHours, notes){
       this.id  = id;
       this.name = name;
       this.description = description;
       this.clientId = clientId;
       this.mainBoardStatusId = mainBoardStatusId;
       this.projectManagerId = projectManagerId;
       this.startDate = startDate;
       this.midpointDate = midpointDate;
       this.endDate = endDate;
       this.budget = budget;
       this.estimatedHours = estimatedHours;
       this.notes = notes;
    }

    addClient(clientId){
        this.clientId = clientId;
    }

}

module.exports = Project