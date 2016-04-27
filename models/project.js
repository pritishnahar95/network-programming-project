var connection = require('../config/db').connection;
module.exports = {
	create_project : function(request, branch_id, username, callback){
		
		var project_title = request.title
		var user_query = 'SELECT * FROM user_schema where username=' + "'" + username + "'"
		connection.query(user_query, function(err, data){
			if(err) callback(err, null)
			else if(data.length == 0) callback(new Error("User not found in database."), null)
			else{
				connection.beginTransaction(function(err){
					if(err) callback(err, null)
					else{
						var project = {
							title : project_title,
							description : request.description
						}
						connection.query('INSERT INTO project_schema SET ?', project, function(err, project){
							if(err){
								connection.rollback(function(err){
									if(err) callback(err, null)
								})
							}
							else{
								var member_obj = {
									project_id : project.insertId,
									user_id : data[0].user_id,
									admin_status : 1
								}
								connection.query('INSERT INTO member_schema SET ?', member_obj, function(err, member){
									
									if(err){
										connection.rollback(function(err){
											if(err) callback(err, null)
										})
									}
									else{
										var project_branch_obj = {
											project_id : project.insertId,
											branch_id : branch_id
										}
										connection.query('INSERT INTO branch_project_schema SET ?', project_branch_obj, function(err, object){
											if(err){
												connection.rollback(function(err){
													if(err) callback(err, null)
												})
											}
											else{
												connection.commit(function(err){
													if(err){
														connection.rollback(function(){
															callback(err, null)
														})
													}
													else callback(null, object)
												})
											}
										})
									}
								})
							}
						})
					}
				})
			}
		})
	},
	
	edit_project : function(projectinfo, project_id, username, callback){
		var title = projectinfo.title
		var description = projectinfo.description
		var user_query = 'SELECT * FROM user_schema where username=' + "'" + username + "'"
		var project_query = 'SELECT * FROM project_schema where project_id=' + "'" + project_id + "'"
		connection.query(user_query + ";" + project_query, function(err, data){
			if(err) callback(err, null)
			else if(data[0].length == 0) callback(new Error("No user found"), null)
			else if(data[1].length == 0) callback(new Error("No project found"), null)
			else{
				var user_id = data[0][0].user_id
				var member_query = 'SELECT * FROM member_schema where user_id=' + user_id + " AND project_id=" + project_id
				connection.query(member_query, function(err, member){
					if(err) callback(err, null)
					else if(member.length == 0) callback(new Error("Invalid edit request."), null)
					else{
						if(member[0].admin_status == 0) callback(new Error("No admin rights."), null)
						else{
							var update_query = 'UPDATE project_schema SET title=' + "'" + title + "', description=" + "'" + description + "' where project_id=" + project_id  
							connection.query(update_query, function(err, data){
								if(err) callback(err, null)
								else callback(null, data)
							})
						} 
					} 
				})
			} 
		})
	},
	
	send_invite : function(user_id, admin_id, project_id, callback){
		var user_query = 'SELECT * FROM user_schema where user_id='+ user_id
		var admin_query = 'SELECT * FROM user_schema where user_id='+ admin_id
		var project_query = 'SELECT * FROM project_schema where project_id=' + project_id
		connection.query(user_query + '; ' + admin_query + '; ' + project_query, function(err, data){
			if(err) callback(err, null)
			else if(data[0].length == 0 || data[1].length == 0 || data[2].length == 0) callback(new Error("User, admin or project not found"), null)
			else{
				var user_member_query = 'SELECT * FROM member_schema where user_id='+ data[0][0].user_id + ' AND project_id='+ data[2][0].project_id
				var admin_member_query = 'SELECT * FROM member_schema where user_id='+ data[1][0].user_id + ' AND project_id='+ data[2][0].project_id
				var invite_query = 'SELECT * FROM request_schema where user_id='+ data[0][0].user_id + ' AND project_id='+ data[2][0].project_id				
				connection.query(user_member_query + '; ' + admin_member_query +';' + invite_query, function(err, memreq){

					if(err) callback(err, null)
					else if(memreq[0].length != 0 || memreq[1].length == 0 || memreq[2].length != 0) callback(new Error("Invalid invite"), null)
					else{
						if (memreq[1].admin_status == 0) callback(new Error("You dont have admin rights"),null)
						
						else{
							var request_user = {
								project_id : data[2][0].project_id ,
								user_id : data[0][0].user_id ,
								sender_status : 1
							};
							connection.query('INSERT INTO request_schema SET ?', request_user, function(err, request_user){
									if(err) callback(err, null);
									else callback(null, request_user.insertId)
							});
						}	
					}
				})
			}
		})
	},
	
	find_all : function(callback){
		var query = 'select * from (select u.username , m.admin_status, title,description from member_schema m inner join project_schema p on m.project_id=p.project_id inner join user_schema u on m.user_id=u.user_id) as t where t.admin_status=1'
		connection.query(query, function(err, data){
			if(err) callback(err, null)
			else if(data.length == 0) callback(new Error("No projects to show."), null)
			else callback(null, data)
		})
	},
	
	find_project_branch : function(branch, callback){
		var query = 'SELECT * FROM branch_schema where branch_name=' + "'" + branch +"'"
		connection.query(query, function(err, data){
			if(err) callback(err, null)
			else if(data.length == 0) callback(new Error("Branch does not exist."), null)
			else{
				var branch_id = data[0].branch_id
				var query = 'SELECT project_schema.project_id,title,description ' +
        					'FROM project_schema,branch_project_schema,branch_schema ' +
        					'WHERE branch_schema.branch_id = ' + branch_id + 
							' AND branch_schema.branch_id = branch_project_schema.branch_id AND project_schema.project_id = branch_project_schema.project_id order by project_schema.project_id desc'
				connection.query(query, function(err, data){
					if(err) callback(err, null)
					else callback(null, data)
				})
			}
		})
	},
	
	find_project_branch_tag : function(branch, tag, callback){
		var branch_query = 'SELECT * FROM branch_schema where branch_name=' + "'" + branch +"'"
		var tag_query = 'SELECT * FROM tag_schema where tag_name=' + "'" + tag +"'"
		connection.query(branch_query + '; ' + tag_query, function(err, data){
			if(err) callback(err, null)
			else if(data[0][0] == null) callback(new Error("Branch does not exist."), null)
			else if(data[1][0] == null) callback(new Error("Tag does not exist."), null)
			else{
				var branch_id = data[0][0].branch_id
				var tag_id = data[1][0].tag_id
				var query = 'SELECT project_schema.project_id,title,description ' +
        					'FROM project_schema,branch_project_schema,branch_schema,tag_schema,tag_project_schema ' +
        					'WHERE branch_schema.branch_id = ' + branch_id +
							' AND tag_schema.tag_id = ' + tag_id +
							' AND branch_schema.branch_id = branch_project_schema.branch_id AND ' +
							'tag_schema.tag_id = tag_project_schema.tag_id AND project_schema.project_id = branch_project_schema.project_id '+
							'AND project_schema.project_id = tag_project_schema.project_id' 
				connection.query(query, function(err, data){
					if(err) callback(err, null)
					else callback(null, data)
				})
			}
		})
	},
	
	accept_request : function(project_id, user_id, admin_id, decision, callback){
		var query = 'SELECT * FROM member_schema where user_id =' + admin_id + ' AND project_id = ' + project_id
		connection.query(query, function(err,data){
			if(err) callback(err, null)
			else if(data.length == 0) callback(new Error("You aint a member"),null)
			else {
				if(data[0].admin_status != 1){
					callback(new Error("You dont have admin rights to accept request"), null)
				}
				else{
					connection.query('select * from request_schema where user_id ='+ user_id +  ' AND project_id='+ project_id,function(err,data){
						if(err) callback(err, null)
						else if(data.length == 0) callback(new Error("User has not requested to join the project"), null)
						else{
							if(data[0].sender_status == 0){						
								connection.beginTransaction(function(err){
									if(err) callback(err, null)
									else{
										connection.query('delete from request_schema where user_id = ' + user_id + ' AND project_id = '+ project_id, function(err, data){
											if(err){
												connection.rollback(function(){
													callback(err,null)
												})
											}
											else{	
												if(decision == 1){
													var member_obj = {
														project_id : project_id,
														user_id : user_id,
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
												else{
													connection.commit(function(err){
														if(err){
															connection.rollback(function(){
																callback(err, null)
															})
														}
														else callback(null, null)
													})
												}	
											}
										})	
									}
									
								})
							}
							else{
								callback(new Error("To be sorted out later redarding overlap of invite and request. sender_status = 1"),null)
							}	
						}	
					})
				}
			}
		})
	},
	
	create_notice : function(content, user_id, project_id, callback){
		// check for admin status for now. then start insertion.
		var member_query = 'SELECT * FROM member_schema where user_id=' + user_id + ' AND project_id=' + project_id
		connection.query(member_query, function(err, data){
			if(err) callback(err, null)
			else if (data.length == 0) callback(new Error("No rights to post notice"), null)
			else if(data[0].admin_status != 1) callback(new Error("No rights to post notice"), null)
			else{
				connection.beginTransaction(function(err){
					if(err) callback(err, null)
					else{
						var notice_obj = {
							content : content,
						}
						connection.query('INSERT INTO notice_schema SET ?', notice_obj, function(err, notice){
							if(err){
								connection.rollback(function(){
									callback(err,null)
								})										
							}
							else{
								var project_notice_obj =  {
									project_id : project_id,
									notice_id : notice.insertId,
									user_id : user_id
								}
								connection.query('INSERT INTO project_notice_schema SET ?', project_notice_obj, function(err, data){
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
											else callback(null, data)
										})
									}
								})
							}
						})
					}
				})
			}
		})  
	},
	
	getnotices : function(project_id, callback){
		var notice_query = 'select * from (select n.content, p.project_id, p.project_notice_id from notice_schema n inner join project_notice_schema p on n.notice_id=p.project_notice_id) as r where r.project_id='+project_id+' order by r.project_notice_id desc'
		connection.query(notice_query, function(err, data){
			if(err) callback(err, null)
			else callback(null, data)
		})
	},
	
	// To get all users who are not in member_schema, request_schema corresponding to a project_id
	otherusers: function(project_id, callback){
		var query = 'SELECT username, user_id FROM user_schema WHERE user_id NOT IN (SELECT user_id FROM member_schema WHERE project_id = '+project_id+' UNION SELECT user_id FROM request_schema WHERE project_id = '+project_id+')'
		connection.query(query, function(err, data){
			if(err) callback(err, null)
			else callback(null, data)
		})
	}
};	