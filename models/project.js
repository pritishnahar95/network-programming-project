var connection = require('../config/db').connection;
module.exports = {
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
					console.log(memreq)
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
	}
};



	