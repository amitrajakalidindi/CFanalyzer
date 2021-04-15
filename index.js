const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var home = require('./routes/home.js');
var signin = require('./routes/signin.js');
var signup = require('./routes/signup.js');
var signout = require('./routes/signout.js');
var compare = require('./routes/compare.js');

var app = express();

app.set('view engine', 'pug');
app.set('views','./views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'ssshhhhh'}));

app.use('/', home);
app.use('/signin', signin);
app.use('/signup', signup);
app.use('/signout', signout);
app.use('/compare',compare);

app.listen(process.env.PORT || 3000);