var Mysql = require("../DB/mysql");
var templater = require("./templater");
//var async = require("async");
var config = require("../../config/config.json");
var fs = require('fs');
var EventProxy = require('eventproxy');
var path = require('path');
var formidable = require('formidable');
var UUID = require('uuid');
//var mongoClient =  require("./mongoClient");
var syncRequest = require('sync-request');
var moment=require('moment');

var task = require('./task');
var course = require('./course');
var form = require('./form');
var _QT =  require("./question");


var mongoDB =  require("../DB/mongodb");

var mgenv = global.mgENV;
//console.log(global.mongoDB);

var _STUDY_LOG =  global.mongoDB.collection.study_log;
var _STUDY_TASK =  global.mongoDB.collection.study_task;
var _STUDY_FILE =  global.mongoDB.collection.study_file;
var _STUDY_RESULT =  global.mongoDB.collection.study_result;

var _ACT =  global.mongoDB.collection.activity;
var _STEP = global.mongoDB.collection.step;
var _TASK = global.mongoDB.collection.concrete_task;

var _DES =  global.mongoDB.collection.des;
var _TASK_RES =  global.mongoDB.collection.task_result;
var _TASK_FILE =  global.mongoDB.collection.task_file;
var _TASK_ELE =  global.mongoDB.collection.task_ele;

var _STUDY_TEAM = global.mongoDB.collection.study_team;
var _STUDY_STEP = global.mongoDB.collection.study_step;

var _STUDY_STEP_FILE = global.mongoDB.collection.study_step_file;






function study(data) {
     this.data = data;
}






//============函数：文件基础功能====================================================
//创建文件夹
function mkdirpath(dirpath,callback){  
    fs.exists(dirpath,function(flag){
        if(flag == false ) { //文件夹不存在
            //1。先判断是否是根目录下文件夹
            var rootpath = path.dirname(dirpath);
            //根目录，创建文件夹
            if(rootpath  == '.' )  fs.mkdir(dirpath,function(err){  return callback(err);  });
            else  //如果不为根目录，则先创建好父级目录在，创建本目录    
                mkdirpath(rootpath,function(err){ if(err) return callback(err);
                    fs.mkdir(dirpath,function(err){  return callback(err);  });  // fs.mkdir   end           
                }); // mkdirpath end
        } else return callback(null);  //if end
    });  //fs.exists end
}


//复制文件，先查看文件是否存在
function copyfile(sourcepath,destpath, callback){
    //验证文件是否存在
    fs.exists(sourcepath,function(flag){
            if(flag == false )   return callback('源文件不存在:'+ sourcepath);
            var source = fs.createReadStream(sourcepath), dest = fs.createWriteStream(destpath );
            source.pipe(dest);
            source.on('end', function() { return callback(null); });

            /* error */ 
            source.on('error', function(err) { 
                return callback(err);
            });
     }); // fs.exists
}
//==================================================================================










//============单人课程===================================================================

function fun_addstudylog(data,callback){
    //console.log(data);
    _STUDY_LOG.insert(data, function(err,doc){ return  callback(err); });  
}

study.addstudylog = function(data,callback) {
    fun_addstudylog(data,function(err){ return callback(err);  });
}

//===============================================================================



//============获取正在学习中的任务信息=======================================================
function fun_get_study_file(study_result_id , callback){
  _STUDY_FILE.findOne({study_result_id:study_result_id},function(err,doc){  return callback(err,doc); });
}



//获取符合条件的一个学习的信息，含学习的结果信息addstudylog
function  fun_get_studytask_info(data,callback){
    var returnFlag=0 , result = {};
    //console.log(data);
    _STUDY_TASK.findOne(data,function(err,studytaskdoc){  if(err)  return callback(err);
        result.info = studytaskdoc;
        //console.log('studytask doc:',studytaskdoc);
        var task_id = studytaskdoc.task_id;
        //1.获取当前学习任务的产出。  
        _STUDY_RESULT.find({study_task_id:studytaskdoc.study_task_id, isvalid:'1'}).toArray ( function(err,studyResultdocs){ if(err) return callback(err);
            if(studyResultdocs.length <= 0 )  return callback(err,result);
            delete studyResultdocs.creater; delete studyResultdocs.updater;delete studyResultdocs.create_time; delete studyResultdocs.update_time;
            //console.log("studyResultdocs:" , studyResultdocs);
            var flag = 0, end = studyResultdocs.length;
            for(var i=0; i < end ; i++){
                //console.log('----->',i, end);
               (function(i){
                    fun_get_study_file(studyResultdocs[i].study_result_id , function(err,doc){
                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                        //console.log('----->',i,flag, end);
                        studyResultdocs[i].file = doc;
                        flag++; 
                        if(flag == end) {result.results = studyResultdocs; return callback(err,result); } 
                    });
               })(i);

            } //for end

        }); //_STUDY_RESULT.find end

    }) //_STUDY_TASK.findOne
}


function fun_getstudytask_allinfo(study_task_id,callback){
    var returnFlag=1, ep =new EventProxy();
    var result = {task_info:{},study_info:{}};

    ep.all("task_info",function(task_id){
        task.gettaskele_allinfo({task_id:task_id},function(err,taskele_result){ if(err)  return callback(err);
            result.task_info = taskele_result;
            return callback(err,result);
        });
    })

    //console.log('study_task_id:',study_task_id);
    //获取学习的信息
    fun_get_studytask_info({study_task_id:study_task_id, isvalid:'1'},function(err,studytaskdoc){ if(err)  return callback(err);
        result.study_info = studytaskdoc;
         ep.emit("task_info", studytaskdoc.info.task_id);
    });
}

//=========================================================================================




//================================创建新的学习任务==============================================

//为符合条件的学习记录创建一个新的学习任务; 1.查找记录的下一个任务信息。 2.创建学习任务信息。 3.复制模板输出文件到学习文件的产出。

//获取指定任务节点的下一节点: 如果返回空，则表示为情景的最后一节点
function  fun_get_next_task(data,callback){
    _TASK.findOne(data,function(err,taskdoc){ if(err)  return callback(err);
        var step_id = taskdoc.step_id;
        _STEP.findOne({step_id:step_id},function(err,stepdoc){ if(err)  return callback(err); if(stepdoc==undefined) return callback("节点信息不存在"); 
            var next_step_id = stepdoc.next_step_id;
            if(next_step_id !='-1') {
                var wherejson = {step_id:next_step_id,isvalid:'1'};
                _TASK.findOne(wherejson,function(err,taskDoc){  return callback(err,taskDoc);  });
            } else { // 如果此步骤为此活动的最后一步， 则向上-活动级别搜索
                var activity_id = stepdoc.activity_id;
                _ACT.findOne({activity_id:activity_id},function(err,actdoc){
                    if(actdoc.next_step_id == '-1') return callback(err,null);
                    else fun_get_frist_task({activity_id:actdoc.next_step_id,isvalid:'1'},function(err,taskDoc){ return callback(err,taskDoc);  })
                });

            } //if end
        });
    });
}


