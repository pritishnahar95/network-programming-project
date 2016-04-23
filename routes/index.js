var express = require('express')
var router = express.Router()
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
var get_token = function(userid){
	return jwt.sign(userid, "qwerty", {exp: "1440"})
}

// working
router.get('/', function(req, res) {
  res.render('index', {title:" | Landing"});
});

router.get('/login', function(req,res){
  res.render('login', {title:" | Login"})
})

router.get('/register', function(req,res){
  res.render('register', {title:" | Register"})
})

router.get('/about', function(req,res){
  res.render('about', {title:" | About"})
})

router.get('/confirmation/:userid', function(req,res){
  res.render('confirmation', {title:" | Confirmation"})
})

// Routes for /projects

//working
router.get('/projects', function(req, res){
	var response = {}
	Project.find_all(function(err, projects){	
		if(err){
			response = {error:true, title: " | Projects", message:err.message} 
		}
		else{
			response = {error:false, title: " | Projects", message:projects}
		}
		res.render('projects', response)
	})
})

router.get('/projects/:branch/', function(req, res){
	var response = {}
  var branch = req.params.branch
	Project.find_project_branch(branch, function(err,projects){	
		if(err){
			response = {'error':true, title: " | Projects", 'message':err.message} 
		}
		else{
			response = {'error':false, title: " | Projects - " + branch, 'message':projects}
		}
    console.log(response)
		res.render('projects', response)
	})
}) 

router.get('/projects/:branch/:tag', function(req, res){
	var code = 200
	var response = {}
	var branch = req.params.branch
	var tag = req.params.tag
  
	Project.find_project_branch_tag(branch, tag, function(err,projects){	
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

// Routes for /users

router.post('/users/register', function(req, res){
  var response = {}
  User.create_user(req.body, function(err, userid){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "User created successfully. Confirmation key sent to your bitsmail", data: userid}
    }
    res.json(response)
  })
})

// working
// TODO - active flag to be included in db
router.post('/users/confirmation/:userid', function(req, res){
  var response = {}
  var userid = req.params.userid
  var conf_key = req.body.conf_key
  User.compare_conf_key(conf_key, userid, function(err, user){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else{
      var token = get_token(userid)
      // generate token and send in the response
      response = {'error' : false, 'message' : "Your account activated.", "token" : token, "user" : user}
    }
    res.json(response)
  })
})

// working
router.post('/users/login', function(req, res){
  var response = {}
  User.login(req.body, function(err, user){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else{
      var token = get_token(user[0].user_id)
      response = {'error' : false, 'message' : "User login successful.", "token" : token, "user" : user[0]}
    }
    res.json(response)
  })
})

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
