var Mysql = require("../DB/mysql");
var templater = require("./templater");
//var async = require("async");
var config = require("../../config/config.json");
var fs = require('fs');
var EventProxy = require('eventproxy');
var path = require('path');
//var formidable = require('formidable');
var UUID = require('uuid');
//var mongoClient =  require("./mongoClient");

var mongoDB =  require("../DB/mongodb");

var mgenv = global.mgENV;
//console.log(global.mongoDB);

var _ACT =  global.mongoDB.collection.activity;
var _STEP = global.mongoDB.collection.step;
var _TASK = global.mongoDB.collection.concrete_task;

var _DES =  global.mongoDB.collection.des;
var _TASK_RES =  global.mongoDB.collection.task_result;
var _TASK_FILE =  global.mongoDB.collection.task_file;

var _STUDY_LOG = global.mongoDB.collection.study_log;

function course(data) {
     this.data = data;
}



//============获取课程信息=================================================
    

//****获取所有步骤的集合***/
function fun_getSTEPall(activity_id ,callback){
    var returnFlag = 0 , result = {};            
    _STEP.find({activity_id:activity_id , isvalid:'1'} ).toArray( function(err,stepdocs){ if(err) return callback(err); 
          //console.log("步骤：", stepdocs);
          if(stepdocs.length <= 0) return callback(err, stepdocs);  

          var flag = 0,  end = stepdocs.length;
          for(var i=0; i<stepdocs.length; i++ ){
               result[stepdocs[i].step_id] = stepdocs[i];
               //console.log("获取任务：", i);
               (function(i){

                    fun_getTASKall({step_id:stepdocs[i].step_id , isvalid:'1' },function(err,taskdocs){
                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                        
                        result[stepdocs[i].step_id].tasks = taskdocs;
                        flag++;
                        if(flag == end ) return callback(err, result);
                    }); 
               })(i);           
          } //for end
    });

}


   //***获取活动的所有集合 */
function fun_getAllACTs(course_child_id,callback){
    var returnFlag = 0 , result = {};
    _ACT.find({course_child_id:course_child_id , isvalid:'1'}).toArray(function(err, actdocs){ if(err) return callback(err); 
        //console.log("活动列表:", actdocs)
        if(actdocs.length <= 0) return callback(err, actdocs);

        var flag = 0,  end = actdocs.length;
        for(var i=0; i<actdocs.length; i++ ){
            result[actdocs[i].activity_id] = actdocs[i];
            
            //console.log("获取步骤",i);
            (function(i){
                fun_getSTEPall(actdocs[i].activity_id ,function(err,stepdocs){
                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                    
                    result[actdocs[i].activity_id].steps = stepdocs;
                    flag++;
                    if(flag == end ) return callback(err, result);
                }); 
            })(i);
        } //for end
    }); //_ACT.find end 
}


//****获取情景的所有结合 */
function fun_getcourse_child(data,callback){
    var result = {info:{}  } ,course_child_id = data.course_child_id;
    var table =  config[mgenv].mysql.header + "_cd_course_child";
    var sqlstr = "select * from  " + table + " where isvalid='1' and course_child_id = '" + course_child_id + "' ";

    //console.log(sqlstr);
    Mysql.query(sqlstr,function(err,docs){ if(err) return callback(err);
        if(docs.length <= 0) return callback("未查询到此课程"); 
        //console.log(docs);
        result = docs[0];
        delete result.isvalid;  delete result.creater;  delete result.updater;   
        
        //console.log("1.开始获取活动：")
        fun_getAllACTs(course_child_id, function(err,fullinfodocs){
            if(err) return callback(err);
            result.activities = fullinfodocs;
            return callback(err, result);
        });

    }); //Mysql.query end
}


