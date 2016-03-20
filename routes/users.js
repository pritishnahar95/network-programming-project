var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = require('../models/user')
var jwt = require('jsonwebtoken')

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
//////////////////////
router.put('/sendrequest/:projectid/:userid/', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid = req.params.userid

  var flag1 = User.is_member(userid, projectid)
  if(flag1 == 1){
    code = 400
    response = {'error':true, message:"Already a member"}
    res.status(code).json(response)    
  }
   else{
      User.sendrequest(userid, projectid, function(err,user){   //user.sendrequest
          if(err){
            code = 400
            response = {'error': true, 'message':err.message}     
          }
          else{ 
            var flag3 = Project.save_users_requesting(userid,projectid)   //project.save_users
            if(flag3 == 0){
              response = {'error':true, 'message':"Something went wrong"}
              res.status(code).json(response)       
            }
            else{
               response = {'error':false, 'message':"Request sent to project"}
               res.status(code).json(response)          
            }
          }  
        }) 
     }
  
})

module.exports = router;
