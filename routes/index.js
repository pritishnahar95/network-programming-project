var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Project = require('../models/project')
var User = require('../models/user')
var jwt = require('jsonwebtoken')

// All unprotected routes for users and projects schema will be written here. 
/*
  Unprotected routes:
    GET /
    GET /projects
    GET /projects/:branch
    GET /projects/:branch/:tag
    POST /users/register
    POST /users/confirmation/:bitsid
    POST /users/login
    POST /users/forgotpassword
*/


// Utility function for creating jwt tokens
var get_token = function(username){
	return jwt.sign(username, "qwerty", {expiresIn: 1440})
}

// working
router.get('/', function(req, res, next) {
  res.json({'message' : "Welcome to ProShare."});
});

// Routes for /projects

//wokrking
router.get('/projects', function(req, res){
	var code = 200
	var response = {}
	Project.find_all(function(err,projects){	
		if(err){
			code = 400
			response = {'error':true, 'message':err.message} 
		}
		else{
			response = {'error':false, 'data':projects}
		}
		res.status(code).json(response)
	})
})

router.get('/projects/:branch/', function(req, res){
	var code = 200
	var response = {}
  var branch = req.params.branch
  Project.find({"branch" : branch}, function(err, project){
    if (err) {
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    
    else if(project.length == 0){
      code = 400
      response = {'error' : true, 'message' : "No projects found corresponding to query branch."}
    }
    else{
      response = {'error' : false, 'messgae' : 'Projects fetched successfully.', 'data' : project}
    }
    res.status(code).json(response)
  })
}) 

router.get('/projects/:branch/:tag', function(req, res){
	var code = 200
	var response = {}
	var branch = req.params.branch
	var tag = req.params.tag
  
  //{ $and: [ { <expression1> }, { <expression2> } , ... , { <expressionN> } ] }
  Project.find({"branch":branch},{"tag":tag}, function(err, project){
    if (err) {
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else if(project.length == 0){
      code = 400
      response = {'error' : true, 'message' : "No projects found corresponding to query branch and tag."}
    }
    else{
      // only project's objectid going as response.
      response = {'error' : false, 'messgae' : 'Projects fetched successfully.', 'data' : project}
    }
    res.status(code).json(response)
  })
})

// Routes for /users

router.post('/users/register', function(req, res){
  var response = {}
  var code = 200
  User.create_user(req.body, function(err, userid){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "User created successfully.", "userId" : userid}
    }
    res.status(code).json(response)
  })
})

// working
// TODO - active flag to be included in db
router.post('/users/confirmation/:username', function(req, res){
  var response = {}
  var code = 200
  var username = req.params.username
  var conf_key = req.body.conf_key
  User.compare_conf_key(conf_key, username, function(err, user){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      var token = get_token(username)
      // generate token and send in the response
      response = {'error' : false, 'message' : "Your account activated.", "token" : token}
    }
    res.status(code).json(response)
  })
})

// working
router.post('/users/login', function(req, res){
  var response = {}
  var code = 200
  User.login(req.body, function(err, user){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      var token = get_token(req.body.username)
      response = {'error' : false, 'message' : "User login successful.", "token" : token}
    }
    res.status(code).json(response)
  })
})

// doubt
router.put('/users/forgotpassword/:username', function(req, res){
  var response = {}
  var code = 200
  User.forgot_password(req.params.username, function(err, user){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "New password mailed."}
    }
    res.status(code).json(response)
  })
})

module.exports = router;