function getcourse_child_V2(data,callback){
    var result = { } ,course_child_id = data.course_child_id;
    var table =  config[mgenv].mysql.header + "_cd_course_child";
    var sqlstr = "select * from  " + table + " where isvalid='1' and course_child_id = '" + course_child_id + "' ";

    console.log(sqlstr);
    Mysql.query(sqlstr,function(err,docs){ if(err) return callback(err);
        if(docs.length <= 0) return callback(err,result); 

        result = docs[0];
        delete result.isvalid;  delete result.creater;  delete result.updater;  delete result.create_time;
        delete result.update_time;  delete result.remark;  delete result.iscompleted;  delete result.type;

        return callback(err,result); 
    }); //Mysql.query end
}

//携带多人课程是否被组织
function getcourse_child_V3(data, callback) {
    var  course_id = data.course_id;      
    var table = config[mgenv].mysql.header + "_cd_course_child";
    var sqlstr = "select course_child_id,course_id,title, type , des from  " + table + " where isvalid='1' and course_id = '" + course_id + "' ";

    console.log(sqlstr);
    Mysql.query(sqlstr, function (err, docs) {
        if (err || docs.length <= 0) return callback(err, docs);

        var returnFlag = 0, flag = 0, end = docs.length;
        for (var i = 0; i < end; i++) {
            (function (i) {
                course_child_id = docs[i].course_child_id, type = docs[i].type;

                if (type == '1') { //如果为多人课程，则查找是否被组织过了
                    _STUDY_LOG.find({ course_child_id: course_child_id, isvalid: '1' }).toArray(function (err, logDocs) {
                        if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                        if (logDocs.length <= 0) docs[i].isOrg = '0'; else docs[i].isOrg = '1';
                        flag++; if (flag == end) return callback(err, docs);

                    });
                } else {
                    flag++;
                    if (flag == end)  return callback(err, docs);
                } 

            })(i);  
            
        }

    }); //Mysql.query end

}


course.getcourse_child = function(data,callback){
    fun_getcourse_child(data,function(err,result){ return callback(err,result); });
}



course.getcourse_child_V2 = function(data,callback){
    getcourse_child_V2(data,function(err,result){ return callback(err,result); });
}


//============================================================================



//============获取课程信息=================================================


//****获取课程下的所有的情景*/
function fun_getcourse_childs(data,callback){
    var course_id = data.course_id;
    var table =  config[mgenv].mysql.header + "_cd_course_child";
    var sqlstr = "select * from  " + table + " where isvalid='1' and course_id = '" + course_id + "' ";

    //console.log(sqlstr);
    Mysql.query(sqlstr,function(err,docs){ return callback(err,docs);     }); //Mysql.query end
}



//****获取给定机构及机构所有父节点的课程信息*/

//去除数组重复数据
function unique(arr1) { 
    var arr = [];    //定义一个临时数组  
    for (var i = 0; i < arr1.length; i++)    if (arr.indexOf(arr1[i]) == -1) arr.push(arr1[i]);
    return arr;
}  

function fun_getmysinglecourse(dept_id,callback){
    var result = [];

    //1.先获取此机构的列表到result ,  2.判断此节点父节点是否为根节点， 如果是根节点返回结果。 3.如果不是根节点,获取父节点的getmysinglecourse函数。

    getdeptbelongcourse(dept_id, function(err,docs){  if(err)	 return  callback(err);
        result = result.concat(docs); //result = unique(result);

        var table =  config[mgenv].mysql.header + "_dept";
        var sqlstr = "select father_id , org_id  from  " + table + " where  dept_id = '" + dept_id + "' ";
        Mysql.query(sqlstr,function(err,deptdocs){ if(err)	 return  callback(err);
            if(deptdocs.length <=0 ) return  callback("数据错误");

            if(deptdocs[0].org_id == deptdocs[0].father_id )  return  callback(err , result );   //2.父节点为根节点。     
            else { //继续遍历父节点
                var newdept_id = deptdocs[0].father_id;
                fun_getmysinglecourse(newdept_id, function(err, newRes){ if(err)  callback(err);
                    result = result.concat(newRes);
                    return callback(err, result);
                });
            }
            
        }); //Mysql.query end 

    }); //getdeptbelongcourse end 

}



course.getmysinglecourse = function(dept_id, callback){
    fun_getmysinglecourse(dept_id,function(err,result){ return callback(err, result);  });
}



