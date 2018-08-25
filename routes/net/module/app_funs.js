var Mysql = require("../../DB/mysql");
var templater = require("../../module/templater");
var async = require("async");
var config = require("../../../config/config.json");

var mgenv = global.mgENV;

function app_funs(data) {
     this.data = data;
}



//在app_funs表中删除一条数据，删除条件为数组数据wherejson
 app_funs.delete = function (wherejson,callback){
     //console.log('cog:',global.mgENV,mgconfig);
    var table =  config[mgenv].mysql.header + "_app_funs";
    templater.delete(table, wherejson,function(err, docs){
         if(err)	 {console.log(err); return callback(err);}
         return callback(err,docs);
    });
 }


//获取app的funs信息
app_funs.getfuns = function(app_id, callback){
    var table =  config[mgenv].mysql.header + "_app_funs";
    var sqlstr = "select fun_id , name ,href  ,type  from " + table + " where  `isvalid` = '1' ";
    sqlstr = sqlstr + " and `app_id` ='" + app_id + "' ";

    templater.SQL(sqlstr,function(err, docs){
        if(err)	 {console.log(err); return callback(err);}
        //console.log(app_id,docs);
        return callback(err, docs);
    });

}






module.exports = app_funs;