//--获取一个指定活动的首任务
function fun_get_frist_task(data,callback){
    var wherejson_1 = data;
    //console.log('功能：获取一个指定活动的首任务：', wherejson_1)
    _ACT.findOne(wherejson_1,function(err,actdoc){ if(err )  return callback(err);
        if(actdoc == undefined ) { console.log("起点活动不存在"); return callback("起点活动不存在");}  
        //--开始查找第一步
        var wherejson_2 = {activity_id:actdoc.activity_id, is_startstep:'1' , isvalid:'1'};
        _STEP.findOne(wherejson_2,function(err,stepdoc){ if(err )  return callback(err);
            if(stepdoc == undefined ) { console.log("第一步不存在"); return callback("第一步不存在");}
            //--开始查找第一个详细任务
            var wherejson_3 = {step_id:stepdoc.step_id,  isvalid:'1'};
            _TASK.findOne(wherejson_3,function(err,taskdoc){ if(err )  return callback(err);
                if(taskdoc == undefined ) { console.log("第一步的具体任务不存在"); return callback("第一步的具体任务不存在"); }
                //console.log('功能：获取一个指定活动的首任务：', taskdoc)
                return callback(err,taskdoc);
            });
        });
    });
}


//查询一个学习记录， 下一个的任务。如果返回为空，则表示已是最后一个节点。
function search_log_next_task(wherejson,callback){
    var study_log_id = wherejson.study_log_id;
    _STUDY_LOG.findOne({study_log_id:study_log_id},function(err,logdoc){ if(err)  return callback(err); if(logdoc.is_over == '1') return callback(err,undefined);

        var ing_study_task_id = logdoc.ing_study_task_id;
         if(ing_study_task_id == '-1') { //第一次创建，则获取情景的首任务 ,是否需要检查链的完整性
                 //console.log('第一次创建，则获取情景的首任.');
                fun_get_frist_task({course_child_id:logdoc.course_child_id, is_startstep:'1' , isvalid:'1'},function(err,taskdoc){  return callback(err,taskdoc);  });    
         } else {
           
            _STUDY_TASK.findOne({study_task_id:ing_study_task_id },function(err,studytaskDoc){  if(err)  return callback(err);
                //console.log('学习任务信息：',studytaskDoc);
                fun_get_next_task({task_id:studytaskDoc.task_id},function(err,taskdoc){ 
                    return callback(err,taskdoc);
                });
            });
         } //if end
    });
}


//--复制模板任务中的输出文件模板，到新学习任务中: 1.查询task_ele中的'task_result'数据。 2。逐个将模板文件复制到学习文件中

//将模板中元素的文件复制到学习文件系统中去
function fun_copytaskFile_to_study(userinfo,eledoc, study_result_json,callback){
    //console.log('开始复制文件到学习系统',userinfo,eledoc,study_result_json)
    var userfolderName = userinfo.account + "_" + userinfo.user_id;
     _TASK_FILE.findOne({task_file_id:eledoc.task_file_id, isvalid:'1' },function(err,taskfiledoc){  if(err)  return callback(err);
        if(taskfiledoc == undefined)  return callback("任务的文件未找到"); 
        var task_filepath = taskfiledoc.filepath , 
        study_filepath = config[mgenv].study.rootpath + "/" + userfolderName +  "/" + eledoc.course_id +  "/" + eledoc.course_child_id;


        var diskname = taskfiledoc.filename + "_" + UUID.v1() + "." + taskfiledoc.filetype;
        
//console.log('文件路径信息：', task_filepath , study_filepath );
        mkdirpath(study_filepath,function(err){ if(err) return callback(err);
            study_filepath = study_filepath + "/" + diskname ;
            copyfile(task_filepath,study_filepath, function(err){  if(err) return callback(err);
                var studyfilejson = {study_file_id:UUID.v1(), task_file_id:eledoc.task_file_id,study_result_id:study_result_json.study_result_id, study_log_id:study_result_json.study_log_id,
                   study_task_id:study_result_json.study_task_id, course_child_id: study_result_json.course_child_id , user_id: userinfo.user_id,
                   filename:taskfiledoc.filename ,filetype:taskfiledoc.filetype , diskname:diskname,size: taskfiledoc.size , 
                   filepath:study_filepath, source_filepath: task_filepath, isvalid:'1' ,create_time: moment().format('YYYY-MM-DD HH:mm:ss')   };
                   
                   //console.log('插入文件信息:', studyfilejson);
                _STUDY_FILE.insert(studyfilejson,function(err,doctmp){ return callback(err,studyfilejson); });
            });
        });
     })
}

//将任务的模板的元素复制到学习系统中去
function fun_copy_taskEle_to_study(userinfo,taskdoc,studytaskdoc,callback){
    var returnFlag=0, result = [];
    //console.log('开始复制任务输出结果到学习系统：',userinfo,taskdoc,studytaskdoc);
    _TASK_ELE.find({task_id:taskdoc.task_id , ele:"task_result",isvalid:'1'} ).toArray(function(err,eledocs){ if(err)  return callback(err);
        if(eledocs.length <= 0) return callback(err,result);
        result = eledocs; 
        var study_result_json = [];
        var flag = 0, end =eledocs.length; 
        for(var i=0; i< eledocs.length; i++){
            (function(i){
                    var eledoc = eledocs[i], type=eledocs[i].type;     
                    study_result_json[i] = {study_result_id:UUID.v1(), study_task_id:studytaskdoc.study_task_id ,course_child_id: taskdoc.course_child_id , 
                    study_log_id:studytaskdoc.study_log_id , task_ele_id:eledocs[i].task_ele_id, user_id:studytaskdoc.user_id ,type:type ,isvalid:'1' ,
                     creater:studytaskdoc.user_id , create_time: moment().format('YYYY-MM-DD HH:mm:ss')  };
                    if (eledocs[i].type == 'text') study_result_json[i].txt = eledocs[i].txt;

                    console.log("插入的学习结果数据：", taskdoc, study_result_json[i]);
                    _STUDY_RESULT.insert(study_result_json[i],function(err,resdoc){ if(err)  return callback(err);
                        result[i].info =  study_result_json[i];
                        if(type=='office' || type=='upload' || type=='cloud_file' ) { //关于office的处理方法     
                            fun_copytaskFile_to_study(userinfo, eledoc, study_result_json[i],function(err,studyfiledoc){
                               if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                               result[i].file = studyfiledoc;
                               flag++;
                               if(flag == end) return callback(err,result)
                            });  //fun_copytaskFile_to_stud end

                        } else if(type=='front_task' ) { //如果为front_task类型: 1.找出front_task对应的学习任务ID 。 2.找出front结果的office_url作为此学习结果的office_url
                            flag++; if(flag == end) return callback(err,result);
                        } else if(type=='form') { //如果为表单， 复制表单模板到学习中去
                            var html_id = eledocs[i].html_id; 
                            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                            
                            //**** 1.复制表单； 2.更新study_result中的study_html_id , html_id  */
                            form.copyFormToStudy({ study_log_id:studytaskdoc.study_log_id ,   html_id:html_id , user_id :studytaskdoc.user_id　 },function(err, studyHtmlDoc){
                                if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

                               _STUDY_RESULT.update({ study_result_id: study_result_json[i].study_result_id  }, { $set: {study_html_id:studyHtmlDoc.study_html_id ,html_id : eledocs[i].html_id } }, { multi: true }, function (err, doc) {
                                    if (err) { socket.emit('begin_result', { code: 204, err: err }); return; }
                                    
                                     flag++; if(flag == end) return callback(err,result);
                               });      
                            })
                            //****  */

                        }else { flag++; if(flag == end) return callback(err,result)}

                    });
              })(i);
        } //for end
    });

}




