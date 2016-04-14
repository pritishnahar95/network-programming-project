var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken')
var routes = require('./routes/index');
var cors = require('cors');
var app = express();
var User  = require('./models/user')
var users = require('./routes/users');
var projects = require('./routes/projects');

// connection to database made
var connection = require('./config/db').connection

app.use(cors())


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use(function(req, res, next) {
  // console.log(res.cookie())
  // console.log()
  // check header or url parameters or post parameters for token
  console.log(req.headers.cookie)
  var token = req.headers.cookie.split("=")[1];
  console.log(token)
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, "qwerty", function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        var userid = jwt.decode(token)
        var query = 'SELECT * FROM user_schema where user_id=' +  userid
        connection.query(query, function(err, data){
          if(err) res.json({ success: false, message: 'Database connection error.'});
          else if(data.length == 0) res.json({ success: false, message: 'No user found.'});
          else next()
        }) 
      }
    });

  } else {
    
    // if there is no token
    // return an error
    return res.status(403).send({ 
        error: true, 
        message: 'No token provided.' 
    });
    
  }
});

// app.use(function(req, res, next){
//   var username = req.body.username || req.params.username || req.query.username
//   console.log(req.body)
//   console.log(req.params)
//   User.find({"username" : username}, function(err, user){
//     if(err) res.json({"message" : "Error in connection with database"})
//     else if(!user) res.json({"message" : "User not found."})
//     else next()
//   })
// })
app.use('/users', users);
app.use('/projects', projects);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
