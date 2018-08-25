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

var _ACT =  global.mongoDB.collection.activity;
var _STEP = global.mongoDB.collection.step;
var _TASK = global.mongoDB.collection.concrete_task;


var _DES =  global.mongoDB.collection.des;
var _TASK_RES =  global.mongoDB.collection.task_result;

var _TASK_FILE =  global.mongoDB.collection.task_file;
var _TASK_ELE =  global.mongoDB.collection.task_ele;

var _EXAM =  global.mongoDB.collection.mx_qt_exam;

function task(data) {
     this.data = data;
}

//============获取云文件作为课程开发文件=============================================

    //设置好task_file的ID,获取云文件后，移动到课程开发文件系统，并返回文件数据
    //***注意：如果云文件系统与此系统分离, 必须处理云文件系统跨域的问题 */
task.CreateCloudFile = function (data,callback){
    
    var sourceType = data.sourceType,filename=data.filename , filetype = data.filetype ,  fileID= data.fileID;
    if(sourceType  ==  'myself') var url = config[mgenv].courseDeve.file_domain + "/file/disk/downloadfile?file_id=" + fileID;  
    else if(sourceType  ==  'shore')  var url = config[mgenv].courseDeve.file_domain + "/file/disk/downloadsharefile?shore_file_id=" + fileID; 
    else  return callback("sourceType参数类型不正确");

    if(data.belong!='task' && data.belong!='step')   return callback(' belong 参数不正确');
    var ep =new EventProxy();

    ep.all('GO',function(doc){  //--开始处理文件

        var course_id = doc.course_id, course_child_id = doc.course_child_id;
        var diskname = filename + "_" + UUID.v1();
        var filepath = config[mgenv].courseDeve.rootpath + "/" + course_id  + "/" + course_child_id + "/" + diskname + "." +  filetype ;
         console.log(data,url, doc, filepath);

        var options = {  cache: 'file' } ;
        var request = require('then-request');
        console.log("url:",url,filepath);
        request('GET', url , options).done(function (res) {
            fs.writeFileSync(filepath,res.getBody());

            var task_file_id = UUID.v1() ;
            var  filedata = {task_file_id:task_file_id,diskname:diskname, filename:filename, filetype:filetype  , size:0 ,isvalid:'1',filepath:filepath , 
                course_id:doc.course_id, course_child_id:doc.course_child_id,activity_id: doc.activity_id,step_id:doc.step_id };               
            fun_addTaskFile(filedata,function(err){  return callback(err,filedata);  }); //文件上传完成后，开始写数据库
        });

    });




    //判断是为哪一层处理数据
    if(data.belong=='task') {
        _TASK.findOne({task_id:data.task_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
             ep.emit('GO',doc);
        });

    } else if(data.belong=='step'){
        _STEP.findOne({step_id:data.step_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
            ep.emit('GO',doc);
        });
    } //if end


}




//==================================================================================



//============office回调函数：更新课程开发的office文档===================================

function fun_updateOffice(filepath,req,callback) {
    
    var updateFile_2 = function (body,path) {
        if(body.status==2) {
            console.log(body.url);
            var file_2= syncRequest("GET",body.url);
            fs.writeFileSync(path,file_2.getBody());
        }
        return callback(null);
    }

    var readbody_2 = function (response,  path) {
        var content = "";
        request.on("data", function (data) {
            content += data;
        });
        request.on("end", function () {
            var body = JSON.parse(content);
            updateFile_2(body, path);
        });
    }

    if(req.body.hasOwnProperty("status")) updateFile_2(req.body,filepath);
    else readbody_2(req, filepath);
}




//id为task_file——id
task.trackfile = function(id,req,callback){
    if(id == '' || id == undefined)  return callback(' id 参数不正确');
    _TASK_FILE.findOne({task_file_id:id, isvalid:'1'}, function(err,filedoc){  if(err || !filedoc) return callback(err);
        var filepath = filedoc.filepath;
        fun_updateOffice(filepath,req,function(err){ if(err) console.log(err);
            return callback(null); 
        });
    });
}
//==================================================================================







