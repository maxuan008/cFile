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
var cloudfile = require("../module/file");

// var mongoClient =  require("../module/mongoClient");
var course =  require("../module/course");
var task =  require("../module/task");
var study =  require("../module/study");

var syncRequest = require('sync-request');

// var app_funs = require("./module/app_funs");
// var apps = require("./module/apps");
// var org = require("./module/org");
// var role = require("./module/role");

var router = express.Router();

var mgenv = global.mgENV

 router.get('/develop/filetest',filetest);   //创建新的课程
 
 function filetest(req,res,next){
 
    var   url = "http://192.168.1.100:1166/course/develop/downtaskfile?id=3ee8d4d0-3de9-11e7-b689-3938510cb7bb&type=dev";   
          
     var options = {  cache: 'file' } ;

    var request = require('then-request');
    request('GET', url , options).done(function (res2) {
        fs.writeFileSync("./666666666666666.docx",res2.getBody());

        res.send(res2.getBody());
    });



   
 }








 router.post('/develop/addcourse',addcourse);   //创建新的课程
 router.post('/develop/updatecourse',updatecourse);   //更新课程
 router.post('/develop/delcourse',delcourse);   //删除课程

 router.post('/develop/addcoursechild',addcoursechild);   //创建新的课程子集
 router.post('/develop/updatecoursechild',updatecoursechild);   //更新课程子集
 router.post('/develop/delcoursechild',delcoursechild);   //删除课程子集

 router.post('/develop/addactivity', addactivity);   //创建新的活动
 router.post('/develop/updateactivity', updateactivity);   //更新活动
 router.post('/develop/delactivity', delactivity);   //删除活动
 router.post('/develop/exchangeactivity', exchangeactivity);   //步骤上移或下移


 router.post('/develop/addtaskchild', addtaskchild);   //创建新的子任务
 router.post('/develop/updatetaskchild', updatetaskchild);   //更新子任务
 router.post('/develop/deltaskchild', deltaskchild);   //删除子任务

 router.post('/develop/exchangestep', exchangestep);   //步骤上移或下移
 
 router.post('/develop/addstep', addstep);   //创建新的步骤
 router.post('/develop/delstep', delstep);   //删除步骤 



 router.post('/develop/getcourse', getcourse);   //获取课程信息
 router.post('/develop/getcourse_child', getcourse_child);   //获取情景信息 



 router.post('/develop/addtask', addtask);   //添加详细任务
 router.post('/develop/updatetask', updatetask);   //修改详细任务
 router.post('/develop/deltask', deltask);   //删除详细任务


 router.post('/develop/addtaskele', addtaskele);   //添加描述
 router.post('/develop/deltaskele', deltaskele);   //删除描述
 router.post('/develop/updatetaskele', updatetaskele);   //修改描述，仅限富文本

 router.post('/develop/trackfile', trackfile); //更新office的回调
 router.get('/develop/downtaskfile', downtaskfile); //下载taskfile
  router.post('/develop/downtaskfile', downtaskfile_post); //下载taskfile  











//=================详细任务的操作==================================




//添加详细任务
function addtask(req,res,next){
    
    var step_id = req.body.step_id , title =req.body.title ;
    if(step_id == '' || step_id == undefined)  return res.send({code:204,err:'step_id参数不正确'});
    if(title == '' || title == undefined)  return res.send({code:204,err:'title参数不正确'});
    var creater = req.session.userinfo.user_id , create_time = new Date() ; 
    var task_id = UUID.v1() ; 
    var data = { task_id: task_id , step_id : step_id ,isvalid:'1' , creater:creater, create_time:create_time };

    //console.log(data,concrete_task);

    course.addtask( data ,function(err,doc){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 , datas: {task_id:task_id } });
    });

}


