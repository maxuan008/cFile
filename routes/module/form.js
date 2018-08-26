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
var moment=require('moment');

var mongoDB = require("../DB/mongodb");

var mgenv = global.mgENV;
//console.log(global.mongoDB);

var _STUDY_RESULT =  global.mongoDB.collection.study_result;

var _study = require('./study');


function form(data) {
    this.data = data;
}



//============获取课程信息=================================================




//****获取发布在给定机构的课程列表***/
function fun_test(dept_id, callback) {
    var table_1 = config[mgenv].mysql.header + "_cd_belong", table_2 = config[mgenv].mysql.header + "_cd_course";

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




//***表单实例化 */
form.copyFormToStudy = function( data, callback ){
    console.log("CALL stroed_get_html( '" + data.html_id + "' )");
    Mysql.query("CALL stroed_get_html( '" + data.html_id + "' )" , function (err, tmpdocs) {
        if (err ) return callback(err);
        var htmlDocs = tmpdocs[0];
        if(htmlDocs.length <=0 )  return callback("表单不存在");
        var htmlDoc = htmlDocs[0];
        
        var studydata={study_html_id:UUID.v1() , html_id:data.html_id , user_id:data.user_id, code:htmlDoc.code , isvalid:'1', creater:data.user_id ,create_time:moment().format('YYYY-MM-DD HH:mm:ss') };
        var table =  config[mgenv].mysql.header + "_form_study_html";
        //开始实例化表单
        templater.add( table , studydata, function(err,doc){
            if(err)	 return  callback(err);
            //实例化表单项
            fun_copy_form_ele_to_study({ study_log_id:data.study_log_id, study_html_id:studydata.study_html_id ,html_id:data.html_id , user_id:data.user_id } , function(err){
                if(err) return callback(err);
                return callback(err,{study_html_id:studydata.study_html_id });
            }); //fun_copy_form_ele_to_study end
        
        }); //templater.add  end
        
    }); //mysql.query end

} //form.copyFormToStudy end




//实例化表单项
function fun_copy_form_ele_to_study(data,callback) {
    var study_html_id=data.study_html_id , user_id= data.user_id ,html_id = data.html_id, study_log_id= data.study_log_id ;
    var ep =new EventProxy();

    var result = [];
    Mysql.query("CALL stroed_get_formEle( '" + data.html_id + "' )" , function (err, tmpdocs) {
        if (err ) return callback(err);
        var formEleDocs = tmpdocs[0];
        if(formEleDocs.length <=0 )  return callback(err);
        
        //console.log("UUUUUUU表单项集合：", formEleDocs);


        ep.all('GO',function(){
            var table =  config[mgenv].mysql.header + "_form_study_ele";
            //console.log("复制表单项：", result);
            templater.add_Arry( table , result, function(err,doc){
                 return  callback(err);
            });
        });
   
        var returnFlag = 0, flag = 0, end = formEleDocs.length;
        for(var i=0; i< formEleDocs.length; i++) {
            (function (i) {
                    result[i] = {study_html_ele_id:UUID.v1() , study_html_id:study_html_id,  html_ele_id: formEleDocs[i].html_ele_id ,
                         user_id:user_id, name:formEleDocs[i].name ,  sid:formEleDocs[i].sid , type:formEleDocs[i].type ,  title:formEleDocs[i].title, isvalid:'1' , creater:data.user_id ,create_time:moment().format('YYYY-MM-DD HH:mm:ss')   };
                         
                     if(formEleDocs[i].indicator == '1'){ //表单项关联
                        //result[i].value = formEleDocs[i].value; flag++;
                        //console.log("0:找到表单项：", formEleDocs[i]);
                        if(formEleDocs[i].formula == '' || formEleDocs[i].formula==null ) { result[i].value = formEleDocs[i].value; flag++; } 
                        else {
                               //console.log("1:存在表单关联:", formEleDocs[i].formula   );
                                fun_conver_formula_to_value(user_id,study_log_id,formEleDocs[i].formula ,function(err,newValue ){
                                    if (err) { console.log(err); result[i].value = formEleDocs[i].value; flag++; }
                                    else {
                                         flag++;
                                         result[i].value = newValue;
                                         if(flag == end) ep.emit('GO');
                                    } //if end
                                   
                                }); //fun_conver_formula_to_value end
                            } //if end

                    } else if (formEleDocs[i].indicator == '0' ){
                        result[i].value = formEleDocs[i].value; flag++;
                        if(flag == end) ep.emit('GO');
                    } else { flag++;if(flag == end) ep.emit('GO'); }

            })(i); 
        } //for end

    });


} //fun_copy_form_ele_to_study end



//公式转换
function fun_conver_formula_to_value(user_id,study_log_id,formula, callback){
    var newValue, formulaTmp = formula,  formulaArry = formula.match(/{.+?:.+?}/g);
    if(formulaArry == null)  return callback("公式不匹配");
    else{
        
        var forms = [];  
        for(var i=0;i<formulaArry.length;i++ ) { var tmpA = formulaArry[i].replace(/{|}/g, ""); tmpArr = tmpA.split(":"); forms[i]={study_log_id:study_log_id,user_id:user_id, str:formulaArry[i] , html_id:tmpArr[0], html_ele_id:tmpArr[1] }; }
       
        //console.log("2:开始转换公式：",formula);

        //逐个获取新Value
        var returnFlag = 0, flag = 0, end = forms.length;
        for(var i=0; i< forms.length; i++) {
            (function (i) {
                
                fun_get_ele_conver_value(forms[i],function(err,value ){
                    if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; }
                    formulaTmp = formulaTmp.replace(forms[i].str , value);
                    flag++;
                    if(flag ==  end) {newValue = eval(formulaTmp); return callback(err,newValue); }  
                }) //fun_get_ele_conver_value end 
            })(i);
        }
    }//if end
}






