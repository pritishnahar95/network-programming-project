var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Project = require('../models/project')

router.get('/', function(req, res){
	var code = 200
	var response = {}
	Project.find_all(function(err,projects){	
		if(err){
			code = 400
			response = {'error':true, 'Message':err.message} 
		}
		else{
			response = {'error':false, 'data':projects}
		}
		res.status(code).json(response)
	})
})


module.exports = router;