var Mysql = require("../../DB/mysql");
var templater = require("../../module/templater");
var async = require("async");
var config = require("../../../config/config.json");

var mgenv = global.mgENV;

function org(data) {
     this.data = data;
}



//获取dept的信息
 org.orginfo = function (org_id,callback){
     var table =  config[mgenv].mysql.header + "_org";
     var sqlstr = " select * from " + table + " where  org_id = '" + org_id + "' ";
     Mysql.query(sqlstr,  function(err,docs){
        if(err) console.log(err);
        return callback(err,docs);
     });
 }



//在org表中删除一条数据，删除条件为数组数据wherejson
 org.delete = function (wherejson,callback){
     //console.log('cog:',global.mgENV,mgconfig);
    var table =  config[mgenv].mysql.header + "_org";
    templater.delete(table, wherejson,function(err, docs){
         if(err) {console.log(err); return callback(err);}
         return callback(err,docs);
    });
 }




module.exports = org;




