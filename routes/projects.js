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

router.get('/details/:project_id', function(req, res){
  res.render('individualproject', {title:" | Project Page"})
})

router.get('/page/:project_id', function(req,res){
  connection.query('select * from (select u.username, u.user_id, m.admin_status, p.project_id, title,description from member_schema m inner join project_schema p on m.project_id=p.project_id inner join user_schema u on m.user_id=u.user_id) as t where t.admin_status=1 and t.project_id='+req.params.project_id, function(err, data){
    if(err) res.json({'error' : true, 'message' : err.message})
    else res.json({'error' : false, 'message' : "Project fetched successfully", data:data})
  })
})

router.get('/page/usersrequesting/:project_id', function(req,res){
  connection.query('select * from (select u.username, u.user_id, r.project_id, r.sender_status from request_schema r inner join user_schema u on r.user_id=u.user_id) as s where s.sender_status=0 and s.project_id='+req.params.project_id, function(err, data){
    if(err) res.json({'error' : true, 'message' : err.message})
    else res.json({'error' : false, 'message' : "Users fetched successfully", data:data})
  })
})

router.get('/getnotices/project/:project_id', function(req,res){
  var response = {}
  var project_id = req.params.project_id
  Project.getnotices(project_id, function(err, data){
    if(err) res.json({error : true, message : err.message})
    else res.json({error : false, message : "Notice fetch successful", data : data})
  })
})

// done
router.post('/create/:username', function(req, res){
  var response = {}
  var username = req.params.username
  var branch_id = 0
  var s = req.body.branchname
  if(s === "EEE") branch_id=1
  if(s === "CSE") branch_id=2
  if(s === "Mech") branch_id=3
  if(s === "Chem") branch_id=4
  Project.create_project(req.body, branch_id, username, function(err, projectid){
    if(err){
      response = {'error' : true, 'message' : err.message}
    }
    else {
      response = {'error' : false, 'message' : "Project created successfully."}
    }
    res.json(response)
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

router.post('/createnotice/user/:user_id/project/:project_id', function(req, res){
  var user_id = req.params.user_id
  var project_id = req.params.project_id
  var response = {}
  var code = 200
  var content = req.body.content
  Project.create_notice(content, user_id, project_id, function(err, data){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
        response = {'error' : false, 'message' : "notice creation successful.", "data" : data}
    }
    res.status(code).json(response)
  })
})

router.get('/page/otherusers/:project_id', function(req, res){
  var response = {}
  var project_id = req.params.project_id
  Project.otherusers(project_id, function(err, data){
    if(err) response = {error : true, message : err.message}
    else response = {error : false, message : 'Users fetched successfully.', 'data' : data}
    res.json(response)
  })
})
//delete project----PENDING

module.exports = router;