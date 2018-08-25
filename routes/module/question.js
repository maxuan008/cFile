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

var mongoDB =  require("../DB/mongodb");

var mgenv = global.mgENV;
//console.log(global.mongoDB);

var _EXAM =  global.mongoDB.collection.mx_qt_exam;
var _QUESTION =  global.mongoDB.collection.mx_qt_question;
var _OPTION =  global.mongoDB.collection.mx_qt_option;

var _MY_EXAM =  global.mongoDB.collection.mx_my_exam;
var _MY_QUESTION =  global.mongoDB.collection.mx_my_question;
var _MY_OPTION =  global.mongoDB.collection.mx_my_option;


function question(data) {
     this.data = data;
}





//************做题， 试题组实例化****/

//3.实例化my_option
function copy_option_tomy(whereJson_3,callback){
    console.log("==>:实例化选项结合" ,  whereJson_3)
    var returnFlag = 0 , result = [], 
    data = whereJson_3.data,  myquestiondoc = whereJson_3.myquestiondoc , nowtime = new Date();
    
    _OPTION.find({question_id:myquestiondoc.question_id, isvalid:'1'}).toArray(function(err,optdocs){ if(err) return callback(err);     
            if(optdocs.length <= 0) return callback(err,result);
            var flag=0, end = optdocs.length;
            for(var i=0;i<optdocs.length;i++ ){
                 (function(i){
                    var optdoc = optdocs[i];
                    var myoptdocJson = {myoption_id:UUID.v1(),myquestion_id:myquestiondoc.myquestion_id ,myexam_id:myquestiondoc.myexam_id , user_id:data.user_id ,
                         exam_id:myquestiondoc.exam_id, question_id:myquestiondoc.question_id, option_id: optdoc.option_id, isselected:'0',
                    txt:'', answer_time:'',  isvalid:'1',creater:data.user_id ,create_time:nowtime,
                    des:optdoc.des  , isanswer:optdoc.isanswer , answertxt:optdoc.answertxt ,  parse:optdoc.parse     };
                    _MY_OPTION.insert(myoptdocJson,function(err,doc){ if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                        console.log("选项示例化：",myoptdocJson);
                        result[i] = myoptdocJson;
                        flag++;
                        if(flag == end ) return callback(err, result);
                    });
                })(i);
            }
    });

}


 //2.实例化my_question : 通过exam_id获取question数组，然后逐个实例化
function copy_question_tomy(whereJson_2,callback){
    console.log("==>:实例化试题结合" ,  whereJson_2)
      var returnFlag = 0 , result = [], 
      data = whereJson_2.data,  myexamdoc = whereJson_2.myexamdoc , nowtime = new Date();

      _QUESTION.find({exam_id:myexamdoc.exam_id, isvalid:'1'}).toArray(function(err,quedocs){ if(err) return callback(err);
            if(quedocs.length <= 0) return callback(err,result);
            var flag=0, end = quedocs.length;
            for(var i=0;i<quedocs.length;i++ ){

                (function(i){
                    var quedoc = quedocs[i];
                    var myquestionJson = {myquestion_id:UUID.v1(),myexam_id:myexamdoc.myexam_id , user_id:data.user_id , exam_id:myexamdoc.exam_id, question_id:quedoc.question_id,
                    answertxt:'', answer_time:'',  isvalid:'1',creater:data.user_id ,create_time:nowtime,
                    score:quedoc.score  , type:quedoc.type , des:quedoc.des , degree:quedoc.degree ,  parse:quedoc.parse      };
                    _MY_QUESTION.insert(myquestionJson,function(err,doc){ if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                        console.log("试题示例化：",myquestionJson);
                        var whereJson_3 ={data:data, myquestiondoc :myquestionJson   };
                        copy_option_tomy(whereJson_3,function(err,optdocs){if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                            myquestionJson.options = optdocs;
                            result[i] = myquestionJson;
                            flag++;
                            if(flag == end ) return callback(err, result);
                        });
                    }); // _MY_QUESTION.insert end
                })(i);

            } //for end

      }); // _QUESTION.find end
      

}




