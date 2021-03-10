var express = require('express');
var router = express.Router();
var path = require('path');
var user = require('../models/user.js');

router.get('/', (req, res) => {
	res.render('signup', {
		username: req.cookies.user,
	});
});

router.post('/', (req, res) => {
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.pswd;

    function callback(emailExist, usernameExist){
        if(emailExist){
            res.render('signup', {
                username: req.cookies.user,
                emailExist : true,
                usernameExist: false
            });
        }
        else if(usernameExist){
            res.render('signup', {
                username: req.cookies.user,
                emailExist : false,
                usernameExist: true
            });
        }
        else{
            var newUser = new user({
                name : name,
                username: username,
                email: email,
                password: password
            });
            
            newUser.save((err, user) => {
                if(err){
                 console.log("error");
                }
                else{
                    res.cookie('user', username);
                    res.redirect('/');
                }
            });
        }
    }

    user.find({email:email}, (err, res) => {
        if(err){
            console.log(err);
        }
        else{
            if(res.length != 0){
                callback(true, false);
            }
            else{
                user.find({username:username}, (err, res) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(res.length != 0){
                            callback(false, true);
                        }
                        else{
                            callback(false, false);
                        }
                    }
                });
            }
        }
    });


});

module.exports = router;