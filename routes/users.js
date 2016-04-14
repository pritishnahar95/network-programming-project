var express = require('express')
var router = express.Router()
var User = require('../models/user')
var Project = require('../models/project')

// get functions
router.get('/dashboard', function(req, res){
  res.render('dashboard', {title:" | Dashboard"})
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

router.get('/getprojects/:username', function(req, res){
  var response = {}
  var code = 200
  var username = req.params.username
  User.getprojects(username, function(err, projects){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : 'Projects fetched successfully', 'projects' : projects}
    }
    res.status(code).json(response)
  }) 
})

module.exports = router;
