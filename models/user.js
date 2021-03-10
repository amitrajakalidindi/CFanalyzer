const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://mydb:amit955raja@cluster0.gwlqy.mongodb.net/mydb?retryWrites=true&w=majority');

var userSchema = mongoose.Schema({
	name: String,
   	username: String,
   	email: String,
   	password: String
});
var user = mongoose.model("user", userSchema);

module.exports = user;