//表单项转换
function fun_get_ele_conver_value(fromJson, callback){

    var html_id = fromJson.html_id , html_ele_id = fromJson.html_ele_id, user_id= fromJson.user_id, study_log_id = fromJson.study_log_id ;
    
    var table =  config[mgenv].mysql.header + "_form_study_html";
    var where = {html_id:html_id , user_id:user_id ,  isvalid : '1' };
    var selectstr = " `study_html_id`   ";
    templater.get(table,where,selectstr, function(err,datas){
        if(err) return callback(err);
        if(datas.length <=0 )  return callback("学习表单不存在：" + html_id );

        //console.log("3:开始转换表单项：",html_id, html_ele_id);

        fun_getStudyFormByStudyresult( datas,study_log_id,function(err,study_html_id ){
            if(err) return callback(err);
            
            //console.log("4:用户的学习表单已找到：",study_html_id);
            var table_2 =  config[mgenv].mysql.header + "_form_study_ele";
            var where_2 = {study_html_id:study_html_id , user_id:user_id , html_ele_id: html_ele_id,   isvalid : '1' };
            var selectstr_2 = " `value`   ";

            templater.get(table_2,where_2,selectstr_2, function(err,valueDatas){
                if(err) return callback(err);
                if(valueDatas.length <=0 )  return callback("关联表单项不存在：" );
                if(valueDatas.length >1 )  return callback("关联表单项存在多个，数据错误" );
                
                //console.log("5:表单项转化成功：",html_id , html_ele_id,  study_html_id , valueDatas[0].value    );
                return callback(err, valueDatas[0].value );
            });//templater.get end

        });

    });//templater.get end
}


fun_getStudyFormByStudyresult = function (study_html_ids,study_log_id,callback  ){
    var result = null;
    var returnFlag = 0, flag = 0, end = study_html_ids.length;
    //console.log("要搜索的表单集合：",study_html_ids);

    // _STUDY_RESULT.find({study_log_id:study_log_id , type:'form', isvalid:'1'}).toArray ( function(err,htmldocs){ 
    //     if(err) return callback(err);
    //     console.log("From集合：" ,htmldocs );
    //     for(var i=0;i<htmldocs.length;i++ ) {
    //         var tmphtmlID = {study_html_id:htmldocs[i].study_html_id }
    //         if(study_html_ids.indexOf(tmphtmlID) != -1)  result = htmldocs[i].study_html_id;
    //     }

    //     if(result == null)  return callback("实例化表单未找到");
    //     else return callback(err, result );

    // });//_STUDY_RESULT.find end

    for(var i=0;i< study_html_ids.length;i++) {
       (function (i) {
           
           _STUDY_RESULT.findOne({study_log_id:study_log_id , study_html_id: study_html_ids[i].study_html_id,  isvalid:'1'  },function(err,doc){ 
               if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return callback(err); } else return; } 
            
               //console.log("表单想搜索条件：",{study_log_id:study_log_id , study_html_id: study_html_ids[i].study_html_id,  isvalid:'1'  }, doc);
               if(doc!=undefined && doc!=null) result = study_html_ids[i].study_html_id; 

               flag++;
               if(flag == end) { 
                   if(result == null)  return callback("实例化表单未找到");
                   else return callback(err, result );
               
               } //if end
           });//_STUDY_RESULT.findOne end
       })(i);
    }
   
}






module.exports = form;
