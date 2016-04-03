var express = require('express')
var router = express.Router()
var User = require('../models/user')
var Project = require('../models/project')
// Function to generate tokens.

//User accepts/rejects project invite
router.put('/acceptinvite/:projectid/:userid_invitedtuser/:decision', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid_invitedtuser = req.params.userid_invitedtuser
  var decision = req.params.decision
  
 // console.log(projectid)
  
  User.acceptinvite(projectid, userid_invitedtuser, decision, function(err, user){
    if(err){
      code = 400
      response = {'error' : true , 'message' : err.message}
    }
    else{
      Project.addmember(projectid, userid_invitedtuser, function(err, project){
        if(err){
          code = 400
          response = {'error' : true, 'message' : err.message}
        }
        else{
          response = {'error' : false, 'message' : "action taken successfully"}
        }
        res.status(code).json(response)
      })
    }
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
      response = {'error' : false, 'message' : "action taken successfully", "data" : data}
    }
    res.status(code).json(response)
  })
})

module.exports = router;
