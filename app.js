var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mySocketHelper = require('./utils/mysockethelper');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);
mySocketHelper.startSockets(io);
server.listen(8888);


app.use(session({
    secret: 'sfdsfsdfsdfsdbfbfdssss',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