//将任务的模板，复制到学习记录中
function fun_copy_task_to_study(userinfo ,  taskdoc, logdoc,callback){
        //--创建学习任务
          //--  1. 创建我的试题。  2.成功后将信息嵌入学习任务中
        //console.log('实例化：创建学习任务信息：', studytaskdoc);

       var studytaskdoc = {study_task_id:UUID.v1(), study_log_id:logdoc.study_log_id, course_child_id:logdoc.course_child_id,step_id:taskdoc.step_id ,
        task_id:taskdoc.task_id , user_id:logdoc.user_id  ,is_over:'0',  isvalid:'1' ,   start_time: moment().format('YYYY-MM-DD HH:mm:ss') ,
         question_id: taskdoc.question_id  , creater:logdoc.user_id  , create_time: moment().format('YYYY-MM-DD HH:mm:ss')};
                

        var ep =new EventProxy();

         ep.all('GO',function(){  //--添加描述事件
                _STUDY_TASK.insert(studytaskdoc,function(err,doc){ if(err)  return callback(err);
                    fun_copy_taskEle_to_study(userinfo , taskdoc,studytaskdoc,  function(err,eledocs){ if(err)  return callback(err);
                        studytaskdoc.eledocs =  eledocs;
                        return callback(err,studytaskdoc)
                    });   
                });
         });

         if( taskdoc.exam_id) {
                _QT.fun_init_myexam_V2({exam_id: taskdoc.exam_id  , user_id: logdoc.user_id }, function(err,myexamdoc){ if(err )  return callback(err);
                    studytaskdoc.myexam_id = myexamdoc.myexam_id;
                    ep.emit('GO');
                }); //_QT.fun_init_myexam_V2 end
         } else ep.emit('GO');

}




study.initExam_V3 = function (data,callback) {
    _QT.fun_init_myexam_V2({ exam_id: data.exam_id, user_id: data.user_id }, function (err, myexamdoc) {
        return callback(err, myexamdoc);  
    }); //_QT.fun_init_myexam_V2 end
}








//更新学习结果中的文件数据
study.updatestudyresult =  function(wherejson, data ,callback){
    _STUDY_RESULT.update(wherejson, { $set:data },{multi:true},function(err,doc){   return  callback(err); }); 
}




 //--开始更新学习记录的：ing_study_task_id 正在进行中的学习任务 ，ing_task_id 正在进行中的任务模板
 //-- last_study_task_id 上一个完成学习的任务， study_flow 学习任务流程
 //-- 更新学习任务的信息： next_study 下一个学习任务的节点 ， is_over：1  ， next_task： 对应下一个任务


//============函数：/更新活动信息，不含同步异步===================================
//---更新学习记录
function fun_updatestudylog(data,wherejson,callback){
    _STUDY_LOG.update( wherejson, { $set:data },{multi:true},function(err,doc){   return  callback(err); }); 
}

//---更新学习任务
function fun_updatestudytask(data,wherejson,callback){
    _STUDY_TASK.update( wherejson, { $set:data },{multi:true},function(err,doc){   return  callback(err); }); 
}



//提交正在学习的任务,创建下一个学习任务并返回学习任务数据
study.completestudytask = function (userinfo, data ,callback){
    var study_log_id = data.study_log_id;
    if(study_log_id == '' || study_log_id == undefined)  return callback('study_log_id参数不正确');
    _STUDY_LOG.findOne({study_log_id:study_log_id, user_id:userinfo.user_id },function(err,logdoc){ if(err)  return callback(err);
        if(logdoc.isvalid != '1') return callback('此课程已被注销');
        if(logdoc.is_over == '1') return callback('此课程已学习完成');
        create_new_studytask(userinfo, logdoc , function(err,newstudytaskdoc){  
            return callback(err,newstudytaskdoc);
        });
    });
}





//创建一个新的学习任务，如果学习完成，则返回 {is_over:'1'}
function create_new_studytask(userinfo,logdoc,callback){
       var study_log_id = logdoc.study_log_id; if(study_log_id=='' || study_log_id==undefined) return callback("study_log_id 参数不正确");
       
  
       //console.log('开始创建一个学习任务: 1.获取下一个任务信息');
       search_log_next_task({study_log_id:study_log_id},function(err,next_task_doc){

             if(err)  return callback(err);
             
             if(next_task_doc == undefined) { //如果没有下一个学习任务了,情境已学习完了
                 fun_updatestudylog({is_over:'1', end_time:moment().format('YYYY-MM-DD HH:mm:ss') } , {study_log_id:study_log_id} , function(err){ if(err)  return callback(err);
                    return callback(err,{is_over:'1'} );
                 });
                
             } else {

                    //console.log('成功获取下一次任务,开始实例化到学习任务中：',next_task_doc);
                    fun_copy_task_to_study(userinfo,next_task_doc, logdoc,function(err,studytaskdoc){ if(err)  return callback(err);
                        //console.log('新学习任务创建成功：',studytaskdoc);
                        //console.log("开始更新，学习记录：");
                 
                        var ing_study_task_id = logdoc.ing_study_task_id;
                        var newlogData = { ing_study_task_id:studytaskdoc.study_task_id , study_flow: logdoc.study_flow };
                        newlogData.study_flow.push(studytaskdoc.study_task_id1);
                        
                        fun_updatestudylog(newlogData, {study_log_id:study_log_id} , function(err){  if(err)  return callback(err);
                            if(ing_study_task_id == '-1') return callback(err,studytaskdoc);
                            var oldtask_data = {next_study:studytaskdoc.study_task_id , next_task:next_task_doc.task_id, end_time: moment().format('YYYY-MM-DD HH:mm:ss')  }
                            fun_updatestudytask(oldtask_data, {study_task_id:ing_study_task_id } ,function(err){
                                return callback(err,studytaskdoc)
                            });
                        })     
                    });
             }

       }); //search_log_next_task end
}
   


