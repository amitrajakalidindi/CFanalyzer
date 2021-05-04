const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');

router.get('/', (req, res) => {
	var username = req.cookies.user;
    if(!username){
        res.redirect('/signin');
        return;
    }
    var unsolved_tags=[],suggested_problems=[],unsolved=[];
    var rating;
	function callback(){
        suggested_problems.sort(function(a,b){return a[4]-b[4]});
		res.render('suggestions', {
			username: req.cookies.user,
            suggested_problems:suggested_problems,
            unsolved:unsolved
		});
	}
	function callback2(){
		res.redirect('/');
	}
    var fcount=0;
    function get_problems()
    {
        fcount+=1;
        if(fcount<2)
            return;
        var tag1=unsolved_tags[0][1],tag2=unsolved_tags[1][1];
        request(`https://codeforces.com/api/problemset.problems?tags=${tag1};${tag2}`, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            if(body.status == "FAILED"){
                callback2();
            }
            problems=body.result.problems;
            var count=0;
 
            for(var i=0;i<problems.length;i++)
            {
                if(Number(problems[i].rating)>=Number(rating) && Number(problems[i].rating)<=Number(rating)+200)
                {
                    suggested_problems.push(["https://codeforces.com/contest/"+problems[i].contestId+"/problem/"+problems[i].index,problems[i].name,problems[i].contestId,problems[i].index,problems[i].rating]);
                    count+=1;
                    if(count==5)
                        break;
                }
            }
            callback();
            //console.log(suggested_problems);
          
         });
    }

	request(`https://codeforces.com/api/user.status?handle=${username}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
		var submissions = body.result;
        var problemid = new Map();
        var tags = new Map();
        var issolved = new Map();
        for(var i=0;i<submissions.length;i++)
        {
            if(submissions[i].verdict=="ACCEPTED")
            {
                var pid=submissions[i].contestId+submissions[i].problem.index;
                issolved.set(pid,true);
            }
            if(submissions[i].author.participantTyep=="PRACTICE")
                continue;
            if(submissions[i].verdict=="ACCEPTED")
            {
                var pid=submissions[i].contestId+submissions[i].problem.index;
                problemid.set(pid,true);
                continue;
            }
            var pid=submissions[i].contestId+submissions[i].problem.index;
            if(problemid.has(pid))
                continue;
            problemid.set(pid,true);
            ptags=submissions[i].problem.tags;
            for(var j=0;j<ptags.length;j++)
            {
                if(tags.has(ptags[j]))
                {
                    var count=tags.get(ptags[j]);
                    tags.set(ptags[j],count+1);
                }
                else 
                {
                    tags.set(ptags[j],1);
                }
            }
        }
        var found = new Map();
        //console.log(submissions[0]);
        for(var i=0;i<submissions.length;i++)
        {
            var pid=submissions[i].contestId+submissions[i].problem.index;
            if(issolved.has(pid))
                continue;
            if(submissions[i].author.participantType=="PRACTICE")
                continue;
            if(submissions[i].verdict=="OK")
                found.set(pid,true);
            if(submissions[i].verdict!="OK")
            {
                
                if(!found.has(pid))
                {
                    found.set(pid,true);
                    problem=submissions[i].problem;
                    unsolved.push(["https://codeforces.com/contest/"+problem.contestId+"/problem/"+problem.index,problem.name,problem.contestId,problem.index,problem.rating]);

                }
            }
        }

        for(const [key,value] of tags.entries())
        {
            unsolved_tags.push([Number(value),key]);
        }
       
        unsolved_tags.sort(function(a,b){return b[0]-a[0]});
        //console.log(unsolved_tags);
        get_problems();

	});
    request(`https://codeforces.com/api/user.info?handles=${username}`, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		if(body.status == "FAILED"){
			callback2();
		}
        else 
        {
            rating=body.result[0].rating;
            get_problems();
        }
    });

  
       
       
  
   

   
});
module.exports = router;