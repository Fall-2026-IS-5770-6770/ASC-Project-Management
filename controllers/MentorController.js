function getCreateMentorPage(req, res) {
    res.send("Create mentors page");
}

function saveNewMentor(req, res) {
    console.log(req.body);
    res.send("Saving a new mentor");
}

function getAllMentors(req, res) {
    res.send("Get all mentors");
}

function getEditMentor(req, res) {
    res.send(`Edit mentor page for mentor ${req.params.id}`);
}

function saveEditMentor(req, res) {
    console.log(req.body);
    res.send(`Saving an edit on mentor ${req.params.id}`);
}

function deleteMentor(req, res) {
    res.send(`Deleting mentor ${req.params.id}`);
}

function getMentor(req, res) {
    res.send(`Getting mentor ${req.params.id}`);
}

module.exports(getCreateMentorPage, saveNewMentor, getAllMentors, getEditMentor, saveEditMentor, deleteMentor, getMentor)
