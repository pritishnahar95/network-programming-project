var mongoose = require('mongoose')
var User = require('./user')
var moment = require('moment')

var project_schema = new mongoose.Schema({
	tags : [{type: String}],
	title : {type: String, unique : true},
	description : {type: String},
	admin : [{type : mongoose.Schema.Types.ObjectId, ref : 'User'}],
	members : [{type : mongoose.Schema.Types.ObjectId, ref : 'User'}],
	created_at : {type : Number},
	updated_at : {type : Number},
})

project_schema.statics.find_all = function(callback){
	Project.find(function(err,projects){
		if(err){
			return callback(err,null)
		}
		else if(!projects){
			return callback(new Error("No projects found"),null)
		}
		else{
			return callback(null, projects)
		}
	})
}

project_schema.statics.create_project = function(project_info, bitsid, callback){
	var new_project = new Project({
		tags : project_info.tags,
		title : project_info.title,
		description : project_info.description,
		admin : [],
		members : [],
		created_at : moment().unix(),
		updated_at : moment().unix()
	})
	
	new_project.save(function(err, project){
		if(err){
			callback(err, null)
			return
		}
		else if(project){
			callback(null, project)
			return
		}
	})
};


var Project = mongoose.model('Project', project_schema)
module.exports = mongoose.model('Project', project_schema)