//****获取发布在给定机构的课程列表***/
function getdeptbelongcourse(dept_id,callback) {
    var table_1 =  config[mgenv].mysql.header + "_cd_belong" , table_2 =  config[mgenv].mysql.header + "_cd_course";

    var sqlstr = "select a.belong_id , a.course_id ,  a.dept_id , b.coursename ,b.des , b.period , b.teacher_introduction , b.content  from  " + table_1 + " as a , " + table_2 + " as b " + 
    "  where a.course_id=b.course_id and a.isvalid='1' and b.isvalid='1'  and a.dept_id = '" + dept_id + "'  ";
    Mysql.query(sqlstr, function (err, docs) {
        if (err || docs.length <= 0) return callback(err, docs);

        var returnFlag = 0, flag = 0, end = docs.length;
        for (var i = 0; i < end; i++) {  //--逐个获取学习情景
            (function (i) {
                //console.log(i, docs[i] );
                var doc = docs[i], course_id = docs[i].course_id;
                getcourse_child_V3({ course_id: course_id }, function (err, childDocs) {
                    if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                    docs[i].childs = childDocs;
                    flag++;
                    if (flag == end) return callback(err, docs);
                });
            })(i); 

        }//for end

    }); //Mysql.query end
}

// function fun_getmycourse(data,callback){
//     var returnFlag = 0,type = data.type , user_id = data.user_id ;
//     var table_1 =  config[mgenv].mysql.header + "_cd_course", table_2 = config[mgenv].mysql.header + "_cd_belong"  ;

//      var sqlstr = " select * from " + table_1 + "   where isvalid='1' and  user_id ='" + user_id + "'   ";
//      if(type == '0' ) var sqlstr_2 = "  "


//     var namewhere = data , selectstr = " * ";

//     templater.get(table,namewhere,selectstr, function(err,coursedocs){
//         if(err)	 return res.send({code:204 , err:err});
//         if(coursedocs.length <= 0) return callback(err,coursedocs);

//         var flag=0, end=coursedocs.length;
//         for(var i=0; i< coursedocs.length; i++ ){ 
//             (function(i){
//                 delete coursedocs[i].isvalid;  delete coursedocs[i].creater;  delete coursedocs[i].updater;   
//                 var data_2 ={course_id:coursedocs[i].course_id};
//                 fun_getcourse_childs(data_2,function(err,childdocs){ if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
//                     coursedocs[i].childs = childdocs;
//                     flag++;
//                     if(flag==end) return callback(err,coursedocs)
//                 });
//             })(i);
//         }

//     }); //Mysql.query end

// }




function fun_getmycourse(data,callback){
    var returnFlag = 0,course_id = data.course_id , user_id = data.user_id ;
    var table =  config[mgenv].mysql.header + "_cd_course";
    var table_2 = config[mgenv].mysql.header + "_cd_belong";
    var namewhere = data , selectstr = " * ";

    templater.get(table,namewhere,selectstr, function(err,coursedocs){
        if(err)	 return  callback(err);
        if(coursedocs.length <= 0) return callback(err,coursedocs);

        var flag=0, end=coursedocs.length;
        for(var i=0; i< coursedocs.length; i++ ){ 
            (function(i){
                    var sqlstr = "select dept_id, belong_id from  " + table_2 + " where isvalid='1' and  course_id ='" + coursedocs[i].course_id + "'   ";
                    Mysql.query(sqlstr,function(err,blongdocs){ if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                        coursedocs[i].belong = blongdocs;
                    
                        delete coursedocs[i].isvalid;  delete coursedocs[i].creater;  delete coursedocs[i].updater;   
                        var data_2 ={course_id:coursedocs[i].course_id};
                        fun_getcourse_childs(data_2,function(err,childdocs){ if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                            coursedocs[i].childs = childdocs;
                            flag++;
                            if(flag==end) return callback(err,coursedocs)
                        }); //fun_getcourse_childs end
                
                   }); //Mysql.query end

            })(i);
        } //for end

    }); //templater.get end

}