//修改一个详细任务
function updatetask(req,res,next){
    var task_id = req.body.task_id;
    if(task_id == '' || task_id == undefined)  return res.send({code:204,err:'task_id参数不正确'});

    var data={updater: req.session.userinfo.user_id , update_time: new Date() }, wherejson = {task_id:task_id};

    if(title != undefined ) data.title = title;
    if(other_role_result != undefined ) data.other_role_result = other_role_result;
    if(exam_id != undefined ) data.exam_id = exam_id;

    course.updatetask(data , wherejson , function(err, result) {
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}





//删除一个详细任务
function deltask(req,res,next){
    var task_id = req.body.task_id;
    if(task_id == '' || task_id == undefined)  return res.send({code:204,err:'task_id参数不正确'});

    var data={isvalid:'0' ,updater: req.session.userinfo.user_id , update_time: new Date() }, wherejson = {task_id:task_id};
    
    course.updatetask(data , wherejson , function(err, result) {
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}

//===================================================











//===================下载taskfile==========
function downtaskfile(req,res,next){  
   var id = req.query.id, type = req.query.type;
   if(id == '' || id == undefined)  return res.write("{\"error\":0}");
   if(type != 'dev' && type != 'study')  return res.write("{\"error\":0}");
    
   if(type == 'dev'){ //存储老师开发的课程文档


       task.fun_getTaskFile({task_file_id:id , isvalid:'1'},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.diskname , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = filename + "." + filetype;

                if(flag == false ) res.write("{\"error\":1}");
                else  return res.download(filepath, newfilename);


//   var options = {
//     root: "./" + config[mgenv].courseDeve.rootpath_2 + "/" + filedoc.course_id + "/" + filedoc.course_child_id + "/",
//     dotfiles: 'deny',
//     headers: {
//         'x-timestamp': Date.now(),
//         'x-sent': true
//     }
//   };

//   console.log(options,newfilename);

//                 if(flag == false )  res.write("{\"error\":1}");
//                 else  return res.sendFile(newfilename, options);




           }); //fs.exists end
       }); //task.fun_getTaskFile end 

   }    



   if(type == 'study'){ //存储学习过程中的课程文档
       task.getStudyFile({study_file_id:id},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.filename , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = name + "." + filetype;
                if(flag == false ) res.write("{\"error\":1}");
                else  return res.download(filepath, newfilename);
           }); //fs.exists end

       });
   }



}





function downtaskfile_post(req,res,next){  
   var id = req.query.id, type = req.query.type;
   if(id == '' || id == undefined)  return res.write("{\"error\":0}");
   if(type != 'dev' && type != 'study')  return res.write("{\"error\":0}");
    
   if(type == 'dev'){ //存储老师开发的课程文档
       task.fun_getTaskFile({task_file_id:id , isvalid:'1'},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.filename , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = filename + "." + filetype;
                if(flag == false )  res.write("{\"error\":1}");
                else  return res.download(filepath, newfilename);
           }); //fs.exists end
       }); //task.fun_getTaskFile end 
   }    

   if(type == 'study'){ //存储学习过程中的课程文档
       task.getStudyFile({study_file_id:id},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.filename , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = name + "." + filetype;
                if(flag == false ) res.write("{\"error\":1}");
                else  return res.download(filepath, newfilename);
           }); //fs.exists end

       });
   }



}
















//============================================


//===================更新office的回调==========
function trackfile(req,res,next){  
   var id = req.query.id, type = req.query.type;
   if(id == '' || id == undefined)  return res.write("{\"error\":0}");
   if(type != 'dev' && type != 'study')  return res.write("{\"error\":0}");
    
   if(type == 'dev'){ //存储老师开发的课程文档
       task.trackfile(id,req,function(err){
           if(err) console.log(err);
           return res.write("{\"error\":0}");
       });
   }

   if(type == 'study'){ //存储学习过程中的课程文档

   }



}



//============================================






//删除任务的元素
function deltaskele(req,res,next){
    var task_ele_id = req.body.task_ele_id ;
    if(task_ele_id == '' || task_ele_id == undefined)  return res.send({code:204,err:'task_ele_id参数不正确'});
    var data = {isvalid:'0' } , wherejson = {task_ele_id: task_ele_id };
    task.updateTaskEle( data ,wherejson ,function(err){ 
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });
}



