const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');
var group = require('../models/group.js');
var user = require('../models/user.js'); 
var challenge = require('../models/challenge.js'); 
const { callbackPromise } = require('nodemailer/lib/shared');


router.get('/', (req, res) => {
    if(!req.cookies.user){
        res.redirect('/signin');
        return;
    }
    user.find({username:req.cookies.user}, (err, users) => {
        if(err){
            console.log(err);
        }
        else{
            var groups = users[0].groupIds;
            group.find({_id : {$in : groups}}, (err, grps) => {
                if(err){
                    console.log(err);
                }
                res.render('groups', {
                    username: req.cookies.user,
                    groupList: grps
                })
            });
            
        }
    });
});



router.post('/createGroup', (req, res) => {
    var newGroup = new group({
        name : req.body.groupName,
        users : [req.cookies.user]
    });
    
    newGroup.save((err, group) => {
        if(err){
         console.log("error");
        }
        user.updateOne({ username : req.cookies.user},{ $push: { groupIds:  group._id} }, (err, user) => {
            if(err){
                console.log(err);
            }
            res.redirect('/groups');
        });
    });
});

router.get('/invite/:id', (req, res) => {
    if(!req.cookies.user){
        res.redirect('/signin');
        return;
    }
    group.find({_id: req.params.id}, (err, groups) => {
        if(!groups || groups.length == 0){
            res.redirect('/groups');
            return;
        }
        if(groups[0].users.indexOf(req.cookies.user) != -1){
            res.redirect('/groups');
            return;
        }
        group.updateOne({_id: req.params.id}, { $push: { users: req.cookies.user}}, (err, grp) => {
            if(err){
                console.log(err);
            }
            user.updateOne({username: req.cookies.user}, { $push: { groupIds: groups[0]._id}}, (err, usr) => {
                res.redirect('/groups');
            });
        });
    });
});

router.get('/:id', (req, res) => {
    group.find({_id: req.params.id}, (err, groups) => {
        if(err){
            console.log(err);
        }
        else{
            challenge.find({groupId: req.params.id}, (err, challenges) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.render('group', {
                       username: req.cookies.user,
                       groupId: req.params.id,
                       groupName: groups[0].name,
                       challengeList: challenges
                    });
        
                }
            });
        }
    });
});

router.post('/:id/createNewChallenge', (req, res) => {
    var newChallenge = new challenge({
        groupId: req.params.id,
        challengeName : req.body.challengeName,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    });

    
    newChallenge.save((err, challenge) => {
        if(err){
         console.log("error");
        }
        res.redirect(`/groups/${req.params.id}`);
    });  
});

router.get('/:id/challenges/:challengeId', (req, res) => {
    var users, startDate, endDate, cnt = 0;
    var acList = [], pointsList = [];
    var leaderBoard = [];
    var acMap = new Map(), pointsMap = new Map();
    var challengeName;
    function callback(){
        cnt++;
        if(cnt == users.length){
            for(var i = 0; i < users.length; i++)
			{
				//acList.push(acMap.get(users[i]));
                //pointsList.push(pointsMap.get(users[i]));
                var entry = [];
                entry.push(users[i]);
                entry.push(acMap.get(users[i]));
                entry.push(pointsMap.get(users[i]));
                leaderBoard.push(entry);
			}
            leaderBoard.sort((a, b) => {return b[2] - a[2]});
            res.render('challenge', {
                username: req.cookies.user,
                challengeName: challengeName,
                leaderBoard: leaderBoard                
            });
        }
    }
    group.find({_id: req.params.id}, (err, groups) => {
        if(err){
            console.log(err);
        }
        else{
            users = groups[0].users;
            for(var i = 0; i < user.length; i++){
                acMap.set(users[i], 0);
                pointsMap.set(users[i], 0);
            }
            challenge.find({_id: req.params.challengeId}, (err, challenges) => {
                if(err){
                    console.log(err);
                }
                else{
                    challengeName = challenges[0].challengeName;
                    startDate = challenges[0].startDate;
                    endDate = challenges[0].endDate;
                    var i;
                    for(i = 0; i < users.length; i++){
                        request(`https://codeforces.com/api/user.status?handle=${users[i]}`, { json: true }, (err, res, body) => {
                            if(err || body.status == 'FAILED'){
                                console.log("error");
                            }
                            else{
                                var submissions = body.result;
                                var j, d, cnt;
                                for(j = 0; j < submissions.length; j++){
                                    d = new Date(submissions[j].creationTimeSeconds*1000);
                                    if(d >= startDate && d <= endDate){
                                        if(submissions[j].verdict == 'OK'){
                                            cnt =  acMap.get(submissions[j].author.members[0].handle);
                                            acMap.set(submissions[j].author.members[0].handle, cnt + 1);
                                            if(submissions[j].problem.rating){
                                                cnt =  pointsMap.get(submissions[j].author.members[0].handle);
                                                pointsMap.set(submissions[j].author.members[0].handle, cnt + submissions[j].problem.rating);
                                            }
                                        }
                                    }
                                    else{
                                        break;
                                    }
                                }
                            }
                            callback();
                        });
                    }
                }
            });
        }
    });

});




module.exports = router;
