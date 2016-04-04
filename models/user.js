var bcrypt = require('bcrypt')
var nodemailer = require('nodemailer')
var SALT_WORK_FACTOR = 10; 
var connection = require('../config/db').connection;

// Mail sending option - reusabel - for nodemailer.
var transporter = nodemailer.createTransport('smtps://netpproject%40gmail.com:iambatman1@smtp.gmail.com');
var send_confkey = function(user_email){
	// Generate a confirmation key everytime this function is called.
	var conf_key = Math.floor(Math.random()*90000) + 10000
	
	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: "netpproject@gmail.com", // sender address
		to: user_email, // list of receivers
		subject: "Reg for ProSHare", // Subject line
		text: "Hello. Access key for " + user_email + " is " + conf_key, // plaintext body
	}
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}
	});
	return conf_key
}

var send_pwd = function(user_email){
	// Generate a confirmation key everytime this function is called.
	var pwd = Math.floor(Math.random()*9000000) + 1000000

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: "netpproject@gmail.com", // sender address
		to: user_email, // list of receivers
		subject: "Reg for ProSHare", // Subject line
		text: "Hello. New password for " + user_email + " is " + pwd, // plaintext body
	}
	
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}
	});
	return pwd
}

module.exports = {
	create_user : function(request, callback){
		var username = request.username;
		var query = 'SELECT * FROM user_schema where username=' + "'" + username + "'" 
		connection.query(query, function(err, users){
			if (err) callback(err, null)
			else if(users.length == 0){
				var bitsid = request.bitsid
				var email = "f" + bitsid.substring(0,4) + bitsid.substring(8,11) + "@goa.bits-pilani.ac.in"
				var user = { 
					username : request.username,
					firstname : request.firstname,
					lastname : request.lastname,
					password  : "",
					bitsid : request.bitsid,
					email : email,
					branch : request.branch,
					conf_key : 0
				};
				// hash password.
				var salt = bcrypt.genSaltSync(10);
				user.password = bcrypt.hashSync(request.password, salt);
				
				user.conf_key = send_confkey(email);
				connection.query('INSERT INTO user_schema SET ?', user, function(err, user){
					if(err) callback(err, null);
					else callback(null, user.insertId)
				});
			}
			else{
				callback(err, null)
			}
		})
	},
	
	compare_conf_key : function(conf_key, username, callback){
		var query = 'SELECT * FROM user_schema where username=' + "'" + username + "'" 
		connection.query(query, function(err, users){
			if(err) callback(err, null)
			else if(users.length == 0) callback(new Error("No user found."), null)
			else{
				if(users[0].conf_key == conf_key) callback(null, users[0])
				else {
					users[0].conf_key = send_confkey(users[0].email);
					var update_query = 'UPDATE user_schema SET conf_key=' + users[0].conf_key +' where username=' + "'" + username + "'"
					connection.query(update_query, function(err, rows){
						if(err) callback(err, null)
						else callback (new Error("New confirmation key sent."), rows)
 					})
				}
			}
		})
	},
	
	login : function(request, callback){
		var username = request.username;
		var password = request.password;
		var query = 'SELECT * FROM user_schema where username=' + "'" + username + "'" 
		connection.query(query, function(err, users){
			if(err) callback(err, null)
			else if(users.length == 0) callback(new Error("Invalid username."), null)
			else if(!bcrypt.compareSync(password, users[0].password)) callback(new Error("Invalid Password."), null)
			else callback(null, users)
		})
	},
	
	forgot_password : function(username, callback){
		var query = 'SELECT * FROM user_schema where username=' + "'" + username + "'"
		connection.query(query, function(err, users){
			if(err) callback(err, null)
			else if(users.length == 0) callback(new Error("User not found."), null)
			else{
				var new_pwd = send_pwd(users[0].email)
				// hash password.
				var salt = bcrypt.genSaltSync(10);
				var hashed_pwd = bcrypt.hashSync(new_pwd.toString(), salt);
				var update_query = 'UPDATE user_schema SET password=' + "'" +hashed_pwd + "'" +' where username=' + "'" + username + "'"
				connection.query(update_query, function(err, rows){
					if(err) callback(err, null)
					else callback (null, rows)
				})
			}
		})
	},
	
	send_request : function(username, project_pk, callback){
		var user_query = 'SELECT * FROM user_schema where username=' + "'" + username + "'"
		var project_query = 'SELECT * FROM project_schema where project_id=' + project_pk
		connection.query(user_query + '; ' + project_query, function(err, data){
			if(err) callback(err, null)
			else if(data[0].length == 0 || data[1].length == 0) callback(new Error("User or project not found"), null)
			else{
				var member_query = 'SELECT * FROM member_schema where user_id='+ data[0][0].user_id + ' AND project_id='+ data[1][0].project_id
				var request_query = 'SELECT * FROM request_schema where user_id='+ data[0][0].user_id + ' AND project_id='+ data[1][0].project_id				
				connection.query(member_query + '; ' + request_query, function(err, memreq){
					if(err) callback(err, null)
					else if(memreq[0].length != 0 ) callback(new Error("Duplicacy in member schema"), null)
					else if(memreq[1].length != 0 ) callback(new Error("Duplicacy in request schema"), null)					
					else{
						var request_user = {
							project_id : data[1][0].project_id ,
							user_id : data[0][0].user_id ,
							sender_status : 0
						};
						connection.query('INSERT INTO request_schema SET ?', request_user, function(err, request_user){
								if(err) callback(err, null);
								else callback(null, request_user.insertId)
						});
					}
				})
			}
		})
	}, 
	
	acceptinvite : function(projectid, userid, decision, callback){
		var request_query = 'SELECT * from request_schema where user_id=' + userid + ' and project_id=' + projectid
		connection.query(request_query, function(err, request){
			if(err) callback(err)
			else if(request.length == 0) callback(new Error("No request entry in database."), null)
			else{
				if(request.sender_status == 0) callback(new Error("Invalid project, user invite pair"), null)
				else{
					connection.beginTransaction(function(err){
						if(err) callback(err, null)
						else{
							var remove_query = 'delete from request_schema where user_id = ' + userid + ' AND project_id = '+ projectid
							connection.query(remove_query, function(err, data){
								if(err){
									connection.rollback(function(){
										callback(err, null)
									})
								}
								else{
									if(decision == 1){
										var member_obj = {
											project_id : projectid,
											user_id : userid,
											admin_status : 0
										}
										connection.query('INSERT INTO member_schema SET ?', member_obj, function(err, member_obj){
											if(err){
												connection.rollback(function(){
													callback(err,null)
												})										
											}
											else{
												connection.commit(function(err){
													if(err){
														connection.rollback(function(){
															callback(err, null)
														})
													}
													else callback(null, member_obj)
												})
											}		
										})									
									}
								}
							})
						}
					})
				}
			}
		})
	}
};