//获取正在学习中的任务信息
function fun_getingstudytask(userinfo,data , callback){
    //console.log("参数:", userinfo,data)
    var study_log_id = data.study_log_id;
    if(study_log_id == '' || study_log_id == undefined)  return callback('study_log_id参数不正确');
    var ep =new EventProxy();
    //console.log('参数DATA：', data);
    ep.all('get_study_task',function(logdoc){
        //console.log('触发获取学习任务.logdoc -- study_task_id_tmp：',logdoc );
        var study_task_id_tmp = logdoc.ing_study_task_id;
        fun_getstudytask_allinfo(study_task_id_tmp,function(err,result){  if(err)  return callback(err);
            course.getcourse_child({ course_child_id: logdoc.course_child_id }, function (err, course_child_info) {
                if (err) return callback(err);
                result.course_child_info = course_child_info;
                return callback(err, result);
            }); 
        });
    });

    _STUDY_LOG.findOne({study_log_id:study_log_id, user_id:userinfo.user_id },function(err,logdoc){ if(err)  return callback(err);
        if(logdoc == undefined )  return callback('学习记录不存在,请在学习前先创建学习记录');
        if(logdoc.isvalid != '1') return callback('此课程已被注销');
        if(logdoc.is_over == '1') return callback('此课程已学习完成');

        //console.log('学习记录信息：', logdoc );
        var ing_study_task_id = logdoc.ing_study_task_id;
        if(ing_study_task_id == '-1') { //如果为刚开始学习，则创建此学习记录的新学习任务
            //console.log('刚开始学习，则创建此学习记录的新学习任务');
            
            create_new_studytask(userinfo,logdoc,function(err,studydoc){  if(err)  return callback(err);
                 logdoc.ing_study_task_id = studydoc.study_task_id;
                 ep.emit('get_study_task',logdoc);
            })

        }  else {console.log('logdoc.ing_study_task_id:',logdoc.ing_study_task_id);   ep.emit('get_study_task',logdoc );  }


   }); //_STUDY_LOG.findOne end

}



   //获取正在学习的任务
study.getingstudytask = function(userinfo,data,callback){
    fun_getingstudytask(userinfo,data,function(err,result){ return callback(err,result);  });
}



function fun_getStudyFile(data,callback){
   _STUDY_FILE.findOne( data ,function(err,doc){  return callback(err,doc); });
}

study.getStudyFile = function(data,callback){
    fun_getStudyFile(data,function(err,result){ return callback(err,result);  });
}

study.getStudyStepFile = function (data, callback) {
    _STUDY_STEP_FILE.findOne(data, function (err, result) { return callback(err, result); });

}
//==========================================================================

function checkUserInDept(usersdata, user_id) {
    var result = { flag: false };
    
    for (var i = 0; i < usersdata.length; i++) {   
        if (usersdata[i].user_id == user_id) { result.flag = true; result.userdoc = usersdata[i]; }
    }
    return result;
}


//获取一个情景下指定机构学生的历史数据
study.getdeptusershistory = function (data, deptid, creater, callback) {
    var type = data.type, result = {};
    if (type != '0' && type != '1') return callback("type数据错误");
    //console.log('deptid:',deptid);
    Mysql.query("CALL  stroed_getdeptUsers('" + deptid + "')", function (err, tmpdocs) {
        if (err) return callback(err);
        var usersdata = tmpdocs[0];

        console.log("users:", data, usersdata );

        if (type == '0') { //单人
            result.usersdocs = []; var userdocs = [];
            _STUDY_LOG.find({ course_child_id: data.course_child_id ,isvalid: '1', is_over: '1' }).toArray(function (err, logDocs) {
                if (err) return callback(err);
                if (logDocs.length <= 0) return callback(err, result);
                //console.log("logDocs:", logDocs);
                var j = -1;
                for (var i = 0; i < logDocs.length; i++) {
                    var tmp = checkUserInDept(usersdata, logDocs[i].user_id);
                    //console.log("->", i, tmp );
                    if (tmp.flag    == true) {
                        
                        var usertmpdoc = tmp.userdoc; usertmpdoc.study_log_id = logDocs[i].study_log_id; usertmpdoc.over_time = logDocs[i].end_time;
                        //console.log('IN：', logDocs[i].study_log_id, usertmpdoc);

                        userdocs[++j] = {
                            user_id: tmp.userdoc.user_id ,
                            fullname: tmp.userdoc.fullname ,
                            account: tmp.userdoc.account  ,
                            study_log_id: logDocs[i].study_log_id,
                            over_time: logDocs[i].end_time };

                               //console.log('77777:', userdocs)
                    }
                } //for end

                //console.log("RRRRR:", userdocs);
                result.usersdocs = userdocs;
                return callback(err, result);
             });
        }

        if (type == '1') { //多人
            console.log('MANY!!');
            result.teams = []; var teams = [];
            _STUDY_LOG.find({ course_child_id: data.course_child_id, isvalid: '1', is_over: '1' }).toArray(function (err, logDocs) {
                if (err) return callback(err);
                if (logDocs.length <= 0) return callback(err, result);
                var returnFlag = 0, flag = 0, end = logDocs.length;
                for (var i = 0; i < logDocs.length; i++) {
                    console.log("I:", i, end, logDocs[i] );
                    (function (i) {
                        if (creater == logDocs[i].creater) {
                            var teamstmpdoc = { teaminfo: { orgtitle: logDocs[i].orgtitle, least: logDocs[i].least, most: logDocs[i].most, over_time: logDocs[i].end_time  } };
                            _STUDY_TEAM.find({ study_log_id: logDocs[i].study_log_id, isvalid: '1' }).toArray(function (err, users) {
                                if (err) return callback(err);
                                teamstmpdoc.teams = users;
                                teams[teams.length] = teamstmpdoc;
                                flag++;
                                console.log("flag:",flag);
                                if (flag == end) { result.teams = teams; return callback(err, result); }
                            });
                        } else {
                            flag++;
                            console.log("flag:", flag);
                            if (flag == end) { result.teams = teams; return callback(err, result); }
                        } //if end
                    })(i);
                } //for end


            }); //_STUDY_LOG.find end
        }

    }); //Mysql.query end





 
}


//查询学习记录
study.getstudycourses = function(data,callback) {
    var result = [];
    _STUDY_LOG.find(data).toArray(function(err,courseDocs){ if(err)  return callback(err);
        if(courseDocs.length <= 0) return callback(err,result);
        else {
            var tmparr =[] , processarr = [];
            for(var j=0; j<courseDocs.length; j++ ){
                if(tmparr.indexOf(courseDocs[j].course_child_id) == -1) { tmparr[tmparr.length] = courseDocs[j].course_child_id; processarr[processarr.length]= courseDocs[j];  }
            }
            //console.log('去除重复的课程',processarr);

            var returnFlag = 0 , flag = 0,  end = processarr.length;
            for(var i=0; i<processarr.length; i++ ){
                (function(i){
                        course.getcourse_child_V2({course_child_id:processarr[i].course_child_id},function(err,childDoc){
                            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                            childDoc.study_log_id = processarr[i].study_log_id;
                            result[i] = childDoc;
                            flag++;
                            if(flag == end ) return callback(err, result);
                        }); 
                })(i);           
            } //for end

        } //if end
    }); //_STUDY_LOG.find   end
}




