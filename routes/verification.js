var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var user = require('../models/user.js');

router.get('/:id', (req, res) => {
    user.updateOne({_id:req.params.id},{$set:{verified:true}},(err, user) => {
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/signin');
        }
    });

});
module.exports = router;