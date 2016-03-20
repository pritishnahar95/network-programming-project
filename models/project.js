var mongoose = require('mongoose')
var User = require('./user')
var moment = require('moment')
mongoose.Promise = require('bluebird')

var project_schema = new mongoose.Schema({
	// _id = title
	_id : {type: String, unique : true},
	description : {type: String},
	admin : [{type : String, ref : 'User',unique : true}],
	members : [{type : String, ref : 'User',unique : true}],
	
	tags : [{type: String}],
	branch : [{type : String}],
	
	// object ids of users who have not accepted the request to join the project
	users_invited : [{type : mongoose.Schema.Types.ObjectId, ref : 'User',unique : true}],
	users_requesting : [{type : mongoose.Schema.Types.ObjectId, ref : 'User' , unique : true}, ],
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

project_schema.statics.create_project = function(project_info, userid, callback){
	User.save_admin_status(userid, project_info.title, function(err, user){
		if(err) callback(err, null)
		else{
			var new_project = new Project({
				tags : project_info.tags,
				branch :project_info.branch,
				_id : project_info.title,
				description : project_info.description,
				//members : [],
				created_at : moment().unix(),
				updated_at : moment().unix()
			})
			new_project.admin.push(userid)
			// discuss
			//new_project.members.push(userid)
			var promise = new_project.save()
			promise.then(function(user){
				if(!new_project) throw new Error("Error in saving username in project database.")
				callback(null, new_project)
			})
			.catch(function(err){
				callback(err, null)
			})	
		}
	})
};

// we cannont edit _id field of mongo
// so create new project everytime
// and remove old one
project_schema.statics.edit_project = function(projectinfo, projectid, userid, callback){
	Project.findOne({"_id":projectid}, function(err, project){
		if(err){
			callback(new Error("Database connection error."),null)
		}
		else if(!project){
			callback(new Error("No project in database"),null)
		}
		else{
			var flag = false
			for(var i=0 ; i<project.admin.length ; i++){
				if(userid == project.admin[i]){
					flag = true
					break
				}
			}
			if(flag){
				var new_project = new Project({
					tags : project.tags,
					branch :project.branch,
					_id : projectinfo.title,
					description : projectinfo.description,
					//members : [],
					admin : project.admin,
					members : project.member,
					users_invited : project.users_invited,
					users_requesting : project.users_requesting,
					created_at : project.created_at,
					updated_at : project.updated_at
				})
				
				// remove project 
				
				Project.remove({ "_id": projectid }, function(err) {
					if (err) {
						callback(err, null)
					}
					else{
						//save inside callback \m/
						var promise = new_project.save()
						promise.then(function(user){
							if(!new_project) throw new Error("Error in updating project database.")
							callback(null, new_project)
						})
						.catch(function(err){
							callback(err, null)
						})
					}
				});							
			}
			else{
				callback(new Error("No access to edit the project"), null)
			}				
		}
	})
};


// admin will invite other users
project_schema.statics.invitemember = function(projectid, bitsid_admin, bitsid_requestuser, callback){
	// add request user to projects pending_request array
	Project.findOne({"_id" : projectid}, function(err, project){
		if(err){
			callback(new Error("Database connection error"), null)
		}
		else if(!project){
			callback(new Error("Project not found in db"), null)
		}
		else{
			project.users_invited.push(bitsid_requestuser)
			project.save(function(err,project){
				if(err){
					callback(err,null)
					return
				}
				else if(project){
					callback(null,project)
					return
				}
			})				
		}
	})
}

project_schema.statics.addmember = function(projectid, userid, callback){
	// add request user to projects pending_request array
	Project.findOne({"_id" : projectid}, function(err, project){
		if(err){
			callback(new Error("error in connection"), null)
		}
		else if(!project){
			callback(new Error("Project not found in db"), null)
		}
		else{
			var ind = project.users_invited.indexOf(userid)
			project.users_invited.splice(ind, 1)
			project.members.push(userid)
			project.save(function(err,project){
				if(err){
					callback(new Error("Error in saving"), null)
				}
				else if(project){
					callback(null, project)
				}
			})				
		}
	})
}

project_schema.statics.save_users_requesting = function(userid, projectid){
	Project.findOne({"_id" : projectid}, function(err, project){
		if(err) {
			console.log("Error in db")
			return 0
		}
		else if(!project) {
			console.log("user not found")
			return 0
		}
		else{
			project.users_requesting.push(userid)
			project.save(function(err, project){
				if(err){
					console.log("error in saving")
					return 0
				}
				else if(project){
					return 1
				}
			});
		}
	})
}

project_schema.statics.is_admin = function(projectid, userid ,callback){
	Project.findOne({"_id" : projectid}, function(err, project){
		if(err) {
			callback(new Error("Error in db"), null)
		}
		else if(!project) {
			callback(new Error("project not found"), null)
		}
		else{
			for(var i=0 ; i<project.admin.length ; i++){
				if(userid == project.admin[i]) {
					callback(null, project)
					return
				}
			}
			callback(new Error("No access"), null)
		}
	})
}


project_schema.statics.acceptrequest = function(projectid, userid, decision, callback){
	Project.findOne({"_id" : projectid}, function(err,project){
		if(err){
			callback(new Error("Error in db"), null)
		}
		else if(!project){
			callback(new Error("project not found in invite function"), null)
		}
		else{
			var ind = project.users_requesting.indexOf(userid)
			project.users_requesting.splice(ind, 1)
			if(decision == 1){
				project.members.push(userid)
				project.save(function(err, project){
					if(err){
						callback(new Error("error in saving"), null)
					}
					else{
						callback(null, project)
					}
				});
			}
		}
	})
}

var Project = mongoose.model('Project', project_schema)
module.exports = mongoose.model('Project', project_schema)



	