course.getmycourse = function(data,callback){
    fun_getmycourse(data,function(err,result){ return callback(err,result); });
}




//-----获取老师开发的课程列表信息
course.getmycourses = function(data , callback){
    fun_getmycourse(data,function(err,result){ return callback(err,result); });
}

//-----获取老师开发的课程归属的列表信息
course.getmycourses_belong = function(data , callback){
    //fun_getmycourse(data,function(err,result){ return callback(err,result); });
    var user_id = data.user_id, type = data.type;
    return;

}



//============================================================================








//============获取课程信息=================================================

function fun_getcourse(data,callback){
    var result = {info:{},  childs:[] } ,course_id = data.course_id;
    var table =  config[mgenv].mysql.header + "_cd_course";
    var sqlstr = "select * from  " + table + " where isvalid='1' and course_id = '" + course_id + "' ";
    Mysql.query(sqlstr,function(err,coursedocs){ if(err) return callback(err);
        if(coursedocs.length <= 0) return callback("未查询到此课程");

        result.info = coursedocs[0];
        delete result.info.isvalid;  delete result.info.creater;  delete result.info.updater;   
        
        var table_2 = config[mgenv].mysql.header + "_cd_course_child";
        var sqlstr_2 = "select * from  " + table_2 + "  where isvalid='1' and course_id = '" + course_id + "' order by num";
        Mysql.query(sqlstr_2,function(err,childdocs){  if(err) return callback(err);
            result.childs = childdocs;
            return callback(err, result);
        }); // Mysql.query end
    }); //Mysql.query end

}

course.getcourse = function(data,callback){
    fun_getcourse(data,function(err,result){ return callback(err,result); });
}

//============================================================================










//============函数：/更新活动信息，不含同步异步===================================
function fun_updateactivity(data,wherejson,callback){
    _ACT.update( wherejson, { $set:data },{multi:true},function(err,doc){   return  callback(err); }); 
}


course.updateactivity =  function(data,wherejson,callback){
    fun_updateactivity(data,wherejson,function(err){ return callback(err); });
}
//============================================================================





//=================活动上移或下移============================================
//函数：修改步骤数据
function fun_updatestep(data,data_2,callback){
      _STEP.update( data, { $set: data_2 },{multi:true}, function(err, result) { return  callback(err  );  }); 
}


