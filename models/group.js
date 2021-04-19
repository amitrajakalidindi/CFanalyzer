const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://mydb:amit955raja@cluster0.gwlqy.mongodb.net/mydb?retryWrites=true&w=majority');

var groupSchema = mongoose.Schema({
	name: String,
   	users: [],
});
var group = mongoose.model("group", groupSchema);

module.exports = group;