var express = require('express');
var path = require('path');
var assert=require('assert');
var async = require('async');
var EventProxy =   require('eventproxy');
var moment = require('moment');
var mysql = require('../DB/mysql');
var templater = require("../module/templater");
var config = require('../../config/config.json');
var UUID = require('uuid');
var crypto = require('crypto');
var fs = require("fs");
//var cloudfile = require("../module/file");

// var mongoClient =  require("../module/mongoClient");
//var course =  require("../module/course");
var _STUDY = require("../module/study");

//var task =  require("../module/task");

// var app_funs = require("./module/app_funs");
// var apps = require("./module/apps");
// var org = require("./module/org");
// var role = require("./module/role");

var router = express.Router();

var mgenv = global.mgENV;

var _STUDY_TASK = global.mongoDB.collection.study_task;


 //---单人课程---
 router.post('/single/beginlearining',beginlearining);   //开始学习
 router.post('/single/getingstudytask',getingstudytask);   //获取正在学习的任务
 router.post('/single/completestudytask',completestudytask);   //提交正在学习的任务


 router.post('/single/downloadOfficeFile_study', downloadOfficeFile_study);   //存储学习后的结果文件

 router.post('/single/updatestudyresult', updatestudyresult);   //修改富文本等信息


 //----------------------


 //---查询功能---
 router.post('/search/getstudycourses',getstudycourses);   //查询学习的课程，包括未完成与完成的。
 router.post('/search/getdeptusershistory', getdeptusershistory);   //获取一个情景下指定机构学生的历史数据。



 //---多人课程---
 router.post('/many/orgcourse_many',orgcourse_many);   //组织多人课程的学习
 router.post('/many/getlearning_many',getlearning_many);   //获取正在学习的信息
 router.post('/many/getTalkingHistory', getTalkingHistory);   //提交正在学习的任务

 router.post('/many/gettaskhistory', gettaskhistory);   //提交正在学习的任务
 router.post('/many/gettaskhistory_v2', gettaskhistory_v2);   //获取多人课程学习任务的历史信息：老师查看学生历史信息用。


 //获取一个情景下指定机构学生的历史数据。
 function getdeptusershistory(req, res, next) {

     var course_child_id = req.body.course_child_id, deptid = req.body.deptid,
         user_id = req.session.userinfo.user_id,type = req.body.type;

     var parflg = '', data = {};
     if (!course_child_id) parflg = parflg + " course_child_id"; else data.course_child_id = course_child_id;
     if (!deptid) parflg = parflg + " deptid"; else data.deptid = deptid;
     if (parflg != '') { parflg = parflg + " 参数不正确"; return res.send({ code: 204, err: parflg }); } 

     var result = {};

     mysql.query("CALL stroed_getcourse_child('" + course_child_id + "')  ", function (err, tmpdocs) {
         if (err) return res.send({ code: 204, err: err });
         var docs = tmpdocs[0];
         if (docs.length <= 0) return res.send({ code: 204, err: "此课程未找到" });


         var doc = docs[0], type = doc.type;
         //console.log('AAA:', doc);
         if (type != '0' && type != '1' ) return res.send({ code: 204, err: "学习类型数据错误" });
         result.type = type, result.info = doc;

         _STUDY.getdeptusershistory(doc, deptid, user_id, function (err,data) {
             if (err) return res.send({ code: 204, err: err });
             if (type == '0') result.users = data.usersdocs;
             if (type == '1') result.teams = data.teams;
             return res.send({ code: 201, datas: result });
         }); //_STUDY.getdeptusershistory end

     }); //mysql.query end 

 }


 function getTalkingHistory(req, res, next) {
     var study_log_id = req.body.study_log_id, user_id = req.session.userinfo.user_id, starttime = req.body.starttime, endtime = req.body.endtime;

     var wherestr = " study_log_id = '" +study_log_id + "' and  isvalid='1' and   sendtime > '" + starttime + "' and  sendtime <  '" + endtime + "'";
     var table = config[mgenv].mysql.header + "_study_talking";
     var sqlstr = "select * from `" + table + "` where " + wherestr;

     console.log("SQL:", sqlstr);
     mysql.query(sqlstr, function (err, docs) {
         if (err) return res.send({ code: 204, err: err });
         return res.send({ code: 201, datas: docs });
     });  


 }