function copy_exam_tomy( whereJson, callback){  //data为用户信息, exam_id
    console.log("==>:实例化试题组模板" ,  whereJson)
    var nowtime = new Date(), data = whereJson.data, examdoc = whereJson.examdoc ;
    var resultJson = {myexam_id:UUID.v1(), exam_id:examdoc.exam_id , user_id:data.user_id , iscompleted:'0', start_time:nowtime , isvalid:'1' ,creater: data.user_id , create_time:nowtime };
    
    _MY_EXAM.insert(resultJson,function(err,doc){ if(err) return callback(err);
        console.log("myExam:",resultJson);
        var whereJson_2 = {data:data ,  myexamdoc: resultJson  };
        copy_question_tomy(whereJson_2,function(err,questiondocs){  if(err) return callback(err);
            resultJson.questions = questiondocs;
            return callback(err,resultJson);
        });     


    });
     
}


//实例化一个用户的试题组， 返回myexam的信息
//1.实例化my_exam  2.实例化my_question  3.实例化my_option
function fun_init_myexam(data,callback){
    console.log({exam_id:data.exam_id});
    _EXAM.findOne({exam_id:data.exam_id, isvalid: '1'},function(err,examdoc){  if(err) return callback(err);
         if(examdoc == undefined) return callback("试题模板不存在");
        if( examdoc.iscompleted == '0')  return callback("此试题组尚未发布"); 
        //1.实例化my_exam
        var whereJson = {data:data, examdoc:examdoc };
        copy_exam_tomy(whereJson,function(err,myexamdoc){ return callback(err,myexamdoc );   }); //copy_exam_tomy end 
    });
}



//获取符合条件的试题的全部试题信息
function fun_get_myquestions(data,callback){
    var returnFlag = 0 ;
    _MY_QUESTION.find(data).toArray(function(err,myquedocs){ if(err) return callback(err);
        if(myquedocs.length <= 0) return callback(err,myquedocs);

        var flag = 0 , end =myquedocs.length;
        for(var i=0; i<myquedocs.length; i++ ){
            (function(i){   
                _MY_OPTION.find({myquestion_id: myquedocs[i].myquestion_id , isvalid:'1'}).toArray(function(err,myoptdocs){
                     if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                     myquedocs[i].options = myoptdocs;
                     flag++;
                     if(flag == end ) return callback(err, myquedocs);
                });
            })(i);
        }
    });
}



//获取符合条件的试题组的全部试题信息
function fun_getmyexam(data, callback){
    _MY_EXAM.findOne(data,function(err,result){ if(err) return callback(err);
        fun_get_myquestions({myexam_id:result.myexam_id, isvalid:'1'},function(err,quedocs){if(err) return callback(err);
            result.questions = quedocs;
            return callback(err,result);
        });
    }); 
}



//获取我的试题组的全部试题信息:通过myexam_id获取
question.getmyexam_V2 = function(data, callback){
    console.log(data);    // , iscompleted :'0' 
    _MY_EXAM.find({myexam_id:data.myexam_id , user_id:data.user_id , isvalid: '1'}).toArray(function(err,myexamdocs){ if(err) return callback(err);
        if(myexamdocs.length > 1) return callback("错误：此用户存在多份未完成的试题组");
        if(myexamdocs.length <= 0) return callback("错误：此用户试题组不存在");

        console.log("未完成的试题组",myexamdocs);
       
        if(myexamdocs.length == 1) {  //直接提取试题组信息
            fun_getmyexam({myexam_id:myexamdocs[0].myexam_id},function(err,myexamdoc){
                return callback(err,myexamdoc);
            }); 
        }
        
     }); //_MY_EXAM.find end

};



//获取我的试题组的全部试题信息
question.getmyexam = function(data, callback){
    _MY_EXAM.find({exam_id:data.exam_id , user_id:data.user_id , isvalid: '1' , iscompleted :'0' }).toArray(function(err,myexamdocs){ if(err) return callback(err);
        if(myexamdocs.length > 1) return callback("错误：此用户存在多份未完成的试题组");
        console.log("未完成的试题组",myexamdocs);
       
        if(myexamdocs.length >= 1) {  //直接提取试题组信息
            fun_getmyexam({myexam_id:myexamdocs[0].myexam_id},function(err,myexamdoc){
                return callback(err,myexamdoc);
            }); 
        }
        
        if(myexamdocs.length <= 0) {  //1.创建试题组; 2.获取试题组信息
            fun_init_myexam(data,function(err,myexamdoc){
                return callback(err,myexamdoc);
            });
        }
    
     }); //_MY_EXAM.find end

};



