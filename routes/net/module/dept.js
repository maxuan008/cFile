var Mysql = require("../../DB/mysql");
var templater = require("../../module/templater");
var async = require("async");
var config = require("../../../config/config.json");

var mgenv = global.mgENV;

function dept(data) {
     this.data = data;
}



//获取dept的信息
 dept.deptinfo = function (dept_id,callback){
     var table =  config[mgenv].mysql.header + "_dept";
     var sqlstr = " select * from " + table + " where  dept_id = '" + dept_id + "' ";
     Mysql.query(sqlstr,  function(err,docs){
        if(err) console.log(err);
        return callback(err,docs);
     });
 }


//获取dept的信息,tree
 dept.deptinfo_tree = function (dept_id,callback){
     var table =  config[mgenv].mysql.header + "_dept";
     var sqlstr = " select dept_id , father_id, name, level from " + table + " where  dept_id = '" + dept_id + "' ";
     Mysql.query(sqlstr,  function(err,docs){
        if(err) console.log(err);
        return callback(err,docs);
     });
 }

//在dept表中删除一条数据，删除条件为数组数据wherejson
 dept.delete = function (wherejson,callback){
     //console.log('cog:',global.mgENV,mgconfig);
    var table =  config[mgenv].mysql.header + "_dept";
    templater.delete(table, wherejson,function(err, docs){
         if(err) {console.log(err); return callback(err);}
         return callback(err,docs);
    });
 }



//获取机构的下级子节点
 dept.dept_child = function (dept_id,callback){
     var table =  config[mgenv].mysql.header + "_dept";
     var sqlstr = " select dept_id , father_id, name, level from " + table + " where isvalid = '1' and  father_id = '" + dept_id + "' ";
     console.log(sqlstr);
     Mysql.query(sqlstr,  function(err,docs){
        if(err) console.log(err);
        return callback(err,docs);
     });
 }



//获取dept的树
 dept.getdepttree = function (dept_id,callback){
     var result = [];
     var me = require('./dept');
     getchildtree(dept_id,function(err){
         if(err) console.log(err);  

         console.log();
         return callback(err,result);

     }); //getchildtree end


    //递归获取树
    function getchildtree(dept_id,callback){
      
        var returnFlag = 0;
        me.deptinfo_tree(dept_id,function(err,docs){
            if(err) {console.log(err); return callback(err);}
            console.log("获取自身信息：",docs);
            result = result.concat(docs);

            if(docs.length <= 0) return callback("数据错误,节点未找到");
            else{ //查询是否有子节点
                var doc = docs[0];
                me.dept_child(dept_id,function(err,childdocs){ //获取子节点
                    if(err) { console.log(err); return callback(err);}
                    //result = result.concat(childdocs);
                    console.log("获取自身节点信息：",childdocs);

                    if(childdocs.length<=0) return callback(err);
                    else if(childdocs.length>0) { //依次获取子节点的树
                        var flag = 0;
                        for(var i=0; i<childdocs.length; i++){
                            var deptid_child = childdocs[i].dept_id;
                            getchildtree(deptid_child,function(err){
                                if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

                                flag++;
                                if(flag == childdocs.length ) return callback(err);
                            }); //getchildtree end
                        } //for end

                    } //if end

                }); //me.dept_child

            } //if

        }); //me.deptinfo_tree

    } //function

 }








module.exports = dept;




