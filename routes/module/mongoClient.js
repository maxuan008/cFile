var mongodb = require('../DB/mongodb.js') , assert = require('assert');
var ObjectID = require('mongodb').ObjectID;

//console.log(mongodb);
var client = function(name,callback){
    mongodb.open(function(err,db){
            if(err) console.log(err);
            assert.equal(err, null);
            db.collection(name,function(err,collection){
                if(err) console.log(err);
                assert.equal(err, null);
                callback(collection);
            });

        });
}
	

//var collection = mongodb.open();

 module.exports = client;



// exports.concrete_task = function (next) {
//     db(function(db){
//         var collection = db.collection('documents');
//         next(collection);
//     });

// }


























