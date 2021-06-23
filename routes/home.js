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
	var verdictList = [], verdictCountList = [], contestList = [], tagList = [], tagCountList = [], langList = [], langCountList = [], c_ratings=[],c_ratingscount=[],p_ratings=[],p_ratingscount=[];
	var handle,rank,rating,maxrating,maxrank,noofcontests=0;
	function callback(){
		//leaderBoard.sort((a, b) => {return b[2] - a[2]});
		res.render('home', {
			username: req.cookies.user,
			search: true,
			verdicts: verdictList,
			verdictsCount: verdictCountList,
			problemscount: contestList,
			tagList: tagList.toString().split(" ").join(""),
			tagCountList: tagCountList,
			langList: langList.toString().split(" ").join(""),
			langCountList: langCountList,
			c_ratingscount: c_ratingscount,
			c_ratings: c_ratings,
			p_ratingscount: p_ratingscount,
			p_ratings: p_ratings,
			handle:handle,
			rank:rank,
			rating:rating,
			maxrating:maxrating,
			maxrank:maxrank,
			noofcontests:noofcontests,
		});
	}
	function callback2(){
		console.log("User not found");
		res.redirect('/');
	}
	request(`https://codeforces.com/api/user.rating?handle=${username}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		else 
		{
			var contests=body.result;
			for(var i=0;i<contests.length;i++)
			{
				noofcontests+=1
			}
		}
	});
	request(`https://codeforces.com/api/user.info?handles=${username}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		else 
		{
			var data=body.result;
			data=data[0];
			rating=data.rating;
			rank=data.rank;
			handle=data.handle;
			maxrating=data.maxRating;
			maxrank=data.maxRank;
		}
	});
	request(`https://codeforces.com/api/user.info?handles=${username}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		else 
		{
			var data=body.result;
			data=data[0];
			rating=data.rating;
			rank=data.rank;
			handle=data.handle;
			maxrating=data.maxRating;
			maxrank=data.maxRank;
		}
	});
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
			verdictList = ["CompilationError", "WrongAnswer", "RuntimeError", "Accepted", "TimeLimitExceded", "MemoryLimitExceded"];
			verdictCountList = [ce, wa, re, ok, tle, me];

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
				if(submissions[i].verdict!="OK" || submissions[i].problem.rating == undefined)
					continue;
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
			
			var ratingsList = []
			for(const [key,value] of c_ratingsmap.entries())
			{
				var entry = [key, value];
				ratingsList.push(entry);
			}
			ratingsList.sort((a, b) => {return a[0] - b[0]});

			for(i = 0; i < ratingsList.length; i++){
				c_ratings.push(ratingsList[i][0]);
				c_ratingscount.push(ratingsList[i][1]);
			}

			ratingsList = []
			for(const [key,value] of p_ratingsmap.entries())
			{
				var entry = [key, value];
				ratingsList.push(entry);
			}

			ratingsList.sort((a, b) => {return a[0] - b[0]});

			for(i = 0; i < ratingsList.length; i++){
				p_ratings.push(ratingsList[i][0]);
				p_ratingscount.push(ratingsList[i][1]);
			}

			callback();
		}
		
	});
});

	

module.exports = router;