study.downloadOfficeFile_study = function(id,url,callback){
    if(id == '' || id == undefined)  return callback('id参数不正确');
    _STUDY_FILE.findOne({study_file_id:id, isvalid:'1'}, function(err,filedoc){  if(err || !filedoc) return callback(err);
        var filepath = filedoc.filepath , history = filedoc.history  , filename = filedoc.filename   ,  filetype = filedoc.filetype ,diskname = filedoc.diskname ;

        var newdiskname =  filename + "_" +  UUID.v1() + "." +  filetype  , newfilepath = filepath.substr(0, filepath.lastIndexOf("/") + 1  )  +  newdiskname;
        //console.log("url:",url,newfilepath);

        var options = { cache: 'file' } ;
        var request = require('then-request');   
        request('GET', url , options).done(function (res) {
            fs.writeFileSync(newfilepath,res.getBody());
            //将URL写入file数据库中
            var newhistory =  history + "-->" + diskname;
            _TASK_FILE.update( {task_file_id:id, isvalid:'1' }, { $set:{office_url: url ,diskname:newdiskname , history:newhistory } },{multi:true},function(err,doc){   return  callback(err); }); 
        });

    }); //_TASK_FILE.findOne end 
}





//**********************************************/
//**********************************************/
//===***************多人课程学习*******************===/
//**********************************************/
//**********************************************/



//获取指定step节点的下一节点: 如果返回空，则表示为情景的最后一节点
function  fun_get_next_step(data,callback){
        var step_id = data.step_id;
        _STEP.findOne({step_id:step_id},function(err,stepdoc){ if(err)  return callback(err); if(stepdoc==undefined) return callback("节点信息不存在"); 
            var next_step_id = stepdoc.next_step_id;
            if(next_step_id !='-1') {
                var wherejson = {step_id:next_step_id,isvalid:'1'};
                _STEP.findOne(wherejson,function(err,nextstepDoc){  return callback(err,nextstepDoc);  });
            } else { // 如果此步骤为此活动的最后一步， 则向上-活动级别搜索
                var activity_id = stepdoc.activity_id;
                _ACT.findOne({activity_id:activity_id},function(err,actdoc){
                    if(actdoc.next_step_id == '-1') return callback(err,null);
                    else fun_get_frist_step({activity_id:actdoc.next_step_id,isvalid:'1'},function(err,nextstepDoc){ return callback(err,nextstepDoc);  })
                });

            } //if end
        });
}


//--获取一个指定活动的首步骤
function fun_get_frist_step(data,callback){
    var wherejson_1 = data;
    //console.log('功能：获取一个指定活动的首任务：', wherejson_1)
    _ACT.findOne(wherejson_1,function(err,actdoc){ if(err )  return callback(err);
        if(actdoc == undefined ) { console.log("起点活动不存在"); return callback("起点活动不存在");}  
        //--开始查找第一步
        var wherejson_2 = {activity_id:actdoc.activity_id, is_startstep:'1' , isvalid:'1'};
        _STEP.findOne(wherejson_2,function(err,stepdoc){ if(err )  return callback(err);
            if(stepdoc == undefined ) { console.log("第一步不存在"); return callback("第一步不存在");}
            return callback(err,stepdoc);
        });
    });
}


// //查询一个学习记录， 下一个的任务。如果返回为空，则表示已是最后一个节点。
// function search_log_next_task(wherejson,callback){
//     var study_log_id = wherejson.study_log_id;
//     _STUDY_LOG.findOne({study_log_id:study_log_id},function(err,logdoc){ if(err)  return callback(err); if(logdoc.is_over == '1') return callback(err,undefined);

//         var ing_study_task_id = logdoc.ing_study_task_id;
//          if(ing_study_task_id == '-1') { //第一次创建，则获取情景的首任务 ,是否需要检查链的完整性
//                  console.log('第一次创建，则获取情景的首任.');
//                 fun_get_frist_task({course_child_id:logdoc.course_child_id, is_startstep:'1' , isvalid:'1'},function(err,taskdoc){  return callback(err,taskdoc);  });    
//          } else {
           
//             _STUDY_TASK.findOne({study_task_id:ing_study_task_id },function(err,studytaskDoc){  if(err)  return callback(err);
//                 console.log('学习任务信息：',studytaskDoc);
//                 fun_get_next_task({task_id:studytaskDoc.task_id},function(err,taskdoc){ 
//                     return callback(err,taskdoc);
//                 });
//             });
//          } //if end
//     });
// }




//检查是否所有队员已完成此步骤
function fun_check_team_step_all_finished(step_id,teamdocs,callback){
        var result = true;
        var returnFlag = 0, flag = 0, end = teamdocs.length;
    
        for(var i=0; i<teamdocs.length; i++ ){
            (function(i){
                var user_id = teamdocs[i].user_id;
                _STUDY_STEP.findOne({ study_log_id: teamdocs[i].study_log_id ,   step_id: step_id, user_id: user_id, isvalid: '1' }, function (err, studyStepDoc) {
                    //console.log('OOOO:', i,err, studyStepDoc);
                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                    if(studyStepDoc == undefined) {if(returnFlag==0){returnFlag=1; return callback("数据错误，检测到有队员没有此步骤的学习记录"); } else return ; }
                    if(studyStepDoc.isstart != '3') result=false;
                    flag++;
                    if(flag == end ) return callback(err, result);
                }); //_STUDY_STEP.findOne end
            })(i);           
        } //for end
}


//为团队建立学习步骤,  1.创建学习步骤。 2.更改study_log： isstart：‘1’，ing_step_id：''
function fun_createTeamStudyStep(data, callback) {
    //console.log("进入创建学习的Step:", data );
    var step_id = data.step_id, study_log_id = data.study_log_id ;
    _STUDY_TEAM.find({ study_log_id: study_log_id, isvalid: '1' }).toArray(function(err,teamdocs){
        if(err) return callback(err);
        if(teamdocs.length <= 0 ) return callback("未检测到参与此次组织的队员");
        //console.log("团队信息：", teamdocs);
        var studyStepArr = [];
        for(var i=0; i< teamdocs.length; i++){
            studyStepArr[studyStepArr.length] = {study_step_id:UUID.v1(),study_log_id:study_log_id,step_id:step_id,
                study_team_id:teamdocs[i].study_team_id, user_id:teamdocs[i].user_id ,isstart:'0' , isvalid:'1' , create_time: moment().format('YYYY-MM-DD HH:mm:ss')
            };
        } //for end  
        
        //console.log("step Arr:",studyStepArr);
        _STUDY_STEP.insertMany(studyStepArr, function (err, stepdocs) { if(err) return callback(err);
            _STUDY_LOG.update( {study_log_id:study_log_id}, { $set:{isstart:'1', ing_step_id: step_id} },{multi:true},function(err,doc){   return  callback(err,stepdocs); }); 
        });
                   
    }); //_STUDY_TEAM.find end

}


