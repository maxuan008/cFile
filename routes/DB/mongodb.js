var config = require('../../config/config.json');
var mgENV=global.mgENV;

// var mongodb = require('mongodb');

// var Db = require('mongodb').Db;


// var Connection = require('mongodb').Connection;
// var Server = require('mongodb').Server(config[mgENV].mongodb.host,config[mgENV].mongodb.port,{});



// module.exports = new Db(config[mgENV].mongodb.db, Server);





// var MongoClient = require('mongodb').MongoClient
//   , assert = require('assert');

// // Connection URL
// var url = "mongodb://" + config[mgENV].mongodb.host + ":" + config[mgENV].mongodb.port + "/" + config[mgENV].mongodb.db ;
// // Use connect method to connect to the Server

// var collection = function(name,callback){
//        MongoClient.connect(url, function(err, db) {
//             assert.equal(null, err);
//             console.log('mongodb连接成功');
//             var collection = db.collection(name);
//             callback(collection);

//        });
// }
	


var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
  //console.log(mgENV,config);
var url = "mongodb://" + config[mgENV].mongodb.host + ":" + config[mgENV].mongodb.port + "/" + config[mgENV].mongodb.db ;

var mongodb = function(callback){
    this.collection = {};
    var _this = this;
    MongoClient.connect(url, function (err, db) {
            if(err) { console.log(err);  }
            if (!err) {
                console.log("---mongodb连接成功:IP:" + config[mgENV].mongodb.host + " ,DB:" +  config[mgENV].mongodb.db+ " + --------------");
               
                _this.collection.activity = db.collection('activity');
                _this.collection.step = db.collection('step');
                _this.collection.concrete_task = db.collection('concrete_task');

                _this.collection.des = db.collection('des');
                // _this.collection.task_result = db.collection('task_result');

                _this.collection.task_ele = db.collection('task_ele');
                _this.collection.task_file = db.collection('task_file');

                _this.collection.study_log = db.collection('mx_study_log');
                _this.collection.study_task = db.collection('mx_study_task');
                _this.collection.study_result = db.collection('mx_study_result');
                _this.collection.study_file = db.collection('mx_study_file');  
                _this.collection.study_team = db.collection('study_team');  
                _this.collection.study_step = db.collection('study_step');  
                _this.collection.study_step_file = db.collection('study_step_file');  
                              
                    
                _this.collection.mx_qt_exam = db.collection('mx_qt_exam');            
                _this.collection.mx_qt_question = db.collection('mx_qt_question');
                _this.collection.mx_qt_option = db.collection('mx_qt_option');     

                _this.collection.mx_my_exam = db.collection('mx_my_exam');            
                _this.collection.mx_my_question = db.collection('mx_my_question');
                _this.collection.mx_my_option = db.collection('mx_my_option');            

               callback(_this);   
            }

    });

    
};


module.exports = mongodb;







	    