//修改任务的描述，仅限富文本
function updatetaskele(req,res,next){
    
    var task_ele_id = req.body.task_ele_id , txt = req.body.txt ;
    if(task_ele_id == '' || task_ele_id == undefined)  return res.send({code:204,err:'task_ele_id参数不正确'});
    if(txt == undefined)  return res.send({code:204,err:'txt参数不正确'});

    var data = {txt:txt };
    var wherejson = {task_ele_id: task_ele_id };

    task.updateTaskEle( data ,wherejson ,function(err){ 
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}






//添加描述
function addtaskele(req,res,next){
    var task_id = req.query.task_id , type = req.query.type, ele = req.query.ele;
    if(task_id == '' || task_id == undefined)  return res.send({code:204,err:' task_id 参数不正确'}); 
    if(type!='text' && type!='office' && type!='upload' && type!='cloud_file' )  return res.send({code:204,err:' type 参数不正确'}); 
    if(ele!='des' && ele!='task_result' && ele!='theory'  )  return res.send({code:204,err:' ele 参数不正确'}); 
    
    var task_ele_id = UUID.v1()  ,creater = req.session.userinfo.user_id ,create_time = new Date();
    var data = {task_ele_id:task_ele_id,ele:ele,  task_id:task_id, type:type ,isvalid:'1',creater:creater,create_time:create_time };

    var result = data;

    var ep =new EventProxy();

    ep.all('Add',function(){  //--添加描述事件
        task.addtaskele(result,function(err){
            if(err) return  res.send({code:204 , err:err});
            return   res.send({ code:201 , datas:{task_ele_id:task_ele_id,ele:ele, task_file_id:result.task_file_id } });
        })
    });


    //富文本
    if(type == 'text')  { 
        var txt = req.body.txt;
        if(txt == '' || txt == undefined)  return res.send({code:204,err:' txt 参数不正确'}); 
        result.txt = txt; ep.emit('Add');
    }

    //上传的图片和动画 视频
    if(type == 'upload')  { 
        task.uploadfile(data,req,function(err,filedoc){
            if(err) return  res.send({code:204 , err:err});
            else { result.task_file_id = filedoc.task_file_id; ep.emit('Add');} 
        });
    }

    //文档类型，复制文档
    if(type == 'office')  { 
        var filetype = req.query.filetype,  filename = req.query.filename ;
        if(filetype == '' || filetype == undefined)  return res.send({code:204,err:' filetype 参数不正确'});
        if(filename == '' || filename == undefined)  return res.send({code:204,err:' filename 参数不正确'});

        data.filetype = filetype , data.filename=filename;
        task.crteateOffice(data,function(err,filedoc){
            if(err) return  res.send({code:204 , err:err});
            else { result.task_file_id = filedoc.task_file_id; ep.emit('Add');}    
        }); 
    }

    //复制云文件 ,自身文件复制或共享文件复制。 从文件系统中获取文件，成功后返回信息有： 文件名，大小，
    if(type == 'cloud_file')  {  
        var sourceType = req.query.sourceType , fileID = req.query.fileID ;
        if(sourceType == 'myself' && sourceType == 'shore')  return res.send({code:204,err:' sourceType 参数不正确'});
        if(fileID == '' || fileID == undefined)  return res.send({code:204,err:' fileID 参数不正确'});
        
        var filetype = req.query.filetype,  filename = req.query.filename ;
        if(filetype == '' || filetype == undefined)  return res.send({code:204,err:' filetype 参数不正确'});
        if(filename == '' || filename == undefined)  return res.send({code:204,err:' filename 参数不正确'});
        
        //设置好task_file的ID,获取云文件后，移动到课程开发文件系统，并返回文件数据
        //***注意：如果云文件系统与此系统分离, 必须处理云文件系统跨域的问题 */
        data.sourceType = sourceType,  data.fileID = fileID , data.filename = filename , data.filetype = filetype;

        task.CreateCloudFile(data,function(err,filedoc){
            if(err) return  res.send({code:204 , err:err});
            else {result.task_file_id = filedoc.task_file_id; ep.emit('Add');}
        });
    }


}






//获取课程信息
function getcourse(req,res,next){
    var course_id = req.body.course_id;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:' course_id 参数不正确'}); 

    var data = {course_id:course_id};
    course.getcourse(data,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:result });
    })
}




