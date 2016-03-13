var mongoose = require('mongoose')
var User = require('./user')

var project_schema = new mongoose.Schema({
	tags : [{type: String}],
	title : {type: String, unique : true},
	description : {type: String},
	admin : [{type : mongoose.Schema.Types.ObjectId, ref : 'User'}],
	members : [{type : mongoose.Schema.Types.ObjectId, ref : 'User'}],
	created_at : {type : Number},
	updated_at : {type : Number},
})

var Project = mongoose.model('Project', project_schema)
module.exports = mongoose.model('Project', project_schema)