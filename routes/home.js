const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');


router.get('/', (req, res) => {
	function callback(list){
		res.render('home', {
			username: req.cookies.user,
			accepted: list
		});
	}
	request('https://codeforces.com/api/user.status?handle=wrong_answer', { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		var ok = 0, ce = 0, re = 0, wa = 0, tle = 0, me = 0;
		var submissions = body.result;
		for(var i = 0; i < submissions.length; i++){
			if(submissions[i].verdict == 'OK'){
				ok++;
			}
			if(submissions[i].verdict == 'COMPILATION_ERROR'){
				ce++;
			}
			if(submissions[i].verdict == 'RUNTIME_ERROR'){
				re++;
			}
			if(submissions[i].verdict == 'WRONG_ANSWER'){
				wa++;
			}
			if(submissions[i].verdict == 'TIME_LIMIT_EXCEEDED'){
				tle++;
			}
			if(submissions[i].verdict == 'MEMORY_LIMIT_EXCEEDED'){
				me++;
			}
		}
		var list = [ok, ce, re, wa, tle, me];
		callback(list);
	});
})

module.exports = router;