var Mysql = require("../../DB/mysql");
var templater = require("../../module/templater");
var async = require("async");
var config = require("../../../config/config.json");
var UUID = require('uuid');
var moment=require('moment');

var mgenv = global.mgENV;

function role(data) {
     this.data = data;
}



//在 role 表中删除一条数据，删除条件为数组数据wherejson
 role.delete = function (wherejson,callback){
     //console.log('cog:',global.mgENV,mgconfig);
    var table =  config[mgenv].mysql.header + "_role";
    templater.delete(table, wherejson,function(err, docs){
         if(err)	 {console.log(err); return callback(err);}
         return callback(err,docs);
    });
 }


//添加固定的组织角色， student ：学生， teacher ：老师  ； 并锁定
role.fixedrole = function (org_id, callback) {
    var create_time = moment().format('YYYY-MM-DD HH:mm:ss');
    var datas = [
                 {role_id:UUID.v1() , org_id:org_id , name:"学生" , status:'2' , type:"student" ,create_time:create_time},
                 {role_id:UUID.v1() , org_id:org_id , name:"老师" , status:'2' , type:"teacher" ,create_time:create_time},
                 {role_id:UUID.v1() , org_id:org_id , name:"其它" , status:'2' , type:"other" ,create_time:create_time},                 
               ];

    var table =  config[mgenv].mysql.header + "_role";           
   
    templater.add_Arry(table,datas,function(err,docs) {
          if(err) console.log(err);
          console.log("Arry Docs:",docs); 
          return callback(err,docs); 
    });
}





module.exports = role;