function gettaskhistory(req, res, next) {
    var study_log_id = req.body.study_log_id, user_id = req.session.userinfo.user_id, task_id = req.body.task_id;
    var parflg = '', data = {};
    if (!study_log_id)  parflg = parflg + " study_log_id"; else data.study_log_id = study_log_id;
    if (!task_id) parflg = parflg + " task_id"; else data.task_id = task_id;
    if (parflg != '') { parflg = parflg + " 参数不正确"; return res.send({ code: 204, err: parflg }); }
    data.user_id = user_id;

    _STUDY.gettaskhistory(data, function (err, result) {
        if (err) return res.send({ code: 204, err: err });
        return res.send({ code: 201, datas: result });
    });

}

//获取多人课程学习任务的历史信息：老师查看学生历史信息用。
function gettaskhistory_v2(req, res, next) {
    var study_log_id = req.body.study_log_id, user_id = req.body.user_id, step_id = req.body.step_id;
    var parflg = '', data = {};
    if (!study_log_id) parflg = parflg + " study_log_id"; else data.study_log_id = study_log_id;
    if (!step_id) parflg = parflg + " step_id"; else data.step_id = step_id;
    if (!user_id) parflg = parflg + " user_id"; else data.user_id = user_id;

    if (parflg != '') { parflg = parflg + " 参数不正确"; return res.send({ code: 204, err: parflg }); }
    console.log("V2:", study_log_id, user_id, step_id  );

    _STUDY_TASK.findOne({ study_log_id: study_log_id, user_id: user_id, step_id: step_id , isvalid:'1'  }, function (err, studytaskdoc) {
        if (err) return res.send({ code: 204, err: err });
        if (studytaskdoc == undefined) return res.send({ code: 204, err: "未找到此学习任务，请检查参数是否匹配" });
        data.task_id = studytaskdoc.task_id;
        _STUDY.gettaskhistory(data, function (err, result) {
            if (err) return res.send({ code: 204, err: err });
            return res.send({ code: 201, datas: result });
        });
    });

}








 //----------------------
 //获取正在学习的信息
 function getlearning_many(req,res,next){
    var study_log_id = req.body.study_log_id, user_id = req.session.userinfo.user_id ;
    var parflg = '', data = {};
    if(!study_log_id)  parflg = parflg + " study_log_id";  else data.study_log_id = study_log_id;
    if(parflg !='') {parflg = parflg + " 参数不正确";  return res.send({code:204,err:parflg});   } 
    data.user_id =user_id;

    _STUDY.getlearning_many( data ,function(err,result ){ 
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:result });
    }); 

 }




//组织多人课程
function orgcourse_many(req,res,next){
   
    var course_child_id = req.body.course_child_id , orgtitle =  req.body.orgtitle , 
    deptid = req.body.deptid  , least = req.body.least  , most = req.body.most  ;

    var user_id = req.session.userinfo.user_id , create_time =moment().format('YYYY-MM-DD HH:mm:ss')  ;
    
    var parflg = '', data = {};
    if(!course_child_id)  parflg = parflg + " course_child_id";  else data.course_child_id = course_child_id;
    if(!orgtitle)  parflg = parflg + " orgtitle";  else data.orgtitle = orgtitle;
    if(!deptid)     parflg = parflg + " deptid";  else data.deptid = deptid;
    if(!least)  parflg = parflg + " least";  else data.least = least;
    if(!most)  parflg = parflg + " most";  else data.most = most;

    if(parflg !='') {parflg = parflg + " 参数不正确";  return res.send({code:204,err:parflg});   } 

    data.user_id=  user_id , data.orguserid = user_id  ,data.creater = user_id ; 
    data.type = '1' , data.isvalid = '1',  data.create_time = create_time;
    data.isstart ='0' ;  data.ing_step_id = '-1' ;  data.study_step_flow = [];

    data.study_log_id = UUID.v1();

    _STUDY.addstudylog( data ,function(err ){  
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:data.study_log_id  });
    });

}




