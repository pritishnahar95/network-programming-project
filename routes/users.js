var express = require('express');
var router = express.Router();
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

// router.post('/confkey/:bitsid',function(req,res){
//   var response = {}
//   var code = 200
//   var bitsid = req.params.bitsid
//   //console.log(bitsid)
//   User.compare_conf_key(req.body, bitsid, function(err, conf){
//     if(err){
//       code = 400
//       response = {'error' : true, 'message' : "Your data deleted. Go to http://localhost/users/ to fill in your data."}
//     }
//     else{
//       response = {'error' : false, 'message' : "Your account activated."}
//     }
//   })
// })

module.exports = router;