//获取情景信息
function getcourse_child(req,res,next){
    var course_child_id = req.body.course_child_id;
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id 参数不正确'}); 

    var data = {course_child_id:course_child_id};
    course.getcourse_child(data,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:result });
    })
}






//步骤上移或下移, 查询本节点位置信息
function exchangestep(req,res,next){
    var step_id = req.body.step_id;
    var type = req.body.type;
    if(step_id == '' || step_id == undefined)  return res.send({code:204,err:'step_id参数不正确'});
    if(type!='up' && type!='down' )  return res.send({code:204,err:'type参数不正确'});

    var data = {step_id:step_id,type:type };
    course.exchangestep(data,function(err){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 });
    });

}




//添加新的步骤, 成功后自动生成一个详细任务
function addstep(req,res,next){
    var course_id = req.body.course_id ,  activity_id = req.body.activity_id , course_child_id = req.body.course_child_id   ;

    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'});
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'});
    if(activity_id == '' || activity_id == undefined)  return res.send({code:204,err:'activity_id参数不正确'});
    
    var creater = req.session.userinfo.user_id , create_time = new Date() ; 
    var data = {course_id:course_id ,course_child_id:course_child_id , activity_id:activity_id,isvalid:'1' , creater:creater, create_time:create_time } ;
    course.addstep( data ,function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas: result });
    });

}