//活动上移或下移
//0.查询本节点位置信息， 未查到则返回。
//1.上移： 首节点，直接返回； 其它，1.上节点的上节点指向下本节点； 2.本节点指向上节点. 3.上节点指向下节点。
//2.下移： 末节点，直接返回； 其它，1.上节点指向下节点。2.下节点指向本接点。 3。本节点指向下节点的下节点
course.exchangeactivity = function(data,callback){
    var activity_id = data.activity_id ,type = data.type;
    if(type!='up' && type!='down' )  return callback('type参数不正确');

        _ACT.findOne({activity_id:activity_id,isvalid:'1'},function(err,mydoc){
            if(err)	 return callback(err);  
            if(mydoc == undefined)  return callback("未查询到此节点");
            var course_child_id =mydoc.course_child_id;

            if(type=='up'){ //上移
                if(mydoc.is_startstep == '1' ) return callback(null);

                _ACT.findOne({next_step_id:mydoc.activity_id,isvalid:'1'},function(err,frontdoc){  //获取上节点  course_child_id:course_child_id, 
                    //console.log(frontdoc);

                    if(frontdoc==undefined) return callback("数据链错误");
                    var second_frontdatas = {next_step_id: mydoc.activity_id } , second_frontwhere = {course_child_id:course_child_id, next_step_id:frontdoc.activity_id , isvalid:'1' };
                    var mydatas = {next_step_id: frontdoc.activity_id, is_startstep:frontdoc.is_startstep } , mywhere = {course_child_id:course_child_id,  activity_id:mydoc.activity_id  };
                    var frontdatas = {next_step_id:mydoc.next_step_id , is_startstep:mydoc.is_startstep }, frontwhere={course_child_id:course_child_id, activity_id:frontdoc.activity_id  };
                    _ACT.update( second_frontwhere, { $set:second_frontdatas  }, function(err, result) { if(err) return callback(err);
                        _ACT.update( mywhere, { $set:mydatas  }, function(err, result) { if(err) return callback(err);
                            _ACT.update( frontwhere, { $set:frontdatas  }, function(err, result) {//删除本节点 
                                return callback(err); 
                            });
                        });
                    });
                }) // _STEP.findeOne END
            }  //if(type=='up') 上移 END


            if(type=='down'){ //下移
                if(mydoc.next_step_id ==-1) return callback(null);
                _ACT.findOne({activity_id:mydoc.next_step_id,isvalid:'1'},function(err,nextdoc){  //获取下节点
                    if(nextdoc==undefined) return callback("数据链错误");
                    var frontdatas = {next_step_id:mydoc.next_step_id }, frontwhere={course_child_id:course_child_id,  next_step_id:mydoc.activity_id, isvalid:'1'  };
                    var nextdatas = {next_step_id:mydoc.activity_id , is_startstep:mydoc.is_startstep  }, nextwhere={course_child_id:course_child_id,  activity_id:nextdoc.activity_id  };
                    var mydatas = {next_step_id: nextdoc.next_step_id , is_startstep:nextdoc.is_startstep  } , mywhere = {course_child_id:course_child_id,  activity_id:mydoc.activity_id  };    
                    _ACT.update( frontwhere, { $set:frontdatas  }, function(err, result) { if(err) return callback(err);
                        _ACT.update( nextwhere, { $set:nextdatas  }, function(err, result) { if(err) return callback(err);
                            _ACT.update( mywhere, { $set:mydatas  }, function(err, result) {//删除本节点 
                                return callback(err); 
                            });
                        });
                    });
                }) // _STEP.findeOne END

            } //if(type=='down') 下移 END

        });
  
}

//====================================================================















//=======================删除活动====================================
    //删除活动; 查询要删除的节点信息  ，删除本节点


course.delactivity=  function(data,wherejson,callback){
        console.log(wherejson);
        _ACT.findOne(wherejson, function(err,mydoc){   if(err) return callback(err);
            if(mydoc == undefined)  return callback("未查询到有效节点");
            
            var isasync = mydoc.isasync;
            if(isasync !='0' && isasync !='1') return callback("isasync参数不正确"); 

            //console.log(mydoc);
            if(isasync =='1'){ //异步活动
                var frontdatas = {next_step_id: mydoc.next_step_id } , frontwhere = {course_child_id: mydoc.course_child_id , next_step_id:mydoc.activity_id , isvalid:'1' };
                var nextdatas = {is_startstep:mydoc.is_startstep}, nextwhere={course_child_id: mydoc.course_child_id ,activity_id:mydoc.next_step_id , isvalid:'1' };     
                _ACT.update( frontwhere, { $set:frontdatas  }, function(err, result) { if(err) return callback(err);
                    _ACT.update( nextwhere, { $set:nextdatas  }, function(err, result) { if(err) return callback(err);
                        fun_delactivity({activity_id:mydoc.activity_id}, function(err){ //删除本节点 
                            return callback(err); 
                        });
                    });
                });
            }

            //同步活动 ,  //删除本节点 
            if(isasync =='0')
                  fun_delactivity({activity_id:mydoc.activity_id}, function(err){   return callback(err); });               

        }); //collection.findOne
}


//函数： 删除活动
function fun_delactivity(data,callback){   
    var returnFlag = 0;
    _ACT.update(data, { $set: {isvalid:'0', update_time:new Date()} },{multi:true},function(err,doc){  if(err) return callback(err);
        _STEP.find({activity_id: data.activity_id ,isvalid:'1' }).toArray(function(err,stepdocs){  if(err) return callback(err);
            if(stepdocs <= 0) return callback(err);

            var flag = 0,  end = stepdocs.length;
            for(var i=0;i<stepdocs.length; i++ ){
                fun_delstep({step_id:stepdocs[i].step_id}, function(err){ 
                     if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                     flag++;
                     if(flag == end ) return callback(null);
                }) //fun_deltask end 
            } //for end
        }); // _STEP.find end
    });  //_ACT.update end 
}

