var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = require('../models/user')

router.post('/', function(req, res){
  var response = {}
  var code = 200
  User.create_user(req.body, function(err, user){
    if(err){
      if(err.code == 11000) {
        code = 11000
        response = {'error' : true, 'message' : "User already registered."}
      }
      else {
        console.log(err)
        code = 400
        response = {'error' : true, 'message' : err.message}
      }
    }
    else{
      response = {'error' : false, 'message' : "User created successfully."}
    }
    res.status(code).json(response)
  })
})

router.post('/confkey/:bitsid',function(req,res){
  var response = {}
  var code = 200
  var bitsid = req.params.bitsid
  User.compare_conf_key(req.body, bitsid, function(err, user){
    if(err){
      code = 400
      response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "Your account activated."}
    }
    res.status(code).json(response)
  })
})

module.exports = router;