question.fun_init_myexam_V2 = function(data, callback){
       
        fun_init_myexam(data,function(err,myexamdoc){
           return callback(err,myexamdoc);
        });
    
    // _MY_EXAM.find({exam_id:data.exam_id , user_id:data.user_id , isvalid: '1' , iscompleted :'0' }).toArray(function(err,myexamdocs){ if(err) return callback(err);
    //     if(myexamdocs.length >= 1) return callback("错误：此用户存在未完成的试题组");
    //     else {
    //          //开始初始化我的试题
    //          fun_init_myexam(data,function(err,myexamdoc){
    //             return callback(err,myexamdoc);
    //          });
    //     } //if end 
    // }); //_MY_EXAM.find end

}




//***********************************************/



//********************作答***************************/

function fun_update_myoption(data, wherejson,callback){
    _MY_OPTION.update( wherejson , { $set: data  },{multi:true},function(err,doc){   return callback(err); });
}

question.answerquestion = function(data, callback){
    var whereJson = {myoption_id: data.myoption_id}   , nowtime = new Date();
    if(data.type != '1' && data.type != '2' && data.type != '3' && data.type != '4' ) return callback("type数据错误");

    if(data.type == '1'){ //如果为单选 : 1.先清空所有答案， 2.设置答案
        var data_1 ={isselected:'0',  isvalid:'1'};
        fun_update_myoption(data_1, {myquestion_id: data.myquestion_id} ,function(err,doc){ if(err) return callback(err);
            var data_2 ={isselected:data.isselected , answer_time: nowtime };
            fun_update_myoption(data_2, whereJson ,function(err,doc){  return callback(err); });
        });
    } else if(data.type == '2') { //多选
         fun_update_myoption({isselected: data.isselected, answer_time: nowtime }, whereJson ,function(err,doc){  return callback(err); });
    } else if(data.type == '3' || data.type == '4' ) { //填空或问答
        fun_update_myoption({txt: data.txt, answer_time: nowtime }, whereJson ,function(err,doc){  return callback(err); });
    }
}


//*******************************************************/





//********************提交试题组***************************/

function fun_update_myexam(data, wherejson,callback){
    _MY_EXAM.update( wherejson, { $set: data  },{multi:true},function(err,doc){   return callback(err); });
}

question.completedexam = function(data, callback){
    var data_1 ={iscompleted:'1' , end_time : new Date() },  whereJson = { myexam_id : data.myexam_id} ;
    fun_update_myexam(data_1, whereJson, function(err){ return callback(err) });
}

//***********************************************/



//********************是否存在答题未完成的试题组：true:存在；false：不存在***************************/

question.isexamover = function(data, callback){
    var flag = false , wherejson = {exam_id:data.exam_id  , isvalid:'1' , iscompleted:'0'  }
    _MY_EXAM.find(wherejson).toArray(function(err,docs){ if(err) return callback(err);
        if(docs.length > 0)  flag = true;
        return callback(err,flag); 
    });
}

//***********************************************/































//============创建新的试题组===================================


//获取选项数据
function fun_getoptions(question_id,callback){
    _OPTION.find({question_id:question_id,isvalid:'1' }).toArray(function(err,docs){ return callback(err,docs ); });
}


function  fun_getQuesions_all(exam_id,callback){
    var returnFlag=0,result = [];
    _QUESTION.find({exam_id:exam_id, isvalid:'1'}).toArray( function(err,quedocs){ if(err) return callback(err);
        if(quedocs.length <= 0)   return callback(err,result); 

        var flag = 0, end = quedocs.length;
        for(var i=0; i<end; i++ ) {
            result[i] = quedocs[i];

            (function(i){
                fun_getoptions(quedocs[i].question_id, function(err,optdocs){  if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                    result[i].options = optdocs;
                    flag++;
                    if(flag == end)  return callback(err,result); 
                });
            })(i)
        } //for end

    });
}






question.getexam = function(exam_id, callback){
    if(!exam_id) return  callback("exam_id数据错误");
    _EXAM.findOne({exam_id:exam_id},function(err,examdoc){  if(err) return callback(err);
        if(examdoc == undefined)    return callback("试题组不存在");
        if(examdoc.isvalid == '0')   return callback("试题组已失效");
        var result = {info:{exam_id:examdoc.exam_id ,title:examdoc.title ,iscompleted:examdoc.iscompleted } }

        fun_getQuesions_all(exam_id,function(err,quedocs){
             if(err) return callback(err);
             result.questions = quedocs;
             return callback(err,result);
        });

    }); //_EXAM.findOne end
}