//删除步骤, 删除步骤下的任务
function delstep(req,res,next){
    var step_id = req.body.step_id;
    if(step_id == '' || step_id == undefined)  return res.send({code:204,err:'step_id参数不正确'});

    course.delstep(step_id, function(err, result) {
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}




























// 删除子任务
function deltaskchild(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var task_child_id = req.body.task_child_id;
    if(task_child_id == '' || task_child_id == undefined)  return res.send({code:204,err:'task_child_id参数不正确'});
    var data = {isvalid:'0' , update_time:update_time  ,   updater:updater  };

    var table =  config[mgenv].mysql.header + "_cd_task_child";
    var wherejson = {task_child_id:task_child_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


 //更新子任务
 function updatetaskchild(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var task_child_id = req.body.task_child_id;
    if(task_child_id == '' || task_child_id == undefined)  return res.send({code:204,err:'task_child_id参数不正确'});
    var data = {update_time:update_time  ,   updater:updater };
            
    if( req.body.title != undefined)   data.title = req.body.title; 
    if( req.body.period != undefined)   data.period = req.body.period;
    if( req.body.des != undefined)   data.des = req.body.des;
    if( req.body.isasync != undefined)   data.isasync = req.body.isasync;
    
    var table =  config[mgenv].mysql.header + "_cd_task_child";
    var wherejson = {task_child_id:task_child_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

 }



//创建新的子任务 
function addtaskchild(req,res,next) {
    var user_id = req.session.userinfo.user_id ; 

    var  course_id = req.body.course_id;
    var  task_id = req.body.task_id;
    var  title = req.body.title;
    var  des = req.body.des;
    var  period = req.body.period;
    var  isasync = req.body.isasync;

    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'}); 
    if(task_id == '' || task_id == undefined)  return res.send({code:204,err:'task_id参数不正确'}); 
    if(title == '' || title == undefined)  return res.send({code:204,err:'title参数不正确'});  
    if(des == '' || des == undefined)  return res.send({code:204,err:'des参数不正确'}); 
    if(period == '' || period == undefined)  return res.send({code:204,err:'period参数不正确'});  
    if(isasync == '' || isasync == undefined)  return res.send({code:204,err:'isasync参数不正确'});  
    var create_time = new Date();
    
    var task_child_id = UUID.v1();
    var data = { task_child_id:task_child_id , task_id:task_id,  course_id: course_id,
                  title:title, des:des , period:period, isasync:isasync,
                  creater: user_id ,  create_time:create_time
                 };

    var table =  config[mgenv].mysql.header + "_cd_task_child";
    templater.add( table , data, function(err,doc){
        if(err)	 return  res.send({code:204 , err:err});
        else   return  res.send({ code:201 ,datas:{task_child_id:task_child_id}  });
    }); //templater.add  end	  


}








//----上移或下移活动
function exchangeactivity(req,res,next) {
    var activity_id = req.body.activity_id, type = req.body.type;
    if(activity_id == '' || activity_id == undefined)  return res.send({code:204,err:'activity_id参数不正确'});
    if(type!='up' && type!='down' )  return res.send({code:204,err:'type参数不正确'});
    var data = {activity_id:activity_id,type:type };
    course.exchangeactivity(data,function(err){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 });
    });



}














//删除活动
function delactivity(req,res,next) {
    var activity_id = req.body.activity_id;
    if(activity_id == '' || activity_id == undefined)  return res.send({code:204,err:'activity_id参数不正确'});
    
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var data = {isvalid:'0' , update_time:update_time  ,   updater:updater  };
    var wherejson = {activity_id:activity_id}; 

    course.delactivity(data,wherejson,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else return  res.send({ code:201   }); 
    });


    // var table =  config[mgenv].mysql.header + "_cd_activity";
    
    // templater.update(table, wherejson,  data,  function(err,doc){
    //     if(err) return  res.send({code:204 , err:err});
    //     else res.send({ code:201 });
    // });

}


 //更新活动信息，不含同步异步
 function updateactivity(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var activity_id = req.body.activity_id;
    if(activity_id == '' || activity_id == undefined)  return res.send({code:204,err:'activity_id参数不正确'});
    var data = {update_time:update_time  ,   updater:updater };
            
    if( req.body.title != undefined)   data.title = req.body.title; 
    if( req.body.period != undefined)   data.period = req.body.period;
    if( req.body.des != undefined)   data.des = req.body.des;
    //if( req.body.isasync != undefined)   data.isasync = req.body.isasync;
    
    var wherejson = {activity_id:activity_id};
    course.updateactivity(data,wherejson,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else return  res.send({ code:201  }); 
    });


 }



//创建新的活动
function addactivity(req,res,next) {
    var user_id = req.session.userinfo.user_id ; 

    var  course_id = req.body.course_id;
    var  course_child_id = req.body.course_child_id;
    var  title = req.body.title;
    var  des = req.body.des;
    var  period = req.body.period;
    var  isasync = req.body.isasync;

    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'}); 
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'}); 
    if(title == '' || title == undefined)  return res.send({code:204,err:'title参数不正确'});  
    if(des == '' || des == undefined)  return res.send({code:204,err:'des参数不正确'}); 
    if(period == '' || period == undefined)  return res.send({code:204,err:'period参数不正确'});  
    if(isasync == '' || isasync == undefined)  return res.send({code:204,err:'isasync参数不正确'});  
    var create_time = new Date();
    
    var activity_id = UUID.v1();
    var data = {  activity_id:activity_id, course_child_id : course_child_id ,  course_id: course_id,
                  title:title, des:des , period:period, isasync:isasync,
                  creater: user_id ,  create_time:create_time , isvalid:"1"
                 };

    course.addactivity(data,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else return  res.send({ code:201 ,datas:result  }); 
    });

}













