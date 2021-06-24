var express = require('express');
var router = express.Router();
var path = require('path');
var nodemailer = require('nodemailer');
var request = require('request');
var user = require('../models/user.js');

router.get('/', (req, res) => {
	res.render('signup', {
		username: req.cookies.user,
	});
});

router.post('/', (req, res) => {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.pswd;

    function callback(emailExist, usernameExist, cfUserDoesntExist){
        if(emailExist){
            res.render('signup', {
                username: req.cookies.user,
                emailExist : true,
                usernameExist: false,
                cfUserDoesntExist: false,
                errusername: username,
                erremail: email
            });
        }
        else if(usernameExist){
            res.render('signup', {
                username: req.cookies.user,
                emailExist : false,
                usernameExist: true,
                cfUserDoesntExist: false,
                errusername: username,
                erremail: email
            });
        }
        else if(cfUserDoesntExist){
            res.render('signup', {
                username: req.cookies.user,
                emailExist: false,
                usernameExist: false,
                cfUserDoesntExist: true,
                errusername: username,
                erremail: email
            })
        }
        else{
            var newUser = new user({
                username: username,
                email: email,
                password: password,
                verified: false,
                groupIds: []
            });
            
            newUser.save((err, user) => {
                if(err){
                 console.log("error");
                }
                else{
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'cfanalyzer1@gmail.com',
                            pass: '*******'
                        }
                    });
        
                    var mailOptions = {
                        from: 'cfanalyzer1@gmail.com',
                        to: `${email}`,
                        subject: 'Account Verification for CFanalyser',
                        text: `Open link in browser to verify your account : http://localhost:3000/userVerification/${user._id} `
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        }
                        else{
                            res.render('verificationMessage', {
                                username: req.cookies.user,
                            });
                        }
                    });
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
                callback(true, false, false);
            }
            else{
                user.find({username:username}, (err, res) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(res.length != 0){
                            callback(false, true, false);
                        }
                        else{
                            request(`https://codeforces.com/api/user.info?handles=${username}`, { json: true }, (err, res, body) => {
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    if(body.status == "FAILED"){
                                        callback(false, false, true);
                                    }
                                    else{
                                        callback(false, false, false);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });


});

module.exports = router;