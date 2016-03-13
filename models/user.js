var mongoose = require('mongoose')
var moment = require('moment')
var Project = require('./project')

var user_schema = new mongoose.Schema({
	username : {type: String},
	password : {type: String},
	email : {type: String, unique: true},
	branch : {type: String},
	bitsid : {type: String},
	admin_status : [{type : mongoose.Schema.ObjectId, ref : 'Project'}],
	//member status
	created_at : {type : Number},
	updated_at : {type : Number},
})

//---------------------------//

// CRUD operation in user db

// Create operation.
user_schema.statics.create_user = function(user_info, callback){
	
	var new_user = new User({
		username : user_info.username,
		password : user_info.password,
		email : user_info.email,
		branch : user_info.branch,
		bitsid : user_info.bitsid,
		admin_status : [],
		created_at : moment().unix(),
		updated_at : moment().unix()
	})
	new_user.save(function(err, user){
		if(err){
			callback(err, null)
			return
		}
		else if(user){
			callback(null, user)
			return
		}
	})
};

// for convenience, keep entire mongoose user model in a variable named User.
var User = mongoose.model('User', user_schema)
module.exports = User
