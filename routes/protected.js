var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var Project = require('../models/project')

router.post('/:bitsid', function(req, res){
  var response = {}
  var code = 200
  var bitsid = req.params.bitsid

  Project.create_project(req.body, bitsid, function(err, project){
    if(err){
      if(err.code == 11000) {
        code = 400
        response = {'error' : true, 'message' : "Title already exists. Try again."}
      }
      else {
        code = 400
        response = {'error' : true, 'message' : err.message}
      }
    }
    else {
      response = {'error' : false, 'message' : "Project created successfully."}
    }
    res.status(code).json(response)
  })
})

module.exports = router;