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
var formidable = require('formidable');


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

var mgenv = global.mgENV;
    
 router.get('/develop/filetest',filetest);   //创建新的课程
 
 function filetest(req,res,next){
 
     var url = "http://192.168.1.100:1166/course/develop/downtaskfile?id=3ee8d4d0-3de9-11e7-b689-3938510cb7bb&type=dev";   
          
     var options = {  cache: 'file' } ;

    var request = require('then-request');
    request('GET', url , options).done(function (res2) {
        fs.writeFileSync("./666666666666666.docx",res2.getBody());

        res.send(res2.getBody());
    });

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




 router.post('/develop/uploadtmpfile',uploadtmpfile);   //上次临时的文件    

 router.post('/develop/addcourse',addcourse);   //创建新的课程
 router.post('/develop/updatecourse',updatecourse);   //更新课程
 router.post('/develop/delcourse',delcourse);   //删除课程
 router.post('/develop/uploadpng',uploadpng);   //上传课程图片
 router.get('/develop/downloadpng',downloadpng);   //上传课程图片

 router.post('/develop/uploadpngchild',uploadpngchild);   //上传课程图片
 

 //router.post('/develop/publishcourse',publishcourse);   //发布课程
 

 router.post('/develop/coursebelong',coursebelong);   //课程归属到机构
 router.post('/develop/delcoursebelong',delcoursebelong);   //删除归属机构的某个课程

 router.post('/develop/getmysinglecourse', getmysinglecourse);   //获取此学生能学习的单人课程列表信息
 //router.post('/develop/getmymanycourse', getmymanycourse);   //获取此学生能学习的多人课程列表信息
 

 router.post('/develop/addcoursechild',addcoursechild);   //创建新的课程子集
 router.post('/develop/updatecoursechild',updatecoursechild);   //更新课程子集
 router.post('/develop/delcoursechild',delcoursechild);   //删除课程子集
 router.post('/develop/completedcoursechild',completedcoursechild);   //发布课程课程子集
 


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
 router.post('/develop/getstep', getstep);   //获取步骤数据
 


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

 router.post('/develop/downloadOfficeFile_dev', downloadOfficeFile_dev); //将office后台的文件下载到对应的课程设计的文件中

  
 
 router.post('/develop/gettask', gettask); //获取task信息 



//  router.post('/develop/getmycourse', getmycourse); //获取学习的课程信息  

 router.post('/develop/getmycourses', getmycourses); //获取老师开发的课程列表信息  
 router.post('/develop/getmycourses_belong', getmycourses_belong); //获取老师发布或未发布的课程 









//===================获取此学生能学习的单人/多人课程列表信息==============
function getmysinglecourse(req,res,next){ 
    var user_id = req.session.userinfo.user_id , dept_id =  req.session.orginfo.dept_id ;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'session 参数不正确'});

    course.getmysinglecourse( dept_id ,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 ,datas:result });
    });  //getmysinglecourse end 
}

/*
function getmymanycourse(req, res, next) {
    var user_id = req.session.userinfo.user_id, dept_id = req.session.orginfo.dept_id;
    if (dept_id == '' || dept_id == undefined) return res.send({ code: 204, err: 'session 参数不正确' });

    course.getmymanycourse(dept_id, function (err, result) {
        if (err) return res.send({ code: 204, err: err });
        else res.send({ code: 201, datas: result });
    });  //getmysinglecourse end 
}
*/





//===============================================




















//===================获取老师发布或未发布的课程==============
function getmycourses_belong(req,res,next){  //type:'0未发布', '1已发布'
    var user_id = req.session.userinfo.user_id , type=req.body.type;
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'});

    course.getmycourses_belong({ user_id: user_id ,  type:type},function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 ,datas:result });
    });  //task.gettask end 
}

//===============================================


//===================获取老师开发的课程列表信息==============
function getmycourses(req,res,next){
    var user_id = req.session.userinfo.user_id ;
    course.getmycourses({ user_id: user_id ,  isvalid:'1' },function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 ,datas:result });
    });  //task.gettask end 
}

//===============================================



//===================获取学习课程列表信息==============
// function getmycourse(req,res,next){
//     var course_id = req.body.course_id ,user_id = req.session.userinfo.user_id ;

//     course.getmycourse({course_id:course_id, user_id: user_id},function(err,result){
//         if(err) return  res.send({code:204 , err:err});
//         else res.send({ code:201 ,datas:result });
//     });  //task.gettask end 
// }

//===============================================


//===================获取task信息=================
function gettask(req,res,next){
    var task_id = req.body.task_id ;

    task.gettaskele_allinfo({task_id:task_id},function(err,result){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 ,datas:result });
    });  //task.gettask end 
}

//==============================================