function fun_getUsers(teamdocs){
    var result = [];
    for(var i=0;i<teamdocs.length;i++)
       result[result.length] ={study_team_id:teamdocs[i].study_team_id ,  user_id : teamdocs[i].user_id  , fullname : teamdocs[i].fullname, account : teamdocs[i].account  };
    return result;
}

function fun_getRoles(taskDocs){
    var result = [];
    for(var i=0;i<taskDocs.length;i++)
       result[result.length] ={task_id:taskDocs[i].task_id ,  rolename : taskDocs[i].rolename  ,title : taskDocs[i].title  };
    return result;
}

//将任务的模板，复制到多人课程学习实例中去
function fun_copy_task_to_study_many(userinfo ,  taskdoc, logdoc,study_stepdoc, callback){
        //--创建学习任务
          //--  1. 创建我的试题。  2.成功后将信息嵌入学习任务中
        //console.log('实例化：创建学习任务信息：', studytaskdoc);
    //console.log('AAA:', userinfo, taskdoc, logdoc, study_stepdoc );
    var studytaskdoc = {study_task_id:UUID.v1(), study_log_id:logdoc.study_log_id, course_child_id:logdoc.course_child_id,step_id:taskdoc.step_id ,
        task_id: taskdoc.task_id, user_id: study_stepdoc.user_id  ,is_over:'0', study_step_id:study_stepdoc.study_step_id, rolename:taskdoc.rolename,
        isvalid: '1', start_time: moment().format('YYYY-MM-DD HH:mm:ss'), question_id: taskdoc.question_id, creater: study_stepdoc.user_id  , create_time: moment().format('YYYY-MM-DD HH:mm:ss')};

    var ep =new EventProxy();

    ep.all('GO',function(){  //--添加描述事件
        _STUDY_TASK.insert(studytaskdoc,function(err,doc){ if(err)  return callback(err);
            fun_copy_taskEle_to_study(userinfo , taskdoc,studytaskdoc,  function(err,eledocs){ if(err)  return callback(err);
                studytaskdoc.eledocs =  eledocs;
                
                //更新STDUY_STEP
                _STUDY_STEP.update( {study_step_id:study_stepdoc.study_step_id}, { $set:{rolename:taskdoc.rolename , isstart:'1' } },{multi:true},function(err,doc){  
                     return  callback(err,studytaskdoc); 
                }); 
            
            }); //fun_copy_taskEle_to_study end
        });
    });

    if( taskdoc.exam_id) {
        _QT.fun_init_myexam_V2({ exam_id: taskdoc.exam_id, user_id: study_stepdoc.user_id }, function(err,myexamdoc){ if(err )  return callback(err);
            studytaskdoc.myexam_id = myexamdoc.myexam_id;
            ep.emit('GO');
        }); //_QT.fun_init_myexam_V2 end
    } else ep.emit('GO');

}


//实例化协作文档, 文件名为filename +  study_log_id +  step_id
function fun_copy_step_onlyoffice(study_log_id, step_id, callback) {
    //console.log("开始复制协作文档：", study_log_id, step_id  );
    _TASK_ELE.find({ belong: 'step', isvalid: '1', step_id: step_id }).toArray(function (err, eleDocs) {
        if (err) callback(err); if (eleDocs.length <= 0) return callback(err);
        //console.log("XXXXX协作文档：", eleDocs);
        var returnFlag = 0, flag = 0, end = eleDocs.length;
        for (var i = 0; i < eleDocs.length; i++) {
            (function (i) {
                var eleDoc = eleDocs[i], task_file_id = eleDocs[i].task_file_id;
                _TASK_FILE.findOne({ task_file_id: task_file_id }, function (err, taskFileDoc) {
                    if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }

                    if (taskFileDoc == undefined) { flag++; if (flag == end) return callback(err);  }

                    if (taskFileDoc != undefined) {
                        var filepath = taskFileDoc.filepath, filename = taskFileDoc.filename, filetype = taskFileDoc.filetype;
                        var diskname = "stepStudy_" + filename + "_" + study_log_id + "_" + step_id + "." + filetype;
                        var targetpath = config[mgenv].study.step + "/" + diskname;

                        //console.log('实例化协作文档：', filepath, targetpath);

                        mkdirpath(config[mgenv].study.step, function (err) {
                            if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                            copyfile(filepath, targetpath, function (err) {
                                if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }

                                var stepStudyfilejson = {
                                    study_step_file_id: UUID.v1(), study_log_id: study_log_id,  step_id: step_id  , isvalid: '1', create_time: moment().format('YYYY-MM-DD HH:mm:ss') ,
                                    filename: filename, filetype: filetype, diskname: diskname, filepath: targetpath
                                };
                                //console.log('插入协作文档信息:', stepStudyfilejson);
                                _STUDY_STEP_FILE.insert(stepStudyfilejson, function (err, doctmp) {
                                    if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                                    flag++;
                                    if (flag == end) return callback(err);
                                });
                            });
                        });
                    }
                }); // _TASK.findOne  end

            })(i);
        } // for end


    });

}




//为多人课程的这个step的所有的队员创建任务
//如果角色分配完成：
//1.获取step模板信息   2.获队员信息  3.获取study_step信息 4.为各个用户创建任务。 5.更新各个用户study_step学习状态。 3.实例化step的学习文档
function fun_createStep_Task_many(study_log_id,step_id, roles_userInfo, callback){ 
    _STUDY_LOG.findOne({study_log_id:study_log_id },function(err,study_logDoc){ if(err)  return callback(err);
        _STEP.findOne({step_id:step_id},function(err,stepDoc){ if(err)  return callback(err);
            _STUDY_TEAM.find({ study_log_id: study_log_id, isvalid: '1' }).toArray(function(err,teamdocs){ if(err)  return callback(err);
                var roles = roles_userInfo.roles, users = roles_userInfo.users;
                if (teamdocs.length <= 0) return callback("此次学习没有团队成员");

                var users_arr = []; for (var user_id in users) users_arr[users_arr.length] = {
                    user_id: user_id,
                    socketid: users[user_id].socketid ,
                    task_id: users[user_id].task_id  ,
                    rolename: users[user_id].rolename,
                    account: users[user_id].account };


                console.log("实例化任务：",users_arr);
                    var returnFlag = 0, flag = 0, end = users_arr.length;
                    //console.log("实例化队员任务：", study_log_id, step_id, roles_userInfo,  users_arr );
                    for (var i = 0; i < users_arr.length; i++) {
                        (function (i) {
                            var userinfo = users_arr[i]; 
                            //1. 获取 taskdoc , 2.获取 study_stepdoc
                            _TASK.findOne({ task_id: users_arr[i].task_id }, function (err, taskdoc) {
                                    if (err) { console.log(err); return callback(err); }
                                    _STUDY_STEP.findOne({ study_log_id: study_log_id, step_id: step_id, user_id: users_arr[i].user_id, isvalid: '1' }, function (err, study_stepdoc) {
                                        if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                                        fun_copy_task_to_study_many(users_arr[i] , taskdoc, study_logDoc, study_stepdoc, function (err) {
                                            if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                                            flag++;
                                            if (flag == end) { //5.更新各个用户study_step学习状态。 
                                                //console.log("实例化完成！");
                                                _STUDY_STEP.update({ study_log_id: study_log_id, step_id: step_id, isvalid: '1' }, { $set: { isstart: '2' } }, { multi: true }, function (err, doc) {
                                                    //实例化step的协作文档
                                                    //console.log("实例化step的协作文档！");
                                                    fun_copy_step_onlyoffice(study_log_id, step_id, function (err) {
                                                        return callback(err);
                                                    });
                                                });
                                            } //if end

                                        }); //fun_copy_task_to_study_many end 
                                    }) //_STUDY_STEP.findOne end
                            }); //_task.findOne end

                        })(i);
                    } //for end   

                

            }); // _STUDY_TEAM.find end
        }); //_STEP.findOne end
    }); //_STUDY_LOG.findOne end
}