//============office下载函数：下载office后台的文档到课程开发中===================================

// function fun_updateOffice(filepath,req,callback) {
    
//     var updateFile_2 = function (body,path) {
//         if(body.status==2) {
//             console.log(body.url);
//             var file_2= syncRequest("GET",body.url);
//             fs.writeFileSync(path,file_2.getBody());
//         }
//         return callback(null);
//     }

//     var readbody_2 = function (response,  path) {
//         var content = "";
//         request.on("data", function (data) {
//             content += data;
//         });
//         request.on("end", function () {
//             var body = JSON.parse(content);
//             updateFile_2(body, path);
//         });
//     }

//     if(req.body.hasOwnProperty("status")) updateFile_2(req.body,filepath);
//     else readbody_2(req, filepath);
// }




//id为task_file——id :  编辑课程中使用
task.downloadOfficeFile_dev = function(id,url,callback){
    if(id == '' || id == undefined)  return callback('id参数不正确');
    _TASK_FILE.findOne({task_file_id:id, isvalid:'1'}, function(err,filedoc){  if(err || !filedoc) return callback(err);
        var filepath = filedoc.filepath;

        var options = { cache: 'file' } ;
        var request = require('then-request');
        console.log("url:",url,filepath);
        request('GET', url , options).done(function (res) {
            fs.writeFileSync(filepath,res.getBody());
            //将URL写入file数据库中
            _TASK_FILE.update( {task_file_id:id, isvalid:'1'}, { $set:{office_url: url} },{multi:true},function(err,doc){   return  callback(err); }); 
        });

    }); //_TASK_FILE.findOne end 
}






//==================================================================================




















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






//============函数：添加一个描述: 复制office模板方式===================================


//复制空文档到任务文件中
task.crteateOffice =function(data,callback){
    console.log(data);
    var filetype = data.filetype,  filename = data.filename ;
    if(filetype == '' || filetype == undefined)  return res.send({code:204,err:' filetype 参数不正确'});
    if(filename == '' || filename == undefined)  return res.send({code:204,err:' filename 参数不正确'});
    //filename = filename.substr(0, filename.lastIndexOf("."));
    var sourcepath = config[mgenv].courseDeve.template, templateName = config[mgenv].courseDeve.templateName;

    if(data.belong!='task' && data.belong!='step')   return callback(' belong 参数不正确');
    var ep =new EventProxy();


    ep.all('GO',function(doc){  //--开始处理文件

        console.log(sourcepath);
        mkdirpath(sourcepath,function(err){   if(err) return callback(err);
            sourcepath = sourcepath +  "/" + templateName + "." + filetype;

                var course_id = doc.course_id, course_child_id = doc.course_child_id;
                var  diskname = filename + "_" + UUID.v1();
                
                var destpath = config[mgenv].courseDeve.rootpath + "/" + course_id  + "/" + course_child_id;

                mkdirpath(destpath,function(err){   if(err) return callback(err);
                destpath= destpath  + "/" + diskname+ "." + filetype; ;
                    console.log(destpath);
                    copyfile(sourcepath,destpath, function(err){  if(err) return callback(err);
                        var task_file_id = UUID.v1() ;
                        var  filedata = {task_file_id:task_file_id,diskname:diskname, filename:filename, filetype:filetype  , size:0 ,isvalid:'1',filepath:destpath , 
                            course_id:doc.course_id, course_child_id:doc.course_child_id,activity_id: doc.activity_id,step_id:doc.step_id };               
                        fun_addTaskFile(filedata,function(err){  return callback(err,filedata);  }); //文件上传完成后，开始写数据库
                    });
                });


        }); //mkdirpath end 


    });


    //判断是为哪一层处理数据
    if(data.belong=='task') {
        _TASK.findOne({task_id:data.task_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
             ep.emit('GO',doc);
        });

    } else if(data.belong=='step'){
        _STEP.findOne({step_id:data.step_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
            ep.emit('GO',doc);
        });
    } //if end



  


}


