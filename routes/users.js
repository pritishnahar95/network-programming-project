var express = require('express');
var router = express.Router();
var User = require('../models/user')

router.post('/create', function(req, res){
  var response = {}
  var code = 200
  User.create_user(req.body, function(err, user){
    //console.log(req.body)
    if(err){
      code = 400
      if(err.code == 11000) response = {'error' : true, 'message' : "User already registered."}
      else response = {'error' : true, 'message' : err.message}
    }
    else{
      response = {'error' : false, 'message' : "User created successfully."}
    }
    res.status(code).json(response)
  })
})

module.exports = router;