study.createStep_Task_many = function(study_log_id,step_id, roles_userInfo, callback){ 
    fun_createStep_Task_many(study_log_id,step_id, roles_userInfo,function(err){ callback(err)});
}





//多人课程的下一步操作
study.getlearn_next = function(data,callback){
    var study_log_id = data.study_log_id, result={};
    var ep =new EventProxy();

    var  next_Step_id ='', teamdocs_GO = [],logDoc_GO={}, nextStepDoc_GO = {} ;

    ep.all('GO',function(){  //--添加描述事件
        fun_createTeamStudyStep({study_log_id:study_log_id,step_id:next_Step_id}, function(err, study_step_docs){
            if (err) return callback(err);
            console.log("SSTTT:",{ step_id: next_Step_id});
            _TASK.find({ step_id: next_Step_id, isvalid: '1' }).toArray(function (err, taskDocs) {
                console.log("DDDDOS:", taskDocs);
                if(taskDocs.length <= 0) return callback("课程数据错误，步骤下没有任务");
                
                var  step_info = nextStepDoc_GO;
                if (taskDocs.length > 1) { //多角色情况 下一步的人员未开始选定，返回人员及角色信息
                    
                    var users = fun_getUsers(teamdocs_GO), roles = fun_getRoles(taskDocs); 
                    result = { flag: '0', users: users, roles: roles, step_info: step_info };
                    //console.log("多角色情况：",result);
                    return callback(err, result);
                } //if end 

                if(taskDocs.length == 1 ) { //单角色情况：1。为所有队员创建相同任务。返回成功标识
                     var  users = {}, taskdoc=taskDocs[0],  roles={};
                     roles[taskdoc.task_id] = {task_id:taskdoc.task_id, rolename:taskdoc.rolename } ;

                     for (var i = 0; i < teamdocs_GO.length; i++) users[teamdocs_GO[i].user_id] = { user_id: teamdocs_GO[i].user_id, account: teamdocs_GO[i].account  ,  task_id:taskdoc.task_id, fullname:teamdocs_GO[i].fullname, rolename: taskdoc.rolename   }
                     var roles_userInfo = {roles:roles , users:users }
                     fun_createStep_Task_many(study_log_id,step_info.step_id, roles_userInfo,function(err){
                        if(err) return callback(err);    
                        result={flag:'3',  users:users,roles:roles, step_info:step_info}; 
                        return callback(err, result);
                     });
                } //if end

            }); //_TASK.find end 

        }); //fun_createTeamStudyStep end
    });



    _STUDY_TEAM.find({ study_log_id: study_log_id, isvalid: '1' }).toArray(function(err,teamdocs){
        if(err) return callback(err); if(teamdocs.length <= 0 ) return callback("未检测到参与此次组织的队员");
        teamdocs_GO = teamdocs;
        _STUDY_LOG.findOne({study_log_id:study_log_id, isvalid:'1'}, function(err,logDoc){
            if(err) return callback(err); if(logDoc == undefined) return callback("未检测到此课程组织");
            logDoc_GO = logDoc; 
            //console.log("学习记录：", logDoc_GO);
            if(logDoc.ing_step_id == '-1'   ) { //情况1：首次学习。获取首次学习step
                //console.log("A:首次学习");
                    var course_child_id = logDoc.course_child_id;
                    _ACT.findOne({course_child_id:course_child_id , is_startstep:'1' , isvalid:'1' },function(err,actDoc){
                        if(err) return callback(err); if(actDoc == undefined) return callback("未检测到此课程的初始活动");    
                        fun_get_frist_step({activity_id: actDoc.activity_id},function(err,nextStepDoc){ 
                            if (err) return callback(err); nextStepDoc_GO = nextStepDoc;
                            //console.log("B:首次活动信息:", nextStepDoc);
                            next_Step_id = nextStepDoc.step_id;   ep.emit('GO');
                        }); //fun_get_frist_step END
                    }); //_ACT.findOne end

             } else {  //开始下一步的准备工作 ,1.检查是否所有队员已完成此步骤
                
                var ing_step_id = logDoc.ing_step_id;
                //console.log('AAAAAAAAAAAAAA:', ing_step_id, teamdocs );
                 fun_check_team_step_all_finished(ing_step_id, teamdocs, function (err, flag) {
                     //console.log('BBBBBB:', flag );
                     if(err) return callback(err); if(!flag) return callback("此步骤尚有队员未完成");
                     fun_get_next_step({ step_id: ing_step_id }, function (err, nextdoc) {
                         //console.log('LLLLL:',err, nextdoc);
                         if (err) return callback(err); nextStepDoc_GO = nextdoc;
                          
                        if (nextdoc == null) {
                            _STUDY_LOG.update({ study_log_id: study_log_id }, { $set: { isstart: '2', is_over: '1', end_time: moment().format('YYYY-MM-DD HH:mm:ss') } }, { multi: true }, function (err, doc) {
                                if (err) return callback(err);
                                result = { flag: '4' };
                                return callback(err, result);
                            });
                        } else next_Step_id = nextdoc.step_id;  ep.emit('GO');  
                    }); // fun_get_next_step end
                 }); //fun_check_team_step_all_finished end


            } //if end

        }); //_STUDY_LOG.findOne end 

    }); //_STUDY_TEAM.find  end
    


}