//==================================================================================





//============函数：添加一个描述: 上传文件方式===================================

function fun_addTaskFile(data, callback){ 
    _TASK_FILE.insert(data, function(err,doc){ return  callback(err); });   
}


//获取上传的文件，并存入到sourcePath，重命名后，返回文件信息。
function fun_uploadfile(data,req,callback){
        var sourcePath = data.sourcePath;
        var form =new formidable.IncomingForm();
        form.keepExtensions =true;    //keep .jpg/.png
        form.uploadDir = sourcePath;   //upload path});
        form.encoding = config[mgenv].courseDeve.encoding ; 
        form.maxFieldsSize = config[mgenv].courseDeve.maxFieldsSize ;  //文件大小
        
        var fields , files;
        form.parse(req,function(err, fields_tmp, files_tmp){ if(err) return callback(err);
            fields = fields_tmp, files = files_tmp ;
        });

        form.on('end', function() {
            console.log("ENNDDD !");
            console.log("data:",data);  //var name = files.myfile.name;
            var name = files.myfile.name ,size  = files.myfile.size;
            var oldFilepath =  files.myfile.path;
            var filetype = name.substr( name.lastIndexOf(".") + 1 );
            var filename = name.substr(0, name.lastIndexOf(".") );
            var diskname = filename + "_" + UUID.v1();
            var newFilepath = sourcePath + "/" + diskname + "." + filetype;
            console.log(oldFilepath , newFilepath);

            fs.rename(oldFilepath, newFilepath);
            
            var task_file_id = UUID.v1();
            var filedata = {task_file_id:task_file_id, course_id:data.course_id , course_child_id:data.course_child_id ,filepath: newFilepath , 
                 diskname:diskname, filename:filename, filetype:filetype,size:data.size ,isvalid:'1'};
            
            //文件上传完成后，开始写数据库
            fun_addTaskFile(filedata,function(err){  return callback(err,filedata);  });
        });

}



//----上传的图片和动画 视频------//
task.uploadfile = function (data,req,callback){

    if(data.belong!='task' && data.belong!='step')   return callback(' belong 参数不正确');
    var ep =new EventProxy();


    ep.all('upload',function(doc){  //--开始上传文件
        data.course_id = doc.course_id, data.course_child_id = doc.course_child_id;
        data.sourcePath = config[mgenv].courseDeve.rootpath + "/" + doc.course_id  + "/" + doc.course_child_id ;
        
        mkdirpath(data.sourcePath ,function(err){   if(err) return callback(err);
            fun_uploadfile(data ,req,function(err,filedoc){  return callback(err,filedoc);  });   
        });
    });



    //判断是为哪一层处理数据
    if(data.belong=='task') {
        _TASK.findOne({task_id:data.task_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
             ep.emit('upload',doc);
        });

    } else if(data.belong=='step'){
        _STEP.findOne({step_id:data.step_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
            ep.emit('upload',doc);
        });
    } //if end


}






//============函数：添加一个任务描述===================================
function fun_eleType_count(data,callback){
    var count = 0;
    _TASK_ELE.find(data).toArray(function(err,docs){  if(err) return callback(err); 
        count = docs.length;
        return callback(err,count)
    });
}

function fun_adddes(data,callback){
    fun_eleType_count({task_id:data.task_id, isvalid:'1', ele:data.ele , type:data.type },function(err,count){
        if(count > 0 && (data.type=='text' || data.type=='office') ) return  callback("描述此类型元素已存在,不能重复添加");
        _TASK_ELE.insert(data, function(err,doc){ return  callback(err); });  
    });
   
}



