var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', (req, res) => {
	res.render('home', {
		username: req.cookies.user,
	});
})

module.exports = router;