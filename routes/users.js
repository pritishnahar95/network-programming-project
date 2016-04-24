var express = require('express')
var router = express.Router()
var User = require('../models/user')
var Project = require('../models/project')

// get functions
router.get('/dashboard', function(req, res){
  res.render('dashboard', {title:" | Dashboard"})
})

router.get('/dashboard/userdetails', function(req, res){
  res.render('userdetails', {title:" | Dashboard - User Details"})
})

router.get('/dashboard/adminprojects', function(req, res){
  res.render('adminprojects', {title:" | Dashboard - Admin Projects"})
})

router.get('/dashboard/memberprojects', function(req, res){
  res.render('memberprojects', {title:" | Dashboard - Member Projects"})
})

router.get('/dashboard/requestsent', function(req, res){
  res.render('requestsent', {title:" | Dashboard - Requests Sent"})
})

router.get('/dashboard/projectinvites', function(req, res){
  res.render('projectinvites', {title:" | Dashboard - Project Invites"})
})

router.get('/dashboard/otherprojects', function(req, res){
  res.render('otherprojects', {title:" | Dashboard - Other Projects"})
})

router.get('/dashboard/createproject', function(req, res){
  res.render('createproject', {title:" | Dashboard - Create Project"})
})

//User accepts/rejects project invite
router.put('/acceptinvite/project/:projectid/:userid/:decision', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid = req.params.userid
  var decision = req.params.decision
  
  User.acceptinvite(projectid, userid, decision, function(err, user){
    if(err){
      code = 400
      response = {'error' : true , 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "action taken successfully"}
    }
    res.status(code).json(response)
  })  
})

// done
router.put('/sendrequest/:username/project/:projectpk', function(req,res){
  var response = {}
  var code = 200
  var projectpk = req.params.projectpk
  var username = req.params.username

  User.send_request(username, projectpk, function(err, data){
    if(err){
      code = 400
      response = {'error' : true , 'message' : err.message}
    }
    else{
      // bug
      response = {'error' : false, 'message' : "Request sent to admin successfully."}
    }
    res.status(code).json(response)
  })
})

// admin level projects
router.get('/getprojects/:username', function(req, res){
  var response = {}
  var username = req.params.username
  User.getprojects(username, function(err, projects){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : 'Projects fetched successfully', 'projects' : projects}
    }
    res.json(response)
  }) 
})

// member level projects
router.get('/getallprojects/:username', function(req, res){
  var response = {}
  var username = req.params.username
  User.getallprojects(username, function(err, projects){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : 'Projects fetched successfully', 'projects' : projects}
    }
    res.json(response)
  }) 
})

router.get('/otherprojects/:userid', function(req, res){
  var response = {}
  var code = 200
  var user_id = req.params.userid
  User.otherprojects(user_id, function(err, projects){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "Project fetched successfully.", 'projects' : projects}
    }
    res.status(code).json(response)
  })
})

router.get('/requestsent/:user_id', function(req, res){
  var response = {}
  var user_id = req.params.user_id
  User.requestsent(user_id, function(err, projects){
    if(err) response = {error : true, message : err.message}
    else response = {error : false, message : 'Projects fetched successfully.', 'projects' : projects}
    res.json(response)
  })
})

module.exports = router;
