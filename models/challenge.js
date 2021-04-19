const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://mydb:amit955raja@cluster0.gwlqy.mongodb.net/mydb?retryWrites=true&w=majority');

var challengeSchema = mongoose.Schema({
	groupId: String,
    challengeName: String,
    startDate: Date,
    endDate: Date
});
var challenge = mongoose.model("challenge", challengeSchema);

module.exports = challenge;