//===================存储学习后的结果文件==========
function downloadOfficeFile_study(req,res,next){  
   var id = req.query.id, url = req.query.url;
   if(id == '' || id == undefined)  return  res.send({code:204 , err:"ID参数不正确"});
   if(url == '' || url == undefined)  return res.write({code:204 , err:"URL参数不正确"});
    
    _STUDY.downloadOfficeFile_study(id,url,function(err){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}





//查询学习的课程，包括未完成与完成的
function getstudycourses(req,res,next){
    var type = req.body.type  ;
    if(type != '0' && type != '1')  return res.send({code:204,err:'type参数不正确'});
    var is_over = (type == '1')? '1':'0';
    var user_id = req.session.userinfo.user_id  ;
    var data = {is_over:is_over, user_id:user_id,  isvalid:'1' };
     //console.log(data);

    _STUDY.getstudycourses( data ,function(err , docs){  
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:docs });
    });

}

























//===============================当人课程学习============================================

//开始学习
function beginlearining(req,res,next){
    var course_child_id = req.body.course_child_id  ;
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'});
    var user_id = req.session.userinfo.user_id , create_time =moment().format('YYYY-MM-DD HH:mm:ss')  ;
    var data = {study_log_id:UUID.v1(), course_child_id:course_child_id, user_id:user_id,  isvalid:'1' ,
     ing_study_task_id:'-1', ing_task_id:'-1',  last_study_task_id:'-1',study_flow:[],
     creater:user_id , create_time:create_time ,start_time:create_time,is_over:'0' };
     //console.log(data);

    _STUDY.addstudylog( data ,function(err){  
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:{study_log_id:data.study_log_id  } });
    });

}


//获取正在学习的任务
function getingstudytask(req,res,next){
    var study_log_id = req.body.study_log_id  ;
    if(study_log_id == '' || study_log_id == undefined)  return res.send({code:204,err:'study_log_id参数不正确'});

    var user_id = req.session.userinfo.user_id , create_time =moment().format('YYYY-MM-DD HH:mm:ss');
    var data = {study_log_id:study_log_id ,  user_id:user_id }
    console.log('开始获取学习任务',data);
    var userinfo = req.session.userinfo;
    console.log("用户session:" , userinfo);
    _STUDY.getingstudytask(userinfo, data ,function(err,result){  
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:result });
    });
}



//提交正在学习的任务,创建下一个学习任务并返回学习任务数据
function completestudytask(req,res,next){
    var study_log_id = req.body.study_log_id  ;
    if(study_log_id == '' || study_log_id == undefined)  return res.send({code:204,err:'study_log_id参数不正确'});
    var user_id = req.session.userinfo.user_id , create_time =moment().format('YYYY-MM-DD HH:mm:ss')  ;
    var data = {study_log_id:study_log_id,  user_id:user_id }
    console.log('开始获取学习任务',data);
    var userinfo = req.session.userinfo;
    console.log("用户session:" , userinfo);

    _STUDY.completestudytask(userinfo, data ,function(err,result){  
        if(err) return  res.send({code:204 , err:err});
        if(result.is_over == '1' ) return  res.send({code:201 , datas:result });

        //下一个学习任务已经示例化完成,获取正在学习中的任务数据
        _STUDY.getingstudytask(userinfo, data ,function(err,result){  
            if(err) return  res.send({code:204 , err:err});
            return   res.send({ code:201 , datas:result });
        });
        
    });
}



////更新学习结果中的文件路径。
function updatestudyresult(req,res,next){
    var study_result_id = req.body.study_result_id, txt = req.body.txt ;  //office_url = req.body.office_url
    if (study_result_id == '' || study_result_id == undefined)  return res.send({code:204,err:'study_log_id参数不正确'});
    //if(office_url == '' || office_url == undefined)  return res.send({code:204,err:'office_url参数不正确'});

    var wheredata = { study_result_id: study_result_id }, data = { txt: txt};

    _STUDY.updatestudyresult(wheredata, data ,function(err){  
        if(err) return  res.send({code:204 , err:err});
        else return res.send({ code:201 });
    });
}




//===============================================================================================













module.exports = router;