function fun_addexam(data,callback){
    _EXAM.insert(data, function(err,doc){ return  callback(err); });  
}

//创建新的试题组
question.addexam =  function(data,callback){
     fun_addexam(data,function(err){ return callback(err);  });
}


function fun_updateexam(data, wherejson,callback){
    _EXAM.update( wherejson, { $set: data  },{multi:true},function(err,doc){ return callback(err); });
}

//更新任务描述
question.updateexam =  function(data, wherejson, callback){
   fun_updateexam(data, wherejson,function(err){ return callback(err);  });
}

//=================================================================




//============创建新的试题===================================
function fun_addquestion(data,callback){
    var result={question_id:data.question_id};
    _QUESTION.insert(data, function(err,doc){  if(err) return callback(err); 
        if(data.type =='1' || data.type =='2' || data.type =='3' ) {
            var options = [];
            var tmpjson_1 = {option_id:UUID.v1(), question_id:data.question_id, exam_id:data.exam_id,answertxt:'', isanswer:'0',isvalid:'1' , creater:data.creater, create_time:new Date() };
            fun_addoption(tmpjson_1,function(err,doc){  if(err) return callback(err);
                options[options.length] = {option_id:tmpjson_1.option_id};  if(data.type =='3') {result.options = options; return  callback(err,result); }
                var tmpjson_2 = {option_id:UUID.v1(), question_id:data.question_id, exam_id:data.exam_id, isanswer:'0',isvalid:'1' , creater:data.creater, create_time:new Date() };
                    fun_addoption(tmpjson_2,function(err,doc){  if(err) return callback(err);
                        options[options.length] = {option_id:tmpjson_2.option_id};
                        result.options = options;
                        return callback(err,result);
                    });
            })
        } else  return callback(err, result); 
    });  
}

//创建新的试题组
question.addquestion =  function(data,callback){
     fun_addquestion(data,function(err,result){ return callback(err,result);  });
}

function fun_updatequestion(data, wherejson,callback){
  
    _QUESTION.update(wherejson, { $set: data },{multi:true},function(err,doc){  return callback(err); });
}

//更新任务描述
question.updatequestion =  function(data, wherejson, callback){
   fun_updatequestion(data, wherejson,function(err){ return callback(err);  });
}

//=================================================================





//============创建新的选项===================================
function fun_addoption(data,callback){
    _OPTION.insert(data, function(err,doc){ return  callback(err,doc); });  
}

//创建新的选项
question.addoption =  function(data,callback){
     fun_addoption(data,function(err){ return callback(err);  });
}

function fun_updateoption(data, wherejson,callback){
    _OPTION.update( wherejson, { $set: data },{multi:true},function(err,doc){  return callback(err); });
}

//更新选项
question.updateoption =  function(data, wherejson, callback){
   fun_updateoption(data, wherejson,function(err){ return callback(err);  });
}


function fun_deloption_blank(data, options,callback){
    _OPTION.update( {$or: options }, { $set: data },{multi:true},function(err,doc){  return callback(err); });
}

//更新填空描述
question.deloption_blank =  function(data, options, callback){
    console.log(data, options);
   fun_updateoption(data, options,function(err){ return callback(err);  });
}



//设置答案
function fun_setanswer(data ,callback){
    _QUESTION.findOne({question_id:data.question_id},function(err,quesdoc){  if(err || !quesdoc) return callback(err);
        var type = quesdoc.type;
        if(type != '1' && type != '2' && type != '3' && type != '4' ) return callback("试题类型错误");
        var wherejson = {option_id:data.option_id};
        if(type == '1'){ //单选, 先清空答案，再设置            
            fun_updateoption({isanswer: '0', update_time: new Date()}, {question_id:data.question_id, isvalid:'1'},function(err){ if(err) callback(err);
                fun_updateoption({isanswer: data.isanswer, update_time: new Date() }, wherejson,function(err){return callback(err); });  
            });
        }

        if(type == '2'){//多选 
            fun_updateoption({isanswer: data.isanswer , answer_time: new Date() }, wherejson,function(err){ return callback(err);  });
        }
       
        if(type == '3' || type == '4'){//简答和填空
            fun_updateoption({answertxt: data.answertxt, answer_time: new Date() }, wherejson,function(err){ return callback(err);  });
        }
    });
}

//设置答案
question.setanswer = function(data,callback){
     fun_setanswer(data,function(err){ return callback(err);  });
}


//=================================================================
































module.exports = question;














