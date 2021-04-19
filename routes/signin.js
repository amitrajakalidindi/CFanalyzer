var express = require('express');
var router = express.Router();
var path = require('path');
var user = require('../models/user.js'); 

router.get('/', (req, res) => {
	res.render('signin', {
		username: req.cookies.user,
	});
})

router.post('/', (req, res) => {
	var email = req.body.siemail;
	var password = req.body.sipswd;
	var username;

	function callback(userExist){
		if(userExist){
			res.cookie('user', username);
        	res.redirect('/');
        }
        else{
        	res.render('signin',{
				username: req.cookies.user,
				loginFailed : true
			})
        }
	}
	user.find({ $and: [ {email:email}, {password:password}, {verified:true} ] }, (err, res) => {
	   	if(err){
	   		console.log(err);
	   	}
	   	else{
	   		if(res.length == 0){
	   			callback(false);
	   		}
	   		else{
	   			username = res[0].username;
	   			callback(true);
	   		}
	   	}
	});


});


module.exports = router;