//===========================================================






//=================添加活动============================================

function fun_addactivity(data,callback){
    var activity_id = UUID.v1(), course_id = data.course_id, 
    isasync = data.isasync,  create_time = new Date();
    data.next_step_id = '-1' , data.activity_id = activity_id;

    if(isasync !='0' && isasync !='1') return callback("isasync参数不正确"); 
    
    if(isasync =='0')  data.next_step_id = '-2'; //异步模式
    //1.检查活动下最后一步ID; 如果不存在，则作为第一节点； 否则，先添加新节点，再更改原来末节点的指针；

    //检测步骤下首任务信息
    _ACT.findOne({is_startstep:'1',course_child_id:data.course_child_id ,isvalid:'1'},function(err,doc){
        if(err)	 return callback(err);  
        
        var flag = (doc==undefined) ? 0:1;
        if(flag ==0 ) data.is_startstep='1';    //首任务，即是开始节点也是末节点；
        else data.is_startstep='0';   //首节点存在
        
        if(isasync =='0')  data.is_startstep = '-2'; //异步模式

        //先插入节点，成功后，找到原末节点修改指针
           console.log(data);
            _ACT.insert(data, function(err,doctmp){ 
                if(err) return callback(err);
                
                //添加一个步骤
                var stepdata = {course_id:course_id,course_child_id:data.course_child_id , activity_id:activity_id,isvalid:'1' , creater:data.creater, create_time:create_time};
                fun_addstep(stepdata,function(err,result){
                     if(err) return callback(err);
                     result.activity_id = activity_id; 
                     if(flag == 0 || isasync =='0') return  callback(err , result);
                     else  //修改源末节点指向新创建节点
                        _ACT.update( {activity_id :{$ne:activity_id} , course_child_id:data.course_child_id, next_step_id: '-1' ,isvalid:'1'  }, { $set: { next_step_id : activity_id } },{multi:true}, function(err, doc) {
                            if(err) return callback(err);
                            else return  callback(err , result);
                        }); //collection.updateOne END
                }); // fun_addstep

            }); // _ACT.insert end 
        }) //_ACT.findOne end  

}



course.addactivity = function(data,callback){
    fun_addactivity(data,function(err,result){ return callback(err,result);  });
}


//====================================================================












//=================步骤上移或下移============================================
//函数：修改步骤数据
function fun_updatestep(data,data_2,callback){
      _STEP.update( data, { $set: data_2 },{multi:true}, function(err, result) { return  callback(err  );  }); 
}


