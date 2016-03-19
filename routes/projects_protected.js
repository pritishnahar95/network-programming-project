var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var Project = require('../models/project')

router.post('/:userid', function(req, res){
  var response = {}
  var code = 200
  var userid = req.params.userid

  Project.create_project(req.body, userid, function(err, projectid){
    if(err){
      code = 400
      if(err.code == 11000) {
        response = {'error' : true, 'message' : "Title already exists. Try again."}
      }
      else {
        response = {'error' : true, 'message' : err.message}
      }
    }
    else {
      User.save_admin_status(userid, projectid)
      response = {'error' : false, 'message' : "Project created successfully."}
    }
    res.status(code).json(response)
  })
})

router.put('/edit/:projectid/:userid', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid = req.params.userid
  var projectinfo = req.body
  
  var flag = User.is_admin(userid, projectid)
  if(!flag){
    code = 400
    response = {'error': true, 'message': "access denied"}
    res.status(code).json(response)
  }
  
  else{
      Project.edit_project(projectinfo,projectid,userid, function(err,project){
      if(err){
        code = 400
        response = {'error': true, 'message':err.message}
      }
      else{
        response = {'error':false, 'message' : "Project updated closely"}
      }
      res.status(code).json(response)
    })
    
  }

})
  
router.put('/addmember/:projectid/admin/:userid_admin/request/:userid_requestuser', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid_admin = req.params.userid_admin
  var userid_requestuser = req.params.userid_requestuser
  
  Project.addmember(projectid, userid_admin, userid_requestuser, function(err,project){
    if(err){
      code = 400
      response = {'error': true, 'message':err.message}     
    }
    else{
      response = {'error':false, 'message':"New Member added to project"}
    }
    res.status(code).json(response)
  })
})

//Project admin invites user
router.put('/inviteuser/:projectid/admin/:userid_admin/invite/:userid_inviteduser', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid_admin = req.params.userid_admin
  var userid_inviteduser = req.params.userid_inviteduser
  
  var flag2 = User.is_admin(userid_admin, projectid)
  if(flag2 == 0){
    code = 400
    response = {'error':true, message:"You dont have access to send invites"}
    res.status(code).json(response)
  }
  else{
    var flag1 = User.is_member(projectid,userid_inviteduser)
    if(flag1 == 0){
      code = 400
      response = {'error':true, message:"Already a member"}
      res.status(code).json(response)    
    }
    else{
      Project.invitemember(projectid,userid_admin,userid_inviteduser, function(err,project){
          if(err){
            code = 400
            response = {'error': true, 'message':err.message}     
          }
          else{
            
            var flag3 = User.save_incoming_project_invites(userid_inviteduser,projectid)
            if(flag3 == 0){
              response = {'error':true, 'message':"Something went wrong"}
              res.status(code).json(response)       
            }
            else{
               response = {'error':false, 'message':"Invite sent to member"}
               res.status(code).json(response)          
            }
          }  
        }) 
     }
  }
})



/////////////////////////////////////////////////////////
//accept user in project
router.put('/acceptrequest/:projectid/:userid/:checkerid/:decision', function(req,res){
  var response = {}
  var code = 200
  var projectid = req.params.projectid
  var userid = req.params.userid
  var decision = req.params.decision
  var checkerid = req.params.checkerid
  
 // console.log(projectid)
  
  Project.is_admin(projectid, checkerid , function(err, project){
    if(err){
      code = 400
      response = {'error' : true , 'message' : err.message}
      res.status(code).json(response)
    }
    else{
      //console.log("test")
      Project.acceptrequest(projectid, userid, decision, function(err,project){
          if(err){
            code = 400
            response = {'error' : true , 'message' : err.message}
            res.status(code).json(response)
          }
          else{
            User.addprojectmembership(userid, projectid,  function(err, user){       //user.addproject
            if(err){
                code = 400
                response = {'error' : true, 'message' : err.message}
                res.status(code).json(response)
              }
              else{
                response = {'error' : false, 'message' : "action taken successfully"}
                res.status(code).json(response)
              }
            })
          }   
      })
    }
  })
})

//delete project----PENDING


module.exports = router;


