const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');


router.get('/', (req, res) => {
	res.render('home', {
		username: req.cookies.user,
	});
	
});

router.post('/', (req, res) => {
	var username = req.body.username;
	var verdictList = [], contestList = [], tagList = [], tagCountList = [], langList = [], langCountList = [], c_ratings=[],c_ratingscount=[],p_ratings=[],p_ratingscount=[];
	function callback(){
		res.render('home', {
			username: req.cookies.user,
			search: true,
			problemVerdicts: verdictList,
			problemscount: contestList,
			tagList: tagList.toString().split(" ").join(""),
			tagCountList: tagCountList,
			langList: langList.toString().split(" ").join(""),
			langCountList: langCountList,
			c_ratingscount: c_ratingscount,
			c_ratings: c_ratings,
			p_ratingscount: p_ratingscount,
			p_ratings: p_ratings
		});
	}
	function callback2(){
		res.redirect('/');
	}
	request(`https://codeforces.com/api/user.status?handle=${username}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		else{
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
			verdictList = [ok, ce, re, wa, tle, me];

			var langMap = new Map();
			var language, cnt;
			for(var i = 0; i < submissions.length; i++)
			{
				language = submissions[i].programmingLanguage;
				if(langMap.has(language))
				{
					cnt = langMap.get(language);
					langMap.set(language, cnt + 1);
				}
				else{
					langMap.set(language, 1);
				}
			}

			for(const [key,value] of langMap.entries())
			{
				langList.push(key.split(" ").join("").replace('*','').toString());
				langCountList.push(value);
			}


			var tagMap = new Map();
			var tag, cnt;
			for(var i = 0; i < submissions.length; i++)
			{
				for(var j = 0; j < submissions[i].problem.tags.length; j++){
					tag = submissions[i].problem.tags[j];
					if(tagMap.has(tag))
					{
						cnt = tagMap.get(tag);
						tagMap.set(tag, cnt + 1);
					}
					else{
						tagMap.set(tag, 1);
					}
				}
			}

			for(const [key,value] of tagMap.entries())
			{
				tagList.push(key.split(" ").join("").replace('*','').toString());
				tagCountList.push(value);
			}

			contestList=[0,0,0,0,0,0,0,0,0];
			var mymap = new Map();
			for(var i = 0; i < submissions.length; i++)
			{
				if(submissions[i].author.participantType == "CONTESTANT" && submissions[i].verdict == "OK")
				{
					var contest_id=submissions[i].contestId;
					if(mymap.has(contest_id))
					{
						var a=mymap.get(contest_id);
						mymap.set(contest_id,a+1);
					}
					else 
						mymap.set(contest_id,1);
				}
			}
			for(const [key,value] of mymap.entries())
			{
				contestList[value]+=1;
			}
			var c_ratingsmap = new Map();
			var p_ratingsmap = new Map();
			for(var i=0;i<submissions.length;i++)
			{
				if(submissions[i].author.participantType=="CONTESTANT")
				{
					if(c_ratingsmap.has(submissions[i].problem.rating))
					{
						var a=c_ratingsmap.get(submissions[i].problem.rating);
						c_ratingsmap.set(submissions[i].problem.rating,a+1);
					}
						
					else 
					{
						c_ratingsmap.set(submissions[i].problem.rating,1);
					}
				}
				else 
				{
					if(p_ratingsmap.has(submissions[i].problem.rating))
					{
						var a=p_ratingsmap.get(submissions[i].problem.rating);
						p_ratingsmap.set(submissions[i].problem.rating,a+1);
					}
						
					else 
					{
						p_ratingsmap.set(submissions[i].problem.rating,1);
					}
				}
			}
			
			for(const [key,value] of c_ratingsmap.entries())
			{
				c_ratings.push(key);
				c_ratingscount.push(value);
			}
			for(const [key,value] of p_ratingsmap.entries())
			{
				p_ratings.push(key);
				p_ratingscount.push(value);
			}

			callback();
		}
		
	});
});

	

module.exports = router;
