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
	var contestList = [],c_ratingscount=[],p_ratingscount=[];
    var ContestList = [],C_ratingscount=[],P_ratingscount=[];
	var contestRatings = [], practiceRatings = [];
	var handle,rank,rating,maxrating,minrating,avgrating,maxrank,accuracy,avgAttempts,noOfProblemsSolved,noofcontests,bestRank,worstRank;
    var Handle,Rank,Rating,Maxrating,Minrating,Avgrating,Maxrank,Accuracy,AvgAttempts,NoOfProblemsSolved,Noofcontests,BestRank,WorstRank;
	var count=0;
	var c_ratingsmap = new Map();
	var p_ratingsmap = new Map();
	var C_ratingsmap = new Map();
	var P_ratingsmap = new Map();
	var contestRatingsMap = new Map();
	var practiceRatingsMap = new Map();
	function callback(){
		count+=1;
		if(count!=5)
			return;

		var contestarr = [];
		var entry;
		for(const [key,value] of c_ratingsmap.entries())
		{
			contestRatingsMap.set(key,true);
			if(C_ratingsmap.has(key))
			{
				entry = [key, value, C_ratingsmap.get(key)];
			}
			else{
				entry = [key, value, 0];
			}
			contestarr.push(entry);
		}

		for(const [key,value] of C_ratingsmap.entries())
		{
			if(contestRatingsMap.has(key)){
				continue;
			}
			contestRatingsMap.set(key,true);
			entry = [key, 0, value];
			contestarr.push(entry);
		}

		contestarr.sort((a, b) => {return a[0] - b[0]});

		var practicearr = [];
		for(const [key,value] of p_ratingsmap.entries())
		{
			practiceRatingsMap.set(key,true);
			if(P_ratingsmap.has(key))
			{
				entry = [key, value, P_ratingsmap.get(key)];
			}
			else{
				entry = [key, value, 0];
			}
			practicearr.push(entry);
		}

		for(const [key,value] of P_ratingsmap.entries())
		{
			if(practiceRatingsMap.has(key)){
				continue;
			}
			practiceRatingsMap.set(key,true);
			entry = [key, 0, value];
			practicearr.push(entry);
		}

		practicearr.sort((a, b) => {return a[0] - b[0]});

		for(var i = 0; i < contestarr.length; i++){
			contestRatings.push(contestarr[i][0]);
			c_ratingscount.push(contestarr[i][1]);
			C_ratingscount.push(contestarr[i][2]);
		}

		for(var i = 0; i < practicearr.length; i++){
			practiceRatings.push(practicearr[i][0]);
			p_ratingscount.push(practicearr[i][1]);
			P_ratingscount.push(practicearr[i][2]);
		}
		

		res.render('compare', {
			username: req.cookies.user,
			search: true,
			problemscount: contestList,
			Problemscount: ContestList,
			contestRatings: contestRatings,
			c_ratingscount: c_ratingscount,
			C_ratingscount: C_ratingscount,
			practiceRatings: practiceRatings,
			p_ratingscount: p_ratingscount,
			P_ratingscount: P_ratingscount,
			handle:handle,
			rank:rank,
			rating:rating,
			maxrating:maxrating,
			minrating:minrating,
			avgrating:avgrating,
			maxrank:maxrank,
			noofcontests:noofcontests,
			accuracy:accuracy,
			noOfProblemsSolved:noOfProblemsSolved,
			avgAttempts:avgAttempts,
			bestRank:bestRank,
			worstRank:worstRank,
            Handle:Handle,
			Rank:Rank,
			Rating:Rating,
			Maxrating:Maxrating,
			Minrating:Minrating,
			Avgrating:Avgrating,
			Maxrank:Maxrank,
			Noofcontests:Noofcontests,
			Accuracy:Accuracy,
			NoOfProblemsSolved:NoOfProblemsSolved,
			AvgAttempts:AvgAttempts,
			BestRank:BestRank,
			WorstRank:WorstRank
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
			var sumOfRatings = 0
			minrating = 5000;
			bestRank = 100000;
			worstRank = 0;
			noofcontests = contests.length;
			for(var i=0;i<contests.length;i++)
			{
				sumOfRatings += contests[i].newRating;
				if(contests[i].newRating < minrating){
					minrating = contests[i].newRating;
				}
				if(contests[i].rank < bestRank){
					bestRank = contests[i].rank;
				}
				if(contests[i].rank > worstRank){
					worstRank = contests[i].rank;
				}
			}
			avgrating = Math.round(sumOfRatings/noofcontests);

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
			var sumOfRatings = 0
			Minrating = 5000;
			BestRank = 100000;
			WorstRank = 0;
			Noofcontests = contests.length;
			for(var i=0;i<contests.length;i++)
			{
				sumOfRatings += contests[i].newRating;
				if(contests[i].newRating < Minrating){
					Minrating = contests[i].newRating;
				}
				if(contests[i].rank < BestRank){
					BestRank = contests[i].rank;
				}
				if(contests[i].rank > WorstRank){
					WorstRank = contests[i].rank;
				}
			}
			Avgrating = Math.round(sumOfRatings/Noofcontests);
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
			var ok = 0;
			var submissions = body.result;
			for(var i = 0; i < submissions.length; i++){
				if(submissions[i].verdict == 'OK'){
					ok++;
				}
			}
			noOfProblemsSolved = ok;
			accuracy = ((ok/submissions.length)*100).toFixed(1);
			avgAttempts = (submissions.length/ok).toFixed(1);

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
            callback();
		}
		
	});  
	
	//second users api call starts here

	request(`https://codeforces.com/api/user.status?handle=${handle2}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		else{
			var ok = 0;
			var submissions = body.result;
			for(var i = 0; i < submissions.length; i++){
				if(submissions[i].verdict == 'OK'){
					ok++;
				}
			}
			NoOfProblemsSolved = ok;
			Accuracy = ((ok/submissions.length)*100).toFixed(1);
			AvgAttempts = (submissions.length/ok).toFixed(1);

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

			for(var i=0;i<submissions.length;i++)
			{
				if(submissions[i].verdict!="OK" || submissions[i].problem.rating == undefined)
					continue;
				if(submissions[i].author.participantType=="CONTESTANT")
				{
					if(C_ratingsmap.has(submissions[i].problem.rating))
					{
						var a=C_ratingsmap.get(submissions[i].problem.rating);
						C_ratingsmap.set(submissions[i].problem.rating,a+1);
					}
						
					else 
					{
						C_ratingsmap.set(submissions[i].problem.rating,1);
					}
				}
				else 
				{
					if(P_ratingsmap.has(submissions[i].problem.rating))
					{
						var a=P_ratingsmap.get(submissions[i].problem.rating);
						P_ratingsmap.set(submissions[i].problem.rating,a+1);
					}
						
					else 
					{
						P_ratingsmap.set(submissions[i].problem.rating,1);
					}
				}
			}
			
            callback();
		}
		
	});  
});

	

module.exports = router;
