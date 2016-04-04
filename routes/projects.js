var express = require('express')
var router = express.Router()
var Project = require('../models/project')
var User = require('../models/user')
var connection = require('../config/db').connection;

// middleware
// router.use(function(req, res, next){
//   var username = req.params.username || req.body.username;
//   console.log(req.params)
//   console.log(req.body)
//   var query = 'SELECT * FROM user_schema where username=' + "'" + username +"'"
//   connection.query(query, function(err, user){
//     console.log(user)
//     if(err) res.status(400).json({error : true, message : 'Database connection error'})
//     else if(user.length == 0) res.status(400).json({error : true, message : 'User not found in database.'})
//     else next();
//   })
// })

// done
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

// done
router.put('/edit/:project_id/:username', function(req,res){
  var response = {}
  var code = 200
  var project_id = req.params.project_id
  var username = req.params.username
  var projectinfo = req.body
  
  Project.edit_project(projectinfo, project_id, username, function(err, project){
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

//Project admin invites user
// done
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

//accept user in project
router.put('/acceptrequest/project/:project_id/user/:user_id/admin/:admin_id/:decision', function(req,res){
  var response = {}
  var code = 200
  var project_id = req.params.project_id
  var user_id = req.params.user_id
  var decision = req.params.decision
  var admin_id = req.params.admin_id
  
  Project.accept_request(project_id, user_id, admin_id, decision, function(err,data){
    
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
        response = {'error' : false, 'message' : "Invite accepted.", "data" : data}
    }
        res.status(code).json(response)
  })
  
})

//delete project----PENDING

module.exports = router;