//步骤上移或下移
//0.查询本节点位置信息， 未查到则返回。
//1.上移： 首节点，直接返回； 其它，1.上节点的上节点指向下本节点； 2.本节点指向上节点. 3.上节点指向下节点。
//2.下移： 末节点，直接返回； 其它，1.上节点指向下节点。2.下节点指向本接点。 3。本节点指向下节点的下节点
course.exchangestep = function(data,callback){
    var step_id = data.step_id;
    var type = data.type;
    if(type!='up' && type!='down' )  return callback('type参数不正确');

        _STEP.findOne({step_id:step_id,isvalid:'1'},function(err,mydoc){
            if(err)	 return callback(err);  
            if(mydoc == undefined)  return callback("未查询到此节点");

            if(type=='up'){ //上移
                if(mydoc.is_startstep ==1) return callback(null);

                _STEP.findOne({next_step_id:mydoc.step_id,isvalid:'1'},function(err,frontdoc){  //获取上节点
                    //console.log(frontdoc);
                    if(frontdoc==undefined) return callback("数据链错误");
                    var second_frontdatas = {next_step_id: mydoc.step_id } , second_frontwhere = {activity_id:mydoc.activity_id,next_step_id:frontdoc.step_id , isvalid:'1' };
                    var mydatas = {next_step_id: frontdoc.step_id, is_startstep:frontdoc.is_startstep } , mywhere = {activity_id:mydoc.activity_id, step_id:mydoc.step_id  };
                    var frontdatas = {next_step_id:mydoc.next_step_id , is_startstep:mydoc.is_startstep }, frontwhere={activity_id:mydoc.activity_id,step_id:frontdoc.step_id  };
                    _STEP.update( second_frontwhere, { $set:second_frontdatas  }, function(err, result) { if(err) return callback(err);
                        _STEP.update( mywhere, { $set:mydatas  }, function(err, result) { if(err) return callback(err);
                            _STEP.update( frontwhere, { $set:frontdatas  }, function(err, result) {//删除本节点 
                                return callback(err); 
                            });
                        });
                    });
                }) // _STEP.findeOne END
            }  //if(type=='up') 上移 END


            if(type=='down'){ //下移
                if(mydoc.next_step_id ==-1) return callback(null);
                _STEP.findOne({step_id:mydoc.next_step_id,isvalid:'1'},function(err,nextdoc){  //获取下节点
                    if(nextdoc==undefined) return callback("数据链错误");
                    var frontdatas = {next_step_id:mydoc.next_step_id }, frontwhere={activity_id:mydoc.activity_id,next_step_id:mydoc.step_id, isvalid:'1'  };
                    var nextdatas = {next_step_id:mydoc.step_id , is_startstep:mydoc.is_startstep  }, nextwhere={activity_id:mydoc.activity_id,step_id:nextdoc.step_id  };
                    var mydatas = {next_step_id: nextdoc.next_step_id , is_startstep:nextdoc.is_startstep  } , mywhere = {activity_id:mydoc.activity_id,step_id:mydoc.step_id  };    
                    _STEP.update( frontwhere, { $set:frontdatas  }, function(err, result) { if(err) return callback(err);
                        _STEP.update( nextwhere, { $set:nextdatas  }, function(err, result) { if(err) return callback(err);
                            _STEP.update( mywhere, { $set:mydatas  }, function(err, result) {//删除本节点 
                                return callback(err); 
                            });
                        });
                    });
                }) // _STEP.findeOne END

            } //if(type=='down') 下移 END

        });
  
}

//====================================================================









//=====================添加步骤======================================
//添加步骤--函数
function fun_addstep(data,callback){
    var step_id = UUID.v1();
    data.next_step_id = '-1' , data.step_id = step_id;

    //1.检查活动下最后一步ID; 如果不存在，则作为第一节点； 否则，先添加新节点，再更改原来末节点的指针；

    //检测步骤下首任务信息
    _STEP.findOne({is_startstep:'1', activity_id:data.activity_id ,isvalid:'1'},function(err,doc){
        if(err)	 return callback(err);  
        var flag = (doc==undefined) ? 0:1;
        //console.log(doc);
        if(flag ==0 ) data.is_startstep='1';    //首任务，即是开始节点也是末节点；
        else data.is_startstep='0';   //首节点存在
        
        //先插入节点，成功后，找到原末节点修改指针
            _STEP.insert(data, function(err,doctmp){ 
                if(err) return callback(err);
                
                //添加一个详细任务
                var task_id = UUID.v1(),
                data_2 = {
                    task_id: task_id, course_id: data.course_id, course_child_id: data.course_child_id, activity_id: data.activity_id,
                    step_id: step_id, isvalid: '1', creater: data.creater, create_time: data.create_time, iscooperation:'0'
                };
                fun_addtask(data_2,function(err){
                        if(err) return callback(err);

                        console.log('flag值：', flag ,  data  );
                        if(flag == 0 ) return  callback(err ,  {step_id:step_id, task_id:task_id });
                        if(flag == 1 ){  //原末节点修改指针   
                            _STEP.update( { activity_id:data.activity_id,step_id:{$ne: step_id}, next_step_id: '-1' , isvalid:'1'}, { $set: { next_step_id : step_id } },{multi:true},  function(err, result) {
                                if(err) return callback(err);
                                else return   callback(err ,  {step_id:step_id, task_id:task_id } );
                            }); //collection.updateOne END
                        }
                }); //fun_addtask END
            }); // collection.insert end 
        }) //collection.find end  
}