//添加任务描述
task.addtaskele =  function(data,callback){

    if(data.belong!='task' && data.belong!='step')   return callback(' belong 参数不正确');
    var ep =new EventProxy();

    ep.all('add',function(doc){  //--开始添加
        data.course_id = doc.course_id, data.course_child_id = doc.course_child_id;
        data.activity_id = doc.activity_id, data.step_id = doc.step_id;
        
        fun_adddes(data,function(err){ return callback(err);  });
    });

    //判断是为哪一层处理数据
    if(data.belong=='task') {
        _TASK.findOne({task_id:data.task_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
             ep.emit('add',doc);
        });

    } else if(data.belong=='step'){
        _STEP.findOne({step_id:data.step_id, isvalid:'1'}, function(err,doc){  if(err) return callback(err);
            ep.emit('add',doc);
        });
    } //if end

}


function fun_updatedes(data, wherejson,callback){
    console.log(data,wherejson);
    _TASK_ELE.update( wherejson, { $set:data  },{multi:true},function(err,doc){ return callback(err); });
}

//更新任务描述
task.updateTaskEle =  function(data, wherejson, callback){
   fun_updatedes(data, wherejson,function(err){ return callback(err);  });
}


//--获取符合条件的所有task_result
function get_task_files(data,callback){
    _TASK_FILE.find(data).toArray(function(err,docs){ return callback(err,docs); });
}


    
//更新任务描述
task.gettask_eles =  function(data, callback){
   gettask_eles(data, function(err,result){ return callback(err,result);  });
}


//查询符合条件的task_ELE信息
function gettask_eles(data,callback){
    var returnFlag=0, result = {des:[],task_result:[] , theory:[] };
    _TASK_ELE.find(data).toArray(function(err,docs){  if(err) return callback(err); 
        if(docs.length <= 0) return callback(err,result);
        
        var flag = 0, end = docs.length;
        for(var i=0;i<docs.length;i++ ){ var ele = docs[i];   delete ele.sourcePath;
           //result[ele.ele].push(ele) ;
           
           if(ele.type == "office" || ele.type == "upload" || ele.type == "cloud_file"  )  {
               ele.files = [];
                (function(ele){
                    get_task_files({ task_ele_id: ele.task_ele_id, isvalid:'1'},function(err,taskfiledocs){  if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                        for(var j=0;j<taskfiledocs.length;j++ ) delete taskfiledocs[j].filepath;
                        ele.files=taskfiledocs;    result[ele.ele].push(ele) ; 
                        flag++; 
                        if(flag == end) return callback(err,result); 
                    });
                })(ele);
           } else { result[ele.ele].push(ele) ;  flag++; if(flag == end) return callback(err,result);     }
        } //for end
    });
}








//获取任务模板的所有信息
function fun_gettaskele_allinfo(data,callback){
    var result = {};
    _TASK.findOne(data,function(err,doc){  if(err) return callback(err);   if(doc == undefined)   return callback(err,result); 
        result = doc;

        var ep =new EventProxy();
        ep.all('GO',function(){  
            gettask_eles({task_id:doc.task_id, isvalid:'1'},function(err,eledocs){  if(err) return callback(err);
                if(eledocs.des != undefined) result.des = eledocs.des; 
                if(eledocs.theory != undefined) result.theory = eledocs.theory;
                if(eledocs.task_result != undefined) result.task_result = eledocs.task_result;

                return callback(err,result);
            });
        });

        if(doc.exam_id) { //获取试题信息
            _EXAM.findOne({exam_id:doc.exam_id } , function(err,examDoc){ if(err) return callback(err); 
                result.exam_title = examDoc.title;
                ep.emit('GO'); 
            }); //_EXAM.findOne end 
        } else { ep.emit('GO');  }
    });
}


//获取任务的信息
task.gettaskele_allinfo =function(data,callback){
   fun_gettaskele_allinfo(data,function(err,result){ return callback(err,result);  });
}


function fun_getTaskFile(data,callback){
    _TASK_FILE.findOne(data,function(err,result){  return callback(err,result);  });
}

//获取
task.fun_getTaskFile = function(data,callback){
    fun_getTaskFile(data,function(err,result){ return callback(err,result);   });
}








//=================================================================













module.exports = task;














