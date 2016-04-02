var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Project = require('../models/project')
var User = require('../models/user')

// add userid as admin in project's admin array.
// add projectid in user's admin status array.
// user's admin_status array has to be unique. not working
router.post('/create/:username', function(req, res){
  var response = {}
  var code = 200
  var username = req.params.username
  Project.create_project(req.body, username, function(err, projectid){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else {
      response = {'error' : false, 'message' : "Project created successfully."}
    }
    res.status(code).json(response)
  })
})


// check if user is the admin list of project.
// if yes - save the edited project else send error message.
// TODO - edit the names from projectlist of all members and admin list of users. - IMP
router.put('/edit/:projecttitle/:username', function(req,res){
  var response = {}
  var code = 200
  var projecttitle = req.params.projecttitle
  var username = req.params.username
  var projectinfo = req.body
  
  Project.edit_project(projectinfo, projecttitle, username, function(err, project){
      if(err){
        code = 400
        response = {'error': true, 'message':err.message}
      }
      else{
        response = {'error' : false, 'message' : "Project updated sucessfully."}
      }
      res.status(code).json(response)
  })
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
router.put('/inviteuser/:user_id/project/:project_id/admin/:admin_id', function(req,res){
  var response = {}
  var code = 200
  var project_id = req.params.project_id
  var admin_id = req.params.admin_id
  var user_id = req.params.user_id
    Project.send_invite(user_id, admin_id, project_id, function(err, data){
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