//===================下载taskfile==========
function downtaskfile(req,res,next){  
   var id = req.query.id, type = req.query.type ;
   if(id == '' || id == undefined)  return res.write("{\"error\":0}");
   if(type != 'dev' && type != 'study' &&  type != 'step')  return res.write("{\"error\":0}");
    
   if(type == 'dev'){ //下载老师开发的课程文档

       task.fun_getTaskFile({task_file_id:id , isvalid:'1'},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.diskname , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = filename + "." + filetype;

                if(flag == false ) res.write("{\"error\":1}");
                else  return res.download(filepath, newfilename);

           }); //fs.exists end
       }); //task.fun_getTaskFile end 

   }    



   if(type == 'study'){ //下载学习过程中的课程文档
           study.getStudyFile({study_file_id:id},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.filename , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = filename + "." + filetype;
                if(flag == false ) res.write("{\"error\":1}");
                else  return res.download(filepath, newfilename);
           }); //fs.exists end

       });
   }

   if(type == 'step'){ //下载学习过程中的x协作文档
       
           study.getStudyStepFile({study_step_file_id:id},function(err,filedoc){ if(err) console.log(err);
           var filepath = filedoc.filepath , filename =  filedoc.filename , filetype =filedoc.filetype ;
           fs.exists(filepath,function(flag){
                var newfilename = filename + "." + filetype;
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





//===================下载office后台的文档到课程开发中==========
function downloadOfficeFile_dev(req,res,next){  
   var id = req.query.id, url = req.query.url;
   if(id == '' || id == undefined)  return  res.send({code:204 , err:"ID参数不正确"});
   if(url == '' || url == undefined)  return res.write({code:204 , err:"URL参数不正确"});
    
    task.downloadOfficeFile_dev(id,url,function(err){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

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



//修改任务的描述，限富文本和“office”类型时更新：office_url
function updatetaskele(req,res,next){
    
    var task_ele_id = req.body.task_ele_id , txt = req.body.txt , office_url = req.body.office_url  ;
    if(task_ele_id == '' || task_ele_id == undefined)  return res.send({code:204,err:'task_ele_id参数不正确'});
    if(txt == undefined && office_url == undefined )  return res.send({code:204,err:'txt或office_url参数不正确'});
    var data = { };
    if(txt != undefined) data.txt = txt;  if(office_url != undefined) data.office_url = office_url;

    
    var wherejson = {task_ele_id: task_ele_id };
    

    task.updateTaskEle( data ,wherejson ,function(err){ 
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}






//添加描述
function addtaskele(req,res,next){
    var task_id = req.query.task_id , step_id = req.query.step_id  , type = req.query.type, ele = req.query.ele, belong = req.query.belong;
    //if(task_id == '' || task_id == undefined)  return res.send({code:204,err:' task_id 参数不正确'}); 
    if(type!='text' && type!='office' && type!='upload' && type!='cloud_file' )  return res.send({code:204,err:' type 参数不正确'}); 
    if(ele!='des' && ele!='task_result' && ele!='theory'  )  return res.send({code:204,err:' ele 参数不正确'}); 
    if(belong!='task' && belong!='step'  )  return res.send({code:204,err:' belong 参数不正确'}); 
    
    var task_ele_id = UUID.v1()  ,creater = req.session.userinfo.user_id ,create_time = new Date();
    var data = {task_ele_id:task_ele_id,ele:ele,   type:type ,isvalid:'1',creater:creater,create_time:create_time ,belong:belong};
    if(belong == 'task') { if(task_id == '' || task_id == undefined )  return res.send({code:204,err:' task_id 参数不正确'}); else data.task_id = task_id; }  
    if(belong == 'step') { if(step_id == '' || step_id == undefined )  return res.send({code:204,err:' step_id 参数不正确'}); else data.step_id = step_id; }    

    var result = data;

    var ep =new EventProxy();

    ep.all('Add',function(){  //--添加描述事件
        result.belong = belong;
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
            else { result.task_file_id = filedoc.task_file_id;  result.filename = filedoc.filename  ;  result.filetype = filedoc.filetype ;     ep.emit('Add');} 
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



//获取步骤的数据信息
function getstep(req,res,next){
    var step_id = req.body.step_id;
    if(step_id == '' || step_id == undefined)  return res.send({code:204,err:'step_id参数不正确'});

    course.getstep(step_id, function(err, result) {
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201,  datas: result });
    });

}














//=================详细任务的操作==================================




//添加详细任务
function addtask(req,res,next){
    
    var step_id = req.body.step_id , title =req.body.title  , rolename = req.body.rolename , iscooperation = req.body.iscooperation ;
    if(step_id == '' || step_id == undefined)  return res.send({code:204,err:'step_id参数不正确'});
    if(title == '' || title == undefined)  return res.send({code:204,err:'title参数不正确'});
    var creater = req.session.userinfo.user_id , create_time = new Date() ; 
    var task_id = UUID.v1() ; 
    var data = { task_id: task_id , step_id : step_id ,isvalid:'1' , creater:creater, create_time:create_time };

    if(rolename !='' && rolename !=undefined)  data.rolename = rolename;
    if (iscooperation == '' && iscooperation == undefined) iscooperation = '0';
    data.iscooperation = iscooperation;

    //console.log(data,concrete_task);

    course.addtask( data ,function(err,doc){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 , datas: {task_id:task_id } });
    });

}


//修改一个详细任务
function updatetask(req,res,next){
    var task_id = req.body.task_id  , title =req.body.title, other_role_result = req.body.other_role_result, exam_id =  req.body.exam_id , rolename = req.body.rolename , 
      iscooperation = req.body.iscooperation  ;
    if(task_id == '' || task_id == undefined)  return res.send({code:204,err:'task_id参数不正确'});

    var data={updater: req.session.userinfo.user_id , update_time: new Date() }, wherejson = {task_id:task_id};

    if(title != undefined ) data.title = title;
    if(other_role_result != undefined ) data.other_role_result = other_role_result;
    if(exam_id != undefined ) data.exam_id = exam_id;
    if(rolename !=  undefined) data.rolename = rolename;
    if(iscooperation !=  undefined) data.iscooperation = iscooperation;

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


//发布学习情境
function completedcoursechild(req,res,next) {
    var updater = req.session.userinfo.user_id  ; 
    var update_time = new Date();
    var course_child_id = req.body.course_child_id;
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'});
    
    var data = {iscompleted:'1',  update_time:update_time  ,   updater:updater };
    
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
    if(req.body.pngpath != '' || req.body.pngpath != undefined)  data.pngpath = req.body.pngpath; 


    var table =  config[mgenv].mysql.header + "_cd_course_child";

   var  coursechild_filepath = config[mgenv].courseDeve.rootpath + "/" +  course_id+  "/" + course_child_id;
   mkdirpath(coursechild_filepath,function(err){ if(err) return res.send({code:204 , err:err});

        templater.add( table , data, function(err,doc){
            if(err)	 return  res.send({code:204 , err:err});
            else   return  res.send({ code:201 ,datas:{course_child_id:course_child_id}  });
        }); //templater.add  end	  

   });
}





//上传文件
function uploadFile(path, req, callback){
    
    var form =new formidable.IncomingForm();
    form.keepExtensions =true;    //keep .jpg/.png
    form.uploadDir = path;   //upload path});
    form.encoding = 'utf-8';   
    form.maxFieldsSize = 2048 * 1024 * 5;   //文件大小
    
    mkdirpath(path,function(err){
        if(err)	 return callback(err);  
        form.parse(req,function(err, fields, files){
            if(err) return callback(err);
            console.log("files:",files);
            var name = files.file.name;
            var filetype = name.substr( name.lastIndexOf(".") + 1 );
            var size  = files.file.size;

            var oldFilepath =  files.file.path;
            var diskname =  UUID.v1() + "." + filetype;
            var newFilepath = path + "/" + diskname ;

            fs.renameSync(oldFilepath, newFilepath);
            var data = {path:newFilepath,diskname:diskname, name:name, filetype:filetype  , size:size  };
            return callback(err,data);

        });//form.parse end
            
    }); //mkdirpath end

}



//上次临时的文件    
function uploadtmpfile(req,res,next){ 

    var pngpath = config[mgenv].courseDeve.pngtemppath;

    uploadFile(pngpath,req,function(err,fileDoc){
        if(err)	 return res.send({code:204 , err:err}); 
        else res.send({ code:201 , datas:{path:fileDoc.path  } });

    }); //uploadFile 

}



//上传课程简介图像
function uploadpng(req,res,next) {
    course_id = req.query.course_id;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'});

    var pngpath = config[mgenv].courseDeve.pngpath;

    uploadFile(pngpath,req,function(err,fileDoc){
        if(err)	 return res.send({code:204 , err:err}); 
        
        var table =  config[mgenv].mysql.header + "_cd_course";
        var wherejson = {course_id:course_id} , data = {pngpath: fileDoc.path }; 
        templater.update(table, wherejson,  data,  function(err,doc){
            if(err) return  res.send({code:204 , err:err});
            else res.send({ code:201, datas:{path: fileDoc.path} });
        });

    }); //uploadFile 

}



function downloadpng(req,res) {
    var user_id = req.session.userinfo.user_id;
    if(user_id == '' || user_id == undefined)  return res.send({code:204,err:'session数据不正确'});

    var path = req.query.path;
    if(user_id == '' || user_id == undefined)  return res.send({code:204,err:'path数据不正确'});

    return res.download(path);

}



//上传学习情景的简介图像
function uploadpngchild(req,res,next) {
    course_id = req.query.course_id , course_child_id = req.query.course_child_id  ;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'});
    if(course_child_id == '' || course_child_id == undefined)  return res.send({code:204,err:'course_child_id参数不正确'});

    var pngpath = config[mgenv].courseDeve.pngpath + "/" + course_id + "/" + course_child_id;
   
    fs.exists(pngpath,function(flag){
        if(flag == false ) return res.send({code:204 , err:"学习领域或学习情景数据不匹配"}); //文件夹不存在

        uploadFile(pngpath,req,function(err,fileDoc){
            if(err)	 return res.send({code:204 , err:err}); 
            
            var table =  config[mgenv].mysql.header + "_cd_course_child";
            var wherejson = {course_child_id:course_child_id}  , data = {pngpath: fileDoc.path }; 
            templater.update(table, wherejson,  data,  function(err,doc){
                if(err) return  res.send({code:204 , err:err});
                else res.send({ code:201 , datas:{path: fileDoc.path} });
            });

        }); // fs.exists end
    }); //uploadFile 



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
    if(req.body.pngpath != '' || req.body.pngpath != undefined)  data.pngpath = req.body.pngpath; 

    var table =  config[mgenv].mysql.header + "_cd_course";
    templater.add( table , data, function(err,doc){
        if(err)	 return  res.send({code:204 , err:err});
        else   return  res.send({ code:201 ,datas:{course_id:course_id}  });
    }); //templater.add  end	  


}



//发布课程到机构
function coursebelong(req,res,next) {
    var  user_id = req.session.userinfo.user_id ; 
    var  dept_ids = JSON.parse(req.body.dept_ids) ;
    var  course_id = req.body.course_id;
    if(course_id == '' || course_id == undefined)  return res.send({code:204,err:'course_id参数不正确'}); 
    if(dept_ids == '' || dept_ids==undefined )  return res.send({code:204,err:'dept_ids参数不正确'}); 
    if(dept_ids.length <= 0 )  return res.send({code:204,err:'dept_ids为空数据'});     

    var datas = [];
    var create_time = new Date();
    for(var i=0; i< dept_ids.length; i++) {
        //console.log(i);
        var tmpdata =  {belong_id:UUID.v1() , course_id:course_id , dept_id:dept_ids[i], isvalid:'1' , creater: user_id ,create_time:create_time};
        datas.push(tmpdata); 
    }
    
    var table =  config[mgenv].mysql.header + "_cd_belong";     
    //console.log(table ,datas , dept_ids );
    templater.add_Arry(table,datas,function(err,docs) {
          if(err) console.log(err);
          console.log("Arry Docs:",datas); 
          return res.send({ code:201 ,datas:datas });
    });
}


//删除机构的课程
function delcoursebelong(req,res,next) {
    //var  user_id = req.session.userinfo.user_id ; 
    var  belong_id = req.body.belong_id ;

    if(belong_id == '' || belong_id == undefined)  return res.send({code:204,err:'belong_id参数不正确'});   

    var data = {isvalid:'0'};
    var table =  config[mgenv].mysql.header + "_cd_belong";
    var wherejson = {belong_id:belong_id}; 
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });
}






module.exports = router;





// //算法实现：  语言JS

// //先设全局变量 ,假设B为要查找的降序数组 , res为查找结果
//    var x=2 , a=0 , B=[8, 7,6,5,4,3,2,1] , len=8;
   
//    var res;  

//    res = f(a,len);

//    function f(a,len) {
//        if(len==0 || a+1 > len ) return 0; //空数组或参数不正确(如：查找起点参数大于结束点:a+1 > len),返回0
//        else if(len-a == 1) { //如果查找的有效元素只有一个,直接比较x
//            if(B[a]==x) return 1; else  return 0;
//        } else if(len-a == 2) { //如果查找的有效元素只有2个,直接比较x是否存在
//            if(B[a]==x || B[a+1]==x)  return 1; else  return 0;
//        } else{
//            var z = parseInt( (a+len-1)/2 ) ;  //取中值位置, 如 1.5取1.

//            //分析1： 如果中值 > X 即x位于中值后半段, 则重复函数f进行查找，新的查找起点为中值点后一位， 查找末点len不变。
//            if(B[z] > x) {var a2=z+1, len2=len;}
//            //分析2： 如果中值  < X 即x位于中值前半段, 则重复函数f进行查找，新的查找起点不变， 查找末点为中值前一位。
//            if(B[z] < x) {var a2=a, len2= z}   //提醒：len为数组长度即中值前一位再+1： z-1+1= z
           
//            if(B[z] == x)  return 1;  //刚好中值为x, 找到返回1； 
//            else return f(a2,len2);   //如果中值不等于x,则重复函数f找到为止。
//        } 

//    }




