study.gettaskhistory = function (data, callback) {
    var study_log_id = data.study_log_id, user_id = data.user_id, task_id = data.task_id;
    _STUDY_TASK.findOne({ study_log_id: study_log_id, task_id: task_id ,  user_id: user_id , isvalid:'1' }, function (err,studyTaskDoc) {
        if (err) return callback(err);
        if (studyTaskDoc == undefined) return callback("用户的此任务不存在");
        fun_getstudytask_allinfo(studyTaskDoc.study_task_id, function (err, allinfo) {
            if (err) return callback(err);
            //检测是否为多人学习的任务   
            if (studyTaskDoc.study_step_id == undefined) return callback(err, allinfo);
            else {  //获取协作文档

                _STUDY_STEP.findOne({ study_step_id: studyTaskDoc.study_step_id , isvalid: '1' }, function (err, studyStepDoc) {
                    if (err) return callback(err);
                    allinfo.study_step_info = studyStepDoc;
                    _STUDY_STEP_FILE.find({ study_log_id: studyTaskDoc.study_log_id, step_id: studyTaskDoc.step_id, isvalid: '1' }).toArray(function (err, studyStepFileDocs) {
                        if (err) return callback(err);
                        var studyStepFile = [];

                        //console.log("学习步骤的文档SSSSSSSSSSSSSSSSS：", { study_log_id: study_log_id, step_id: studyStepDoc.step_id, isvalid: '1' } , studyStepFileDocs );
                        //console.log('allinfo:', allinfo);
                        for (var i = 0; i < studyStepFileDocs.length; i++) studyStepFile[i] = { study_step_file_id: studyStepFileDocs[i].study_step_file_id, study_step_id: studyStepFileDocs[i].study_step_id, step_id: studyStepFileDocs[i].step_id, filename: studyStepFileDocs[i].filename, filetype: studyStepFileDocs[i].filetype };

                        allinfo.study_step_info.files = studyStepFile;

                        return callback(err, allinfo);

                    }); //_STUDY_STEP_FILE.find end

                });//_STUDY_STEP.findOne end





            }

        }); //fun_getstudytask_allinfo  end

    }) //_STUDY_TASK.findOne end
}





//获取正在学习的信息
 study.getlearning_many = function(data,callback) {
     var study_log_id = data.study_log_id , user_id = data.user_id;
     _STUDY_TEAM.findOne({study_log_id:study_log_id ,user_id:user_id , isvalid:'1'  },function(err,teamdoc){
        if(err) return callback(err);
        if(teamdoc == undefined) return callback("未检测到团队中有此队员");

        _STUDY_LOG.findOne({study_log_id:study_log_id, isvalid:'1'}, function(err,logDoc){
            if(err) return callback(err);
            if(logDoc == undefined) return callback("未检测到此课程组织");
            
            if (logDoc.ing_step_id == '-1') return callback("此次课程组织尚未开始，请先组队");
            if (logDoc.is_over == '1') return callback(err, {is_over: '1'});

            var ing_step_id = logDoc.ing_step_id;

            _STUDY_STEP.findOne({ study_log_id:study_log_id,step_id: ing_step_id, user_id:user_id, isvalid:'1'  },function(err,studystepdoc){
                if(err) return callback(err);
                var isstart = studystepdoc.isstart;
                if(isstart=='0' || isstart=='1' ) { //选角色阶段

                    var result = {flag:'0', step_id: ing_step_id};
                    return callback(err,result);

                } else if (isstart == '2' || isstart == '3') { //提取学习任务信息

                    _STUDY_STEP.findOne({ study_step_id: studystepdoc.study_step_id, isvalid: '1' }, function (err, studyStepDoc) {
                        if (err) return callback(err);
                        course.getcourse_child({ course_child_id: logDoc.course_child_id }, function (err, course_child_info) {
                            if (err) return callback(err);

                            _STUDY_TASK.findOne({ study_step_id: studystepdoc.study_step_id, isvalid: '1' }, function (err, studyTaskDoc) {
                                if (err) return callback(err);
                                var study_task_id = studyTaskDoc.study_task_id;
                                fun_getstudytask_allinfo(study_task_id, function (err, allinfo) {
                                    if (err) return callback(err);


                                    allinfo.course_child_info = course_child_info, allinfo.study_step_info = studyStepDoc, allinfo.flow = teamdoc.study_flow;
                                    
                                    _STUDY_STEP_FILE.find({ study_log_id: study_log_id, step_id: studyStepDoc.step_id, isvalid: '1' }).toArray(function (err, studyStepFileDocs) {
                                        if (err) return callback(err);
                                        var studyStepFile = [];

                                        //console.log("学习步骤的文档SSSSSSSSSSSSSSSSS：", { study_log_id: study_log_id, step_id: studyStepDoc.step_id, isvalid: '1' } , studyStepFileDocs );
                                        for (var i = 0; i < studyStepFileDocs.length; i++) studyStepFile[i] = { study_step_file_id: studyStepFileDocs[i].study_step_file_id, study_step_id: studyStepFileDocs[i].study_step_id, step_id: studyStepFileDocs[i].step_id, filename: studyStepFileDocs[i].filename, filetype: studyStepFileDocs[i].filetype };
                                        allinfo.study_step_info.files = studyStepFile;
                                        var result = { flag: '2', step_id: ing_step_id, info: allinfo };
                                        return callback(err, result);

                                    }); //_STUDY_STEP_FILE.find end
                                }); //fun_getstudytask_allinfo end
                            }); //_STUDY_TASK.findOne end

                        }); //course.getcourse_child end
                    }); //_STUDY_STEP.findOne end

                } 

            }); //_STUDY_STEP.findOne end

        }); //_STUDY_LOG.findOne end

     }); //_STUDY_TEAM.findOne end 



 } //study.getlearning_many end 

function fun_getTalkingInfo(wherestr,callback) {
    var table = config[mgenv].mysql.header + "_study_talking";
    var sqlstr = "select * from `" + table + "` where " + wherestr;
    console.log(sqlstr);
    Mysql.query(sqlstr, function (err, docs) {
        return callback(err, docs);
    });   
}






 study.getTodayTalkingInfo = function (data, callback) {
     var datetime = moment().format('YYYY-MM-DD HH:mm:ss') , monthTmp = datetime.getMonth() + 1  
         , startDate = datetime.getFullYear() + "-" + monthTmp + "-" + datetime.getDate() + " 00:00:00"
             , endDate = datetime.getFullYear() + "-" + monthTmp + "-" + datetime.getDate() + " 23:59:59";
     var wherestr = " study_log_id = '" + data.study_log_id + "' and  isvalid='1' and  sendtime > '" + startDate + "' and  sendtime <  '" + endDate + "'";
     //console.log(wherestr);

     fun_getTalkingInfo(wherestr, function (err, result) {
         return callback(err, result);
     });
 }


 study.saveTalkingInfo = function (data, callback) {
     var table = config[mgenv].mysql.header + "_study_talking";
     templater.add(table, data, function (err, doc) {
         return callback(err, doc);
     });
 }



 study.getStudyFormByStudyresult = function (study_html_ids,study_log_id,callback  ){
     var result = null;
     var returnFlag = 0, flag = 0, end = study_html_ids.length;
     for(var i=0;i< study_html_ids.length;i++) {
        (function (i) {
            _STUDY_RESULT.findOne({study_log_id:study_log_id , study_html_id: study_html_ids[i],  isvalid:'1'  },function(err,doc){ 
                if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; } 

                if(doc!=undefined) result = study_html_ids[i]; 

                flag++;
                if(flag == end) { 
                    if(result == null)  return callback("实例化表单未找到");
                    else return callback(err, result );
                
                } //if end
            });//_STUDY_RESULT.findOne end
        })(i);
     }
    
 }





module.exports = study;






