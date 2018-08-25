var Mysql = require("../../DB/mysql");
var templater = require("../../module/templater");
var async = require("async");
var config = require("../../../config/config.json");
var app_funs = require("./app_funs");

var mgenv = global.mgENV;

function apps(data) {
     this.data = data;
}



//在app表中删除一条数据，删除条件为数组数据wherejson
 apps.delete = function (wherejson,callback){
     //console.log('cog:',global.mgENV,mgconfig);
    var table =  config[mgenv].mysql.header + "_app";
    templater.delete(table, wherejson,function(err, docs){
         if(err) {console.log(err); return callback(err);}
         return callback(err,docs);
    });
 }

//获取超管或组织管理员功能
apps.getapp_Admin = function (type, callback) {
    var app_funs = require('./app_funs.js');
    var table =  config[mgenv].mysql.header + "_app";
    var table_2 =  config[mgenv].mysql.header + "_org_app";   
    var sqlstr = "select app_id , name , isblank , domain ,href  ,type ,position , developmark from " + table + " where  `isvalid` = '1'  ";
    sqlstr = sqlstr + " and `type` ='" + type + "'    ";

    //如果是组织管理员 ，筛选授权功能
    //if(type == '1') sqlstr = sqlstr + " and app_id In (select app_id from " + table_2 + " where  isvalid = '1' and  status ='1' and  org_id = '" + org_id + "'  )";

    var  menuinfo = [] , personalinfo = [], result = {}; 
    Mysql.query(sqlstr,function(err, docs){
        if(err)	{console.log(err); return callback(err);}

        if(docs.length <= 0)     return callback(err, {menuinfo:menuinfo , personalinfo :personalinfo  });         
                           
        var value =0;
        for(var i=0; i<docs.length; i++ ){
            var doc = docs[i] , app_id = docs[i].app_id , position = docs[i].position;
            
            //菜单功能
            if(position == '1') {
                var m = menuinfo.length ;
                menuinfo[m] = doc;
                
                //设置子功能
                (function(m,app_id){
                    app_funs.getfuns(app_id, function(err, fundocs){
                        if(err)	 {console.log(err); return callback(err);}
                        menuinfo[m].appfuns = fundocs;

                        value = value +1;
                        if( value == docs.length ) {
                            result = {menuinfo:menuinfo , personalinfo :personalinfo  };
                            return callback(err,result);  
                        }
                    });
                })(m,app_id);

            } 
            
            //个人中心功能
            if(position == '2') {
                var p = personalinfo.length ;
                personalinfo[p] = doc;
                //设置子功能
                (function(p){
                    app_funs.getfuns(app_id, function(err, fundocs){
                        if(err)	 {console.log(err); return callback(err);}
                        personalinfo[p].appfuns = fundocs;

                        value = value +1;
                        if( value == docs.length ) {
                            result = {menuinfo:menuinfo , personalinfo :personalinfo  };
                            return callback(err,result);  
                        }

                    });
                })(p);
            }

        } //for end

    });
}



//获取普通用户角色的功能信息
apps.getapp_common = function (role_id,org_id, callback) {
    var table_1 =  config[mgenv].mysql.header + "_role_app";  
    var table_2 =  config[mgenv].mysql.header + "_app"; 
    var table_3 =  config[mgenv].mysql.header + "_org_app";   


    var  menuinfo = [] , personalinfo = [], result = {}; 
    
    //获取角色的功能
    Mysql.query("CALL  stroed_getapp_common( '" + role_id + "' , '" + org_id + "' )  ",function(err, tmpdocs){ 
        if(err)	 {console.log(err); return callback(err);}
        docs = tmpdocs[0];
        
        if(docs.length <= 0)  return callback(err , {menuinfo:menuinfo , personalinfo :personalinfo } );


        var value =0;
        for(var i=0; i<docs.length; i++ ){
            var doc = docs[i] , app_id = docs[i].app_id , position = docs[i].position;
            
            //菜单功能
            if(position == '1') {
                var m = menuinfo.length ;
                menuinfo[m] = doc;
                
                //设置子功能
                (function(m,app_id){
                    app_funs.getfuns(app_id, function(err, fundocs){
                        if(err)	 {console.log(err); return callback(err);}
                        menuinfo[m].appfuns = fundocs;

                        value = value +1;
                        if( value == docs.length ) {
                            result = {menuinfo:menuinfo , personalinfo :personalinfo  };
                            return callback(err,result);  
                        }
                    });
                })(m,app_id);

            } 
            
            //个人中心功能
            if(position == '2') {
                var p = personalinfo.length ;
                personalinfo[p] = doc;
                //设置子功能
                (function(p){
                    app_funs.getfuns(app_id, function(err, fundocs){
                        if(err)	 {console.log(err); return callback(err);}
                        personalinfo[p].appfuns = fundocs;

                        value = value +1;
                        if( value == docs.length ) {
                            result = {menuinfo:menuinfo , personalinfo :personalinfo  };
                            return callback(err,result);  
                        }

                    });
                })(p);
            }

        } //for end
        
    }); // mysql.query  en



}










module.exports = apps;




