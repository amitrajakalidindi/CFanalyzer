const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');


router.get('/', (req, res) => {
	res.render('compare', {
		username: req.cookies.user,
	});
	
});

router.post('/', (req, res) => {
	var handle1 = req.body.handle1;
    var handle2=req.body.handle2;
	var verdictList = [], contestList = [], tagList = [], tagCountList = [], langList = [], langCountList = [], c_ratings=[],c_ratingscount=[],p_ratings=[],p_ratingscount=[];
    var vverdictList = [], ContestList = [], TagList = [], TagCountList = [], LangList = [], LangCountList = [], C_ratings=[],C_ratingscount=[],P_ratings=[],P_ratingscount=[];
	var handle,rank,rating,maxrating,maxrank,noofcontests=0;
    var Handle,Rank,Rating,Maxrating,Maxrank,Noofcontests=0;
	var count=0;
	function callback(){
		count+=1;
		if(count!=5)
			return;
		res.render('compare', {
			username: req.cookies.user,
			search: true,
			problemVerdicts: verdictList,
        	vverdictList: vverdictList,
			problemscount: contestList,
			Problemscount: ContestList,
			tagList: tagList.toString().split(" ").join(""),
			TagList: TagList.toString().split(" ").join(""),
			tagCountList: tagCountList,
			TagCountList: TagCountList,
			langList: langList.toString().split(" ").join(""),
			LangList: LangList.toString().split(" ").join(""),
			langCountList: langCountList,
			LangCountList: LangCountList,
			c_ratingscount: c_ratingscount,
			C_ratingscount: C_ratingscount,
			c_ratings: c_ratings,
			C_ratings: C_ratings,
			p_ratingscount: p_ratingscount,
			P_ratingscount: P_ratingscount,
			p_ratings: p_ratings,
			P_ratings: P_ratings,
			handle:handle,
			rank:rank,
			rating:rating,
			maxrating:maxrating,
			maxrank:maxrank,
			noofcontests:noofcontests,
            Handle:Handle,
			Rank:Rank,
			Rating:Rating,
			Maxrating:Maxrating,
			Maxrank:Maxrank,
			Noofcontests:Noofcontests,
		});
	}
	function callback2(){
		res.redirect('/compare');
	}
    //finding no of contests for both users
	request(`https://codeforces.com/api/user.rating?handle=${handle1}`, { json: true }, (err, res, body) => {
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
			callback();
		}
	});
    request(`https://codeforces.com/api/user.rating?handle=${handle2}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		else 
		{
			var contests=body.result;
            //console.log(contests);
			for(var i=0;i<contests.length;i++)
			{
				Noofcontests+=1
			}
			callback();
		}
	});
    //finding user details
	request(`https://codeforces.com/api/user.info?handles=${handle1};${handle2}`, { json: true }, (err, res, body) => {
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

			data=body.result;
			data=data[1];
			Rating=data.rating;
			Rank=data.rank;
			Handle=data.handle;
			Maxrating=data.maxRating;
			Maxrank=data.maxRank;
			callback();
		}
		
	});

    //first users starts here
	request(`https://codeforces.com/api/user.status?handle=${handle1}`, { json: true }, (err, res, body) => {
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
				if(submissions[i].verdict!="OK")
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
	
	//second users api call starts here
	//second user
	//second user

	request(`https://codeforces.com/api/user.status?handle=${handle2}`, { json: true }, (err, res, body) => {
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
			vverdictList = [ok, ce, re, wa, tle, me];

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
				LangList.push(key.split(" ").join("").replace('*','').toString());
				LangCountList.push(value);
			}
			console.log(LangList);

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
				TagList.push(key.split(" ").join("").replace('*','').toString());
				TagCountList.push(value);
			}

			ContestList=[0,0,0,0,0,0,0,0,0];
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
				ContestList[value]+=1;
			}
			console.log(ContestList);
			var c_ratingsmap = new Map();
			var p_ratingsmap = new Map();
			for(var i=0;i<submissions.length;i++)
			{
				if(submissions[i].verdict!="OK")
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
			
			for(const [key,value] of c_ratingsmap.entries())
			{
				C_ratings.push(key);
				C_ratingscount.push(value);
			}
			for(const [key,value] of p_ratingsmap.entries())
			{
				P_ratings.push(key);
				P_ratingscount.push(value);
			}
            callback();
		}
		
	});  
});

	

module.exports = router;
