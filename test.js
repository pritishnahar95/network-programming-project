var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport('smtps://netpproject%40gmail.com:iambatman1@smtp.gmail.com');
var send_confkey = function(user_email, callback){
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
			callback(error, null)
		}else{
			callback(null, conf_key)
		}
	});
}
send_confkey("f2013494@goa.bits-pilani.ac.in", function(err, conf_key){
	 if(err) console.log(err)
	 else{
		 console.log(conf_key)
	 }
 })