//删除课程子集
function delcoursechild(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var course_child_id = req.body.course_child_id;
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'});
    var data = {isvalid:'0' , update_time:update_time  ,   updater:updater  };

    var table =  config[mgenv].mysql.header + "_cd_course_child";
    var wherejson = {course_child_id:course_child_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


 //更新课程子集
 function updatecoursechild(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var course_child_id = req.body.course_child_id;
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'});
    var data = {update_time:update_time  ,   updater:updater };
    
    if( req.body.num != '' && req.body.num != undefined)   data.num = req.body.num;           
    if( req.body.title != undefined)   data.title = req.body.title; 
    if( req.body.period != undefined)   data.period = req.body.period;
    if( req.body.des != undefined)   data.des = req.body.des;
    if( req.body.workflow != undefined)   data.workflow = req.body.workflow;
    if( req.body.target != undefined)   data.target = req.body.target;
    if( req.body.content != undefined)   data.content = req.body.content;
    if( req.body.keynote != undefined)   data.keynote = req.body.keynote;
    if( req.body.task != undefined)   data.task = req.body.task;
    if( req.body.for_use_people != undefined)   data.for_use_people = req.body.for_use_people;
    if( req.body.teacher_introduction != undefined)   data.teacher_introduction = req.body.teacher_introduction;
    if( req.body.tool != undefined)   data.tool = req.body.tool;
    if( req.body.method != undefined)   data.method = req.body.method;
    if( req.body.jobreq != undefined)   data.jobreq = req.body.jobreq;
    if( req.body.pqs != undefined)   data.pqs = req.body.pqs;
    if( req.body.type != undefined)   data.type = req.body.type;    
    
    var table =  config[mgenv].mysql.header + "_cd_course_child";
    var wherejson = {course_child_id:course_child_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

 }





//创建新的课程子集
function addcoursechild(req,res,next) {
    var user_id = req.session.userinfo.user_id ; 

    var  course_id = req.body.course_id;
    var  num = req.body.num;
    var  title = req.body.title;
    var  des = req.body.des;
    var  period = req.body.period;
    var  type = req.body.type;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'}); 
    if(num == '' || num == undefined)  return res.send({code:204,err:'num参数不正确'}); 
    if(title == '' || title == undefined)  return res.send({code:204,err:'title参数不正确'});  
    if(des == '' || des == undefined)  return res.send({code:204,err:'des参数不正确'}); 
    if(period == '' || period == undefined)  return res.send({code:204,err:'period参数不正确'});  
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'});  

    var create_time = new Date();
    
    var course_child_id = UUID.v1();
    var data = {  course_child_id : course_child_id ,  course_id: course_id,type:type,
                  num:num,title:title, des:des , period:period, 
                  creater: user_id ,  create_time:create_time
                 };


    if(req.body.workflow != '' || req.body.workflow != undefined)  data.workflow = req.body.workflow;   
    if(req.body.target != '' || req.body.target != undefined)  data.target = req.body.target;    
    if(req.body.content != '' || req.body.content != undefined)  data.content = req.body.content;  
    if(req.body.keynote != '' || req.body.keynote != undefined)  data.keynote = req.body.keynote; 
    if(req.body.task != '' || req.body.task != undefined)  data.task = req.body.task; 

    if(req.body.for_use_people != '' || req.body.for_use_people != undefined)  data.for_use_people = req.body.for_use_people;  
    if(req.body.teacher_introduction != '' || req.body.teacher_introduction != undefined)  data.teacher_introduction = req.body.teacher_introduction;              
    if(req.body.tool != '' || req.body.tool != undefined)  data.tool =  req.body.tool;  
    if(req.body.method != '' || req.body.method != undefined)  data.method = req.body.method; 
    if(req.body.jobreq != '' || req.body.jobreq != undefined)  data.jobreq = req.body.jobreq; 
    if(req.body.pqs != '' || req.body.pqs != undefined)  data.pqs =  req.body.pqs;  

    var table =  config[mgenv].mysql.header + "_cd_course_child";
    templater.add( table , data, function(err,doc){
        if(err)	 return  res.send({code:204 , err:err});
        else   return  res.send({ code:201 ,datas:{course_child_id:course_child_id}  });
    }); //templater.add  end	  


}
















//删除课程
function delcourse(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    course_id = req.body.course_id;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'});
    var data = {isvalid:'0' , update_time:update_time  ,   updater:updater  };

    var table =  config[mgenv].mysql.header + "_cd_course";
    var wherejson = {course_id:course_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


 //更新课程
 function updatecourse(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    course_id = req.body.course_id;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'});
    var data = {update_time:update_time  ,   updater:updater };
    
    if( req.body.type != '' && req.body.type != undefined)   data.type = req.body.type;           
    if( req.body.coursename != undefined)   data.coursename = req.body.coursename;   
    if( req.body.des != undefined)   data.des = req.body.des;
    if( req.body.period != undefined)   data.period = req.body.period;
    if( req.body.teacher_introduction != undefined)   data.teacher_introduction = req.body.teacher_introduction;

    if( req.body.workflow != undefined)   data.workflow = req.body.workflow;
    if( req.body.target != undefined)   data.target = req.body.target;
    if( req.body.tool != undefined)   data.tool = req.body.tool;
    if( req.body.for_use_people != undefined)   data.for_use_people = req.body.for_use_people;
    if( req.body.content != undefined)   data.content = req.body.content;

    if( req.body.jobreq != undefined)   data.jobreq = req.body.jobreq;
    if( req.body.pqs != undefined)   data.pqs = req.body.pqs;
    if( req.body.method != undefined)   data.method = req.body.method;

    var table =  config[mgenv].mysql.header + "_cd_course";
    var wherejson = {course_id:course_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });



 }



//创建新的课程
function addcourse(req,res,next) {
    var user_id = req.session.userinfo.user_id ; 

    var  type = req.body.type;
    var  coursename = req.body.coursename;
    var  des = req.body.des;
    var  period = req.body.period;
    var  teacher_introduction = req.body.teacher_introduction;
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'}); 
    if(coursename == '' || coursename == undefined)  return res.send({code:204,err:'coursename参数不正确'});  
    if(des == '' || des == undefined)  return res.send({code:204,err:'des参数不正确'}); 
    if(period == '' || period == undefined)  return res.send({code:204,err:'period参数不正确'}); 
    if(teacher_introduction == '' || teacher_introduction == undefined)  return res.send({code:204,err:'teacher_introduction参数不正确'}); 
    var create_time = new Date();
    
    var course_id = UUID.v1();
    var data = {  course_id: course_id,
                  user_id:user_id,type:type, coursename:coursename , period:period, 
                  teacher_introduction:teacher_introduction  ,des:des,
                  creater: user_id ,  create_time:create_time
                 };

    if(req.body.workflow != '' || req.body.workflow != undefined)  data.workflow = req.body.workflow;           
    if(req.body.target != '' || req.body.target != undefined)  data.target = req.body.target;  
    if(req.body.tool != '' || req.body.tool != undefined)  data.tool =  req.body.tool;  
    if(req.body.for_use_people != '' || req.body.for_use_people != undefined)  data.for_use_people = req.body.for_use_people;  
    if(req.body.content != '' || req.body.content != undefined)  data.content = req.body.content;  
    if(req.body.jobreq != '' || req.body.jobreq != undefined)  data.jobreq = req.body.jobreq;  
    if(req.body.pqs != '' || req.body.pqs != undefined)  data.pqs =  req.body.pqs;  
    if(req.body.period != '' || req.body.period != undefined)  data.period = req.body.period;  
    if(req.body.method != '' || req.body.method != undefined)  data.method = req.body.method;  


    var table =  config[mgenv].mysql.header + "_cd_course";
    templater.add( table , data, function(err,doc){
        if(err)	 return  res.send({code:204 , err:err});
        else   return  res.send({ code:201 ,datas:{course_id:course_id}  });
    }); //templater.add  end	  


}












module.exports = router;