//添加步骤
course.addstep =  function(data,callback){
    fun_addstep(data,function(err,result){ return callback(err,result);   });
}

//======================================================================






//=======================删除步骤====================================
    //删除步骤; 查询要删除的节点信息  ，删除本节点
course.delstep =  function(step_id,callback){

        _STEP.findOne({step_id:step_id, isvalid:'1'}, function(err,mydoc){ 
            if(err) return callback(err);
            if(mydoc == undefined)  return callback("未查询到有效节点");
            
            var frontdatas = {next_step_id: mydoc.next_step_id } , frontwhere = {activity_id:mydoc.activity_id, next_step_id:mydoc.step_id ,   isvalid:'1' };
            var nextdatas = {is_startstep:mydoc.is_startstep}, nextwhere={activity_id:mydoc.activity_id,step_id:mydoc.next_step_id , isvalid:'1' };
            
            _STEP.update( frontwhere, { $set:frontdatas  }, function(err, result) { if(err) return callback(err);
                _STEP.update( nextwhere, { $set:nextdatas  }, function(err, result) { if(err) return callback(err);
                    fun_delstep({step_id:step_id}, function(err){ //删除本节点 
                         return callback(err); 
                    });
                });
            });

        }); //collection.findOne
}


//函数： 删除步骤
function fun_delstep(data,callback){   
    _STEP.update(data, { $set: {isvalid:'0', update_time:new Date() } },{multi:true},function(err,doc){  if(err) return callback(err);
        fun_deltask({step_id:data.step_id}, function(err){
            return  callback(err  );
        }) //fun_deltask end 
    });   
}

//===========================================================




//=======================获取步骤====================================

    course.getstep = function(step_id ,callback) {
       _STEP.findOne({step_id:step_id, isvalid:'1'}, function(err,result){    if(err) return callback(err);
           if(result == undefined)  return callback("未查询到有效节点");
           var task = require("./task.js");
           task.gettask_eles({step_id:step_id, belong:'step', isvalid:'1' }, function(err,eles){  if(err) return callback(err);
                result.eles = eles;
                return  callback(err, result);
           });
       }); //_STEP.findOne end
    }









//============函数：添加一个详细任务===================================
function fun_addtask(data,callback){
    _TASK.insert(data, function(err,doc){ return  callback(err); });   
}

//添加详细任务
course.addtask =  function(data,callback){
       _STEP.findOne({step_id:data.step_id, isvalid:'1'}, function(err,stepdoc){  if(err) return callback(err);
            data.course_id = stepdoc.course_id, data.course_child_id = stepdoc.course_child_id;
            data.activity_id = stepdoc.activity_id;
            fun_addtask(data,function(err){
                 return callback(err);
            });
       });
}
//=================================================================


//============函数： 修改详细任务:仅限于 title,other_role_result,question_id更改 ===================================
function fun_updatetask(data, wherejson, callback){
    _TASK.update( wherejson , { $set: data  },{multi:true}, function(err,doc){ return  callback(err); });
}

//修改详细任务
course.updatetask =  function(data, wherejson,callback){
    fun_updatetask(data,wherejson,function(err){  return callback(err); });
}
//=================================================================








//=============函数：删除详细任务====================================
function fun_deltask(data,callback){
    _TASK.update( data, { $set: {isvalid:'0', update_time:new Date()} },{multi:true}, function(err,doc){ return  callback(err  );  });
}

//删除详细任务
course.deltask =  function(data,callback){
        fun_deltask(data,function(err){
            if(err) console.log(err);
             return   callback(err);
        });
}
//=====================================================================




//=============函数：获取详细任务所有信息====================================
function fun_getTASKall(data,callback){ 
    _TASK.find( data).toArray(function(err,docs){  return  callback(err,docs );});
}


//=====================================================================



//=============函数：获取task File文件信息====================================
function fun_getTaskFile(data,callback){
    _TASK_FILE.findOne(data,function(err,doc){ return  callback(err,doc); });
}


//=====================================================================






















module.exports = course;














