var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'umang',
  database : 'ProShare',
  multipleStatements: true
});
connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Database Connection established');
});

exports.connection = connection;