//console.log("11");
var config = require('../../config/config.json');

var mysql = require('mysql');

var mgENV=global.mgENV;


//console.log(mgconfig);

var connection = mysql.createConnection({
	  host     : config[mgENV].mysql.host,
	  user     : config[mgENV].mysql.user,
	  password : config[mgENV].mysql.password,
	  database : config[mgENV].mysql.db,
	  connectTimeout: 1000000
});

connection.connect();


module.exports = connection;



	    

