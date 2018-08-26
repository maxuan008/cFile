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


// var app_funs = require("./module/app_funs");
// var apps = require("./module/apps");
// var org = require("./module/org");
// var role = require("./module/role");

var router = express.Router();

var mgenv = global.mgENV;



 router.get('/disk/rootlist',rootlist);   //获取用户根下的子文件夹和文件
 router.get('/disk/childfolderlist',childfolderlist);   //获取子文件夹的子文件夹和文件
 router.post('/disk/updatefolder',updatefolder);   //更新文件夹名
 router.post('/disk/addfolder',addfolder);   //创建新的文件夹
 router.post('/disk/updatefile',updatefile);   //更新文件
 router.post('/disk/uploadfile',uploadfile);   //上传文件

 router.post('/disk/downloadfile',downloadfile);   //下载文件
 router.get('/disk/downloadfile',downloadfile_GET);   //下载文件:GET请求
 
 router.post('/disk/delfile',delfile);   //删除文件

 router.post('/disk/deptshorefile',deptshorefile);   //共享文件到机构，并指定角色可见
 router.get('/disk/deptrootlist',deptrootlist);   //获取机构根下的子文件夹和文件
 router.get('/disk/deptchildfolderlist',deptchildfolderlist);   //获取子文件夹的子文件夹和文件

 router.post('/disk/shorefoldertodept',shorefoldertodept);   //共享文件到机构，并指定角色可见

 router.post('/disk/delfolder',delfolder);   //删除文件夹

 router.get('/disk/findtype',findtype);   //查找相应类型的文件
 
 router.post('/disk/isfoldershored',isfoldershored);   //检测文件夹是否已被在此机构共享过

 router.get('/disk/myshares',myshares);   //获取我共享到机构的文件夹和文件  
 router.post('/disk/delmyshares',delmyshares);   //删除共享文件和文件夹  

 router.post('/disk/downloadsharefile',downloadsharefile);   //下载共享文件
 router.get('/disk/downloadsharefile',downloadsharefile_GET);   //下载共享文件


//查找相应类型的文件
function findtype(req,res) {
        var filetype = req.query.filetype;
        if(filetype == '' || filetype == undefined)  return res.send({code:204,err:'filetype 参数不能为空'});

        var user_id = req.session.userinfo.user_id;
        var user_folder_id = req.session.userfolderinfo.user_folder_id;
        var result = {user_folder_id: user_folder_id};

 
        var filetypes = {
             "picture":['PNG','png','jpg','bmp','svg', 'jepg','tiff' , 'psd', 'gif', 'ai', 'wmf',  'PCX','TIFF',' GIF',' JPEG','SVG','PSD','CDR','PCD','DXF','UFO','EPS','AI','HDRI','RAW','WMF','EMF']  ,    //图片
             "document":['doc','DOC','docx','DOCX','xls','XLS','ppt','PPT','txt','TXT','pdf','PDF','html','HTML','exe','EXE'  ] ,    //文档
             "video": ['mp4', 'MP4', '3gp' , '3GP','mpg' ,  'MPG', 'avi' , 'AVI', 'wmv' , 'WMV', 'flv' ,'FLV', 'swf' , 'SWF' ] ,      //视频
             "music": ['MP3','WMA','MMF','AMR', 'OGG','M4A','WAV', 'wma','mmf','amr','ogg','m4a','wav'] ,        //音乐
             "other":[]
        };

        var where_filetype = '', num = 300;

        var where_alltype ='' , allflag =0;
        for(var key in filetypes) {
            var docs = filetypes[key];

                    var flag = 0;
                    for(var i=0;i<docs.length;i++){
                        allflag++, flag++;
                        var typetmp = docs[i];

                        if(filetype == key ) {
                            if (flag == 1) where_filetype = where_filetype + " ( '" + typetmp + "' ";
                            else  where_filetype = where_filetype + " , '" + typetmp + "' ";
                        }

                        if (allflag == 1) where_alltype = where_alltype + " ( '" + typetmp + "' ";
                        else  where_alltype = where_alltype + " , '" + typetmp + "' ";

                    }//for en

        } //for end 


        where_filetype = where_filetype + " ) ";
        where_alltype = where_alltype + " ) ";



        //1.获取所有的子文件
        var table =  config[mgenv].mysql.header + "_file";

        if(filetype == 'other') {
            var sqlstr = " select file_id, name , type ,size ,create_time from  " + table + " where isvalid = '1' and user_id = '" + user_id + "'   " +
                "and type not in " + where_alltype;
        } else {
            var sqlstr = " select file_id, name , type ,size ,create_time from  " + table + " where isvalid = '1' and user_id = '" + user_id + "'   " +
                "and type in " + where_filetype;
        }

        console.log(sqlstr);
        
        mysql.query(sqlstr , function(err,docs){
            if(err)	 return res.send({code:204 , err:err});
            result.files = docs; 
            return res.send({code:201 , datas:result});
        });   

}




//获取用户根下的子文件夹和文件
function rootlist(req,res) {
        var user_id = req.session.userinfo.user_id;
        var user_folder_id = req.session.userfolderinfo.user_folder_id;
        var account = req.session.userinfo.account;
        var result = {user_folder_id: user_folder_id};
        var returnFlag=0;
         
        var flag = 0 , end =3;

        //1.用户文件夹初始化
        cloudfile.initfolderdata(account,user_id,function(err,userfolderdoc){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 

            flag++;
            if(flag == end) return res.send({code:201 , datas:result});
        });  

        //2.获取所有的子文件夹
        var table_1 =  config[mgenv].mysql.header + "_child_folder";
        var sqlstr_1 = " select child_folder_id, name , parent_id ,create_time from " + table_1 + " where isvalid = '1' and parent_id='" + user_folder_id + "'   ";
        
        mysql.query(sqlstr_1 , function(err,docs){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            result.folders = docs; 

            flag++;
            if(flag == end) return res.send({code:201 , datas:result});
        });   


        //3.获取所有的子文件
        var table_2 =  config[mgenv].mysql.header + "_file";
        var sqlstr_2 = " select file_id, name , type ,size ,create_time from  " + table_2 + " where isvalid = '1' and isroot = '1' and  folder_id='" + user_folder_id + "'  ";
        
        mysql.query(sqlstr_2 , function(err,docs){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            result.files = docs; 
            
            flag++;
            if(flag == end) return res.send({code:201 , datas:result});
        });   

}





//获取子文件夹的子文件夹和文件
function childfolderlist(req,res) {
        var returnFlag=0;
        var user_id = req.session.userinfo.user_id;
        var user_folder_id = req.session.userfolderinfo.user_folder_id;
       
        var child_folder_id = req.query.child_folder_id;
        if(child_folder_id == '' || child_folder_id == undefined)  return res.send({code:204,err:'child_folder_id参数不能为空'});

        var result = {};

        var flag = 0 , end = 2;
        //1.获取所有的子文件夹
        var table_1 =  config[mgenv].mysql.header + "_child_folder";
        var sqlstr_1 = " select child_folder_id, name, parent_id ,create_time from " + table_1 + " where isvalid = '1' and parent_id='" + child_folder_id + "'   ";
        
        mysql.query(sqlstr_1 , function(err,docs){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            result.folders = docs; 

            flag++;
            if(flag == end) return res.send({code:201 , datas:result});
        });   


        //2.获取所有的子文件
        var table_2 =  config[mgenv].mysql.header + "_file";
        var sqlstr_2 = " select file_id, name , type ,size, create_time from  " + table_2 + " where isvalid = '1' and   folder_id='" + child_folder_id + "'  ";

        
        mysql.query(sqlstr_2 , function(err,docs){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            result.files = docs; 
            
            flag++;
            if(flag == end) return res.send({code:201 , datas:result});
        });   

}



//更新文件夹名
function updatefolder(req,res) {
        var child_folder_id = req.body.child_folder_id;
        if(child_folder_id == '' || child_folder_id == undefined)  return res.send({code:204,err:'child_folder_id参数不能为空'});
        
        var newname = req.body.newname;
        if(newname == '' || newname == undefined)  return res.send({code:204,err:'newname参数不能为空'});

        var parent_id = req.body.parent_id;
        if(parent_id == '' || parent_id == undefined)  return res.send({code:204,err:'parent_id参数不能为空'});       

        //查看同级下文件夹名是否重复
        var table =  config[mgenv].mysql.header + "_child_folder";
        var wherejson = {parent_id:parent_id ,  name:newname , isvalid:'1' };
        templater.isExist(table , wherejson ,function(err,flag){  //检测同级下文件夹名是否重复
            if(err)	 return  res.send({code:204 , err:err});
            if(flag == true) return  res.send({code:204 , err:"同级文件夹名已经存在"});    

           var wherejson_2 = {child_folder_id :child_folder_id };
           var data = {name: newname};
            templater.update(table, wherejson_2,  data,  function(err,doc){
                if(err) return  res.send({code:204 , err:err});
                else  return  res.send({ code:201 });
            }); //templater.update end      
        }); //templater.isExist end

}

//创建新的子文件夹
function addfolder(req,res) {
        var user_id = req.session.userinfo.user_id;
        var user_folder_id = req.session.userfolderinfo.user_folder_id;

        var newname = req.body.newname;
        if(newname == '' || newname == undefined)  return res.send({code:204,err:'newname参数不能为空'});

        var parent_id = req.body.parent_id;
        if(parent_id == '' || parent_id == undefined)  return res.send({code:204,err:'parent_id参数不能为空'});       

        //console.log('AAAAAAA');

        //查看同级下文件夹名是否重复
        var table =  config[mgenv].mysql.header + "_child_folder";
        var wherejson = {parent_id:parent_id ,  name:newname , isvalid:'1' };
        templater.isExist(table , wherejson ,function(err,flag){  //检测同级下文件夹名是否重复
            if(err)	 return  res.send({code:204 , err:err});
            if(flag == true) return  res.send({code:204 , err:"同级文件夹名已经存在"});    

            var child_folder_id = UUID.v1();
           var data = {child_folder_id:child_folder_id ,name: newname , parent_id:parent_id ,user_id:user_id,  user_folder_id:user_folder_id  };
            templater.add(table,   data,  function(err,doc){
                if(err) return  res.send({code:204 , err:err});
                else  return  res.send({ code:201 , datas:{child_folder_id:child_folder_id } });
            }); //templater.update end      
        }); //templater.isExist end

}






//更新文件名
function updatefile(req,res) {
        var file_id = req.body.file_id;
        if(file_id == '' || file_id == undefined)  return res.send({code:204,err:'file_id参数不能为空'});
 
        var newname = req.body.newname;
        if(newname == '' || newname == undefined)  return res.send({code:204,err:'newname参数不能为空'});

        var folder_id = req.body.folder_id;
        if(folder_id == '' || folder_id == undefined)  return res.send({code:204,err:'folder_id参数不能为空'});       

        //查看同级下文件名是否重复
        var table =  config[mgenv].mysql.header + "_file";
        var wherejson = {folder_id:folder_id ,  name:newname , isvalid:'1' };
        templater.isExist(table , wherejson ,function(err,flag){  //检测同级下文件名是否重复
            if(err)	 return  res.send({code:204 , err:err});
            if(flag == true) return  res.send({code:204 , err:"同级文件名已经存在"});    

           var wherejson_2 = {file_id :file_id };
           var data = {name: newname};
            templater.update(table, wherejson_2,  data,  function(err,doc){
                if(err) return  res.send({code:204 , err:err});
                else  return  res.send({ code:201 });
            }); //templater.update end      
        }); //templater.isExist end

}



//上传文件
function uploadfile(req,res) {
    var id = req.query.id;
    if(id == '' || id == undefined)  return res.send({code:204,err:'id参数不能为空'});

    var creater = req.session.userinfo.user_id ;  //req.session.userinfo.user_id
    var create_time = moment().format('YYYY-MM-DD HH:mm:ss');


    cloudfile.uploadfile(id,req,function(err,data){
            if(err)  return  res.send({code:204 , err:err});
                
            var user_id = req.session.userinfo.user_id;
            //console.log(req.session);
            var folder_id = req.session.userfolderinfo.user_folder_id;

            var newName = data.newName ;
            var filetype = data.filetype; 
            var diskname = data.diskname + "." + filetype;
            var file_id = UUID.v1(), isroot = '0' ;
            var size = data.size;

            var table =  config[mgenv].mysql.header + "_file";
            console.log(id);
            console.log(folder_id);
            if(id == folder_id ) isroot = '1';

            var data = {
                  file_id:file_id,user_id:user_id , folder_id: id,
                  size: size , isroot:isroot,name:newName,
                  diskname:diskname ,type:filetype,creater:creater,create_time:create_time
                  };
            templater.add( table , data, function(err,doc){
                if(err)	 return  res.send({code:204 , err:err});
                return  res.send({ code:201 , datas:{file_id:file_id, name:newName } });

            }); //templater.add  end

    }); //cloudfile.uploadfile end

}



//下载文件
function downloadfile(req,res) {
    var file_id = req.body.file_id;
    if(file_id == '' || file_id == undefined)  return res.send({code:204,err:'file_id参数不能为空'});
    
    var user_folder_id = req.session.userfolderinfo.user_folder_id;
    var targetpath =   config[mgenv].cloudfolder + "/" + req.session.userfolderinfo.diskname;
    var table =  config[mgenv].mysql.header + "_file";
    
    //1.先查询文件是否存在
    var sqlstr = " select file_id, folder_id , isroot , name , diskname ,type from  " + table + " where isvalid = '1' and  file_id = '" + file_id + "'  ";
    mysql.query(sqlstr , function(err,docs){
       if(err)	 return res.send({code:204 , err:err});
       if(docs.length <= 0 ) return res.send({code:204 , err:"未查询到此文件"});

       var filedoc = docs[0], filetype = docs[0].type ,  folder_id = docs[0].folder_id , name =  docs[0].name , diskname = docs[0].diskname;
       if(folder_id != user_folder_id) targetpath = targetpath +  "/" + config[mgenv].childfolder;      //子文件下文件

       //开始下载前，检测文件是否存在于硬盘
       var filepath = targetpath + "/" + diskname;
       fs.exists(filepath,function(flag){
            var newfilename = name + "." + filetype;
            if(flag == false ) return res.send({code:204 , err:"文件不存在"});
            else  return res.download(filepath, newfilename);
       }); //fs.exists end
       
    }); //mysql.query end

}



//下载文件:GET请求
function downloadfile_GET(req,res) {
    var file_id = req.query.file_id ; //, user_folder_id = req.query.user_folder_id
    if(file_id == '' || file_id == undefined)  return res.send({code:204,err:'file_id参数不能为空'});
    // if(user_folder_id == '' || user_folder_id == undefined)  return res.send({code:204,err:'file_id参数不能为空'});
    

   
    var table =  config[mgenv].mysql.header + "_file",  table_2 =  config[mgenv].mysql.header + "_user_folder"   ;

    
    //1.先查询文件是否存在
    var sqlstr = " select a.file_id, a.folder_id , a.isroot , a.name , a.diskname ,a.type , b.user_folder_id , b.diskname as user_diskname   from  " + table + " as a , " + table_2 + " as b    where a.user_id = b.user_id  " + 
    "  and b.isvalid = '1'  and  a.isvalid = '1' and  a.file_id = '" + file_id + "'  ";
    mysql.query(sqlstr , function(err,docs){
       if(err)	 return res.send({code:204 , err:err});
       if(docs.length <= 0 ) return res.send({code:204 , err:"未查询到此文件"});
       if(docs.length > 1 ) return res.send({code:204 , err:"文件数据不正确"});
        

       var filedoc = docs[0], filetype = docs[0].type ,  folder_id = docs[0].folder_id , name =  docs[0].name , diskname = docs[0].diskname;
       var user_folder_id = docs[0].user_folder_id , targetpath = config[mgenv].cloudfolder + "/" + docs[0].user_diskname  ;   
       if(folder_id != user_folder_id) targetpath = targetpath +  "/" + config[mgenv].childfolder;      //子文件下文件

       //开始下载前，检测文件是否存在于硬盘
       var filepath = targetpath + "/" + diskname;
       fs.exists(filepath,function(flag){
            var newfilename = name + "." + filetype;
            if(flag == false ) return res.send({code:204 , err:"文件不存在"});
            else  return res.download(filepath, newfilename);
       }); //fs.exists end
       
    }); //mysql.query end

}







//删除文件
function cleanfile(filepath,junkpath, callback){
       fs.exists(filepath,function(flag){
            if(flag == false ) return callback("文件不存在");
            else { fs.renameSync(filepath, junkpath); return callback(null);  }

       }); //fs.exists end

            // { //垃圾文件清理
            //     var source = fs.createReadStream(filepath);
            //     var dest = fs.createWriteStream(junkpath );
            //     source.pipe(dest);
            //     source.on('end', function() { 
            //         fs.unlink(filepath, function(err) {
            //              return callback(err);
            //         });
            //     });

            //     source.on('error', function(err) { /* error */ 
            //         return callback(err);
            //     });
            // }   
       
}




//删除文件:注销数据库，然后将文件移至垃圾箱，等待一次性处理；
function delfile(req,res) {
    var ep =new EventProxy();

    var file_id = req.body.file_id;
    var user_folder_id = req.session.userfolderinfo.user_folder_id;
    if(file_id == '' || file_id == undefined)  return res.send({code:204,err:'file_id参数不能为空'});
    var targetpath =  config[mgenv].cloudfolder + "/" + req.session.userfolderinfo.diskname;
    var table =  config[mgenv].mysql.header + "_file";

    //1.先查询文件是否存在
    var sqlstr = " select file_id, folder_id , isroot , name , diskname , type from  " + table + " where isvalid = '1' and  file_id = '" + file_id + "'  ";
    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        if(docs.length <= 0 ) return res.send({code:204 , err:"未查询到此文件"});
        
        var filedoc = docs[0], folder_id = docs[0].folder_id ;
        var name =  docs[0].name , diskname = docs[0].diskname, type = docs[0].type;
        if(folder_id != user_folder_id) targetpath = targetpath +  "/" + config[mgenv].childfolder;      //子文件下文件
        

        //初始化垃圾文件夹
        var filepath = targetpath + "/" + diskname  , junkpath = config[mgenv].junkfolder + "/" + diskname  ;
        
        console.log(filepath);
        console.log(junkpath);
            
            ep.all('delfiledata',function(){
                    var wherejson_2 = {file_id :file_id };
                    var data = {isvalid: '0'};
                    templater.update(table, wherejson_2,  data,  function(err,doc){
                        if(err) return  res.send({code:204 , err:err});
                        else  return  res.send({ code:201 });
                    }); //templater.update end   
            }); //ep.all('delfiledata' end



        cloudfile.initjunkfolder(function(err){
                fs.exists(filepath,function(flag){  
                    if(flag == false ) {console.log('文件不存在,直接注销数据库'); ep.emit('delfiledata'); }
                    else  { //垃圾文件清理
                    
                        cleanfile(filepath,junkpath,function(err){
                            if(err)	 return res.send({code:204 , err:err}); 
                            ep.emit('delfiledata');
                        }); //cleanfile end
                    }//if end
                }); //fs.exists end
        }); // cloudfile.initjunkfolder end

    }); //mysql.query end

}


//删除用户的文件夹
function delfolder(req,res) {

    var user_id = req.session.userinfo.user_id;
    var child_folder_id = req.body.child_folder_id;
    var userfolderdiskname = req.session.userfolderinfo.diskname;

    if(child_folder_id == '' || child_folder_id == undefined)  return res.send({code:204,err:'child_folder_id参数不能为空'});
    
    cloudfile.delfolder(user_id,child_folder_id , userfolderdiskname,function(err){
        if(err)  return res.send({code:204 , err:err}); 
        else return res.send({code:201}); 
    }); //cloudfile.delfolder end



}










//共享文件到机构，并指定角色可见
function deptshorefile(req,res) {
    var user_id = req.session.userinfo.user_id;
    var user_folder_id = req.session.userfolderinfo.user_folder_id;
    var org_id = req.session.orginfo.org_id;

    var file_id = req.body.file_id;
    if(file_id == '' || file_id == undefined)  return res.send({code:204,err:'file_id参数不能为空'});

    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    var role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不能为空'});
   
    var parent_id = req.body.parent_id;
    if(parent_id == '' || parent_id == undefined)  return res.send({code:204,err:'parent_id参数不能为空'});



    //1.获取源文件路径，name, diskname,type;验证文件是否存在；
    //2.获取机构的共享文件夹路径，并初始化；同时获取org_id，dept_folder_id ,  diskname  ；
    //3.将源文件复制到机构共享文件夹中，并插入数据库记录；
   
    var ep =new EventProxy();


    var table =  config[mgenv].mysql.header + "_file";
    var sqlstr = "select name ,type , diskname ,folder_id ,size from " + table + " where isvalid = '1' and  file_id='" + file_id +  "'  "; 
    mysql.query(sqlstr , function(err,filedocs){
            if(err)	 {console.log(err);return res.send({code:204 , err:err});}
            if(filedocs.length <= 0 ) return res.send({code:204 , err:"未查询到此文件"});

            var filedoc = filedocs[0], name = filedocs[0].name  ,type = filedocs[0].type  , diskname = filedocs[0].diskname , folder_id =  filedocs[0].folder_id ;
            console.log('数据库中查找到此文件：', name);
            var sourcepath =  config[mgenv].cloudfolder + "/" + req.session.userfolderinfo.diskname;
            if(folder_id != user_folder_id ){ //文件在子目录下
                    sourcepath = sourcepath + "/" + config[mgenv].childfolder ; 
            }
            sourcepath = sourcepath + "/" + diskname ;

            
            console.log('此文件硬盘路径：', sourcepath);
            //验证文件是否存在
            fs.exists(sourcepath,function(flag){
                    if(flag == false )  return res.send({code:204,err:'源文件不存在'});
                    console.log('源文件在硬盘找到了');
                    
                    var doc = {};

                    ep.all('shoreFile',function(deptfolderdoc){
                        console.log('成功触发 shoreFile',deptfolderdoc);
                        var  dept_folder_id = deptfolderdoc.dept_folder_id;
                        var dept_diskname = deptfolderdoc.diskname;
                        var destpath =  config[mgenv].orgcloudfolder + "/" + req.session.orgfolderinfo.diskname   + "/" + dept_diskname; 
                        var deptfile_diskname = name + "_" + UUID.v1() + "." + type;
                        
                        //判断 parent_id 是否是在机构的根下
                        if(parent_id != dept_folder_id) destpath = destpath + "/" +  config[mgenv].deptfolderfile;
                        destpath = destpath + "/" + deptfile_diskname ;
                        //复制共享文件，并插入数据库
                           
                           
                            console.log('开始复制文件：',sourcepath,destpath );   
                            //复制文件
                            cloudfile.copyfile(sourcepath, destpath, function(err){
                                    if(err)	 {console.log(err);return res.send({code:204 , err:err});} 
                                                               //生成共享文件的新文件名
                                    cloudfile.makeshoreFileUniqueName(parent_id,name,function(err,newshorename){
                                            if(err)	 {console.log(err);return res.send({code:204 , err:err});}
                                            //插入数据库
                                            var table =  config[mgenv].mysql.header + "_shore_file";
                                            var shore_file_id = UUID.v1();
                                            //console.log(req.session.orginfo);
                                            var data = {  shore_file_id:shore_file_id, org_id:org_id , dept_id:dept_id,
                                                          dept_folder_id:dept_folder_id,parent_id:parent_id, name:newshorename ,
                                                          file_id:file_id , diskname:deptfile_diskname,type:type ,
                                                          user_id:user_id, size:filedoc.size
                                                           };
                                            data.role_id_arry = role_id , data.create_time =moment().format('YYYY-MM-DD HH:mm:ss') ,data.creater =user_id ;
                                                console.log('开始数据库写入共享文件信息：',data );
                                            templater.add( table , data, function(err,shore_filedoc){
                                                if(err)	 return  res.send({code:204 , err:err});
                                                console.log('数据库写入共享文件完成' );
                                                return  res.send({ code:201 , datas:{shore_file_id:shore_file_id ,name:name , type:type,size: filedoc.size} });
                                            }); //templater.add  end

                                    }); //cloudfile.makeshoreFileUniqueName end  

                            }); //cloudfile.copyfile     


                        });   // ep.all('shoreFile' end





                    //获取机构的共享文件夹路径，并初始化，同时获取org_id， dept_folder_id ,diskname
                    cloudfile.getdept_folder_info(dept_id,function(err,doctmp){
                         if(err )  return res.send({code:204,err:err});
                         console.log('机构的文件信息：',doctmp );
                         if(doctmp == null) {
                             //如果数据库中不存在，则开始初始化机构文件夹
                              console.log("开始初始化机构文件夹:", docs)
                             cloudfile.initdeptfolderdata(org_id,dept_id ,function(err,deptfolderdoc){
                                
                                 if(err) return res.send({code:204,err:err});
                                 console.log(deptfolderdoc);
                                  doc = deptfolderdoc;
                                 console.log("初始化机构文件夹:", deptfolderdoc)
                                 ep.emit('shoreFile',deptfolderdoc);
                             });
                         } else {   doc = doctmp; console.log('开始触发 shoreFile',doc); ep.emit('shoreFile',doc);  }




                    });  //cloudfile.getdept_folder_info end

            }); // fs.exists end
     }); //mysql.query end
}

 



//获取机构根下的子文件夹和文件 
function deptrootlist(req,res){
    var returnFlag = 0;
    var dept_id = req.query.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    var flag = 0 , end = 3 , result = {dept_folder_id:''};

    cloudfile.getdept_folder_info(dept_id,function(err,doc){
        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 

        result.dept_folder_id = doc.dept_folder_id;

       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });


    var table_1 =  config[mgenv].mysql.header + "_shore_folder";
    var sqlstr_1 = "select shore_folder_id, name ,  dept_folder_id ,create_time from  " + table_1 + " where  isvalid = '1' and  dept_id = '" + dept_id + "' " + 
    " and parent_id = dept_folder_id ";
    console.log(sqlstr_1);
    mysql.query(sqlstr_1 , function(err,folderdocs){
       if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
       console.log(folderdocs);
       result.folders = folderdocs;
       if(folderdocs.length >0 ) result.dept_folder_id = folderdocs[0].dept_folder_id;
      
       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });

    var table_2 =  config[mgenv].mysql.header + "_shore_file";
    var sqlstr_2 = "select shore_file_id, name , type, size ,  create_time from  " + table_2 + " where isvalid = '1' and  dept_id = '" + dept_id + "' " + 
    " and parent_id = dept_folder_id ";
    console.log(sqlstr_2);
    mysql.query(sqlstr_2 , function(err,filedocs){
       if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
       result.files = filedocs;
       console.log(filedocs);
       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });

}



//获取子文件夹的子文件夹和文件 
function deptchildfolderlist(req,res){
    var returnFlag = 0;
    var shore_folder_id = req.query.shore_folder_id;
    if(shore_folder_id == '' || shore_folder_id == undefined)  return res.send({code:204,err:'shore_folder_id参数不能为空'});

    var flag = 0 , end = 2 , result = {};
    var table =  config[mgenv].mysql.header + "_dept";
    var table_1 =  config[mgenv].mysql.header + "_shore_folder";
      
    var sqlstr_1 = "select a.shore_folder_id, a.name ,a.create_time, b.name as `dept_name` from  " + table_1 + " as a , " + table + " as b  where  a.dept_id = b.dept_id " + 
        " and a.isvalid = '1' and  a.parent_id = '" + shore_folder_id + "' ";
        
        console.log(sqlstr_1);

    mysql.query(sqlstr_1 , function(err,folderdocs){
       if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
       result.folders = folderdocs;
      
       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });

    var table_2 =  config[mgenv].mysql.header + "_shore_file";
    
    var sqlstr_2 = "select a.shore_file_id, a.name , a.type , a.size ,  a.create_time, b.name as `dept_name`  from  " + table_2 + " as a , " + table + " as b  where  a.dept_id = b.dept_id " +
        " and a.isvalid = '1' and  a.parent_id = '" + shore_folder_id + "' ";
   console.log(sqlstr_2);
   
    mysql.query(sqlstr_2 , function(err,filedocs){
       if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
       result.files = filedocs;
       
       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });

}




//共享文件夹到机构，并指定角色可见
function shorefoldertodept(req,res ,next){
    var user_id = req.session.userinfo.user_id;
    var  child_folder_id = req.body.child_folder_id;
    if(child_folder_id == '' || child_folder_id == undefined)  return res.send({code:204,err:'child_folder_id参数不能为空'});
    
    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    var role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不能为空'});

    var parent_id = req.body.parent_id;
    if(parent_id == '' || parent_id == undefined)  return res.send({code:204,err:'parent_id参数不能为空'});

    console.log("开始调用云文件的共享函数...");
    cloudfile.shorefoldertodept(parent_id, user_id , child_folder_id,dept_id, role_id,function(err,doc){
    console.log("云文件的共享函数调用完成...");
    if(err) {console.log('AAAA:',err);  return res.send({code:204 , err:err});  } 
     else return res.send({code:201 , datas:doc});
    });


}





//检测文件夹是否已被在此机构共享过：
function isfoldershored(req,res){
    var  child_folder_id = req.body.child_folder_id;
    if(child_folder_id == '' || child_folder_id == undefined)  return res.send({code:204,err:'child_folder_id参数不能为空'});
    
    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    var table =  config[mgenv].mysql.header + "_shore_folder";
    var sqlstr = " select shore_folder_id from  " + table + " where  isvalid='1' and  child_folder_id = '" + child_folder_id + "' and  dept_id = '" + dept_id +"' ";
    mysql.query(sqlstr , function(err,docs){
       if(err)	 return res.send({code:204 , err:err});
       var c = docs.lengt;
       if(c<=0) return res.send({code:201 , datas:{flag:false  }  });
       else  return res.send({code:201 , datas:{flag:true  }  });


    }); //mysql.query


}






//获取我共享到机构的文件夹和文件 
function myshares(req,res){
    var returnFlag = 0;
    var user_id = req.session.userinfo.user_id;
    //var shore_folder_id = req.query.shore_folder_id;
    //if(shore_folder_id == '' || shore_folder_id == undefined)  return res.send({code:204,err:'shore_folder_id参数不能为空'});

    var flag = 0 , end = 2 , result = {};
    var table =  config[mgenv].mysql.header + "_dept";
    var table_1 =  config[mgenv].mysql.header + "_shore_folder";
    var sqlstr_1 = "select a.shore_folder_id, a.name, a.create_time , b.name as `dept_name`  from  " + table_1 + " as a , " + table + " as b  where a.dept_id = b.dept_id " + 
        " and a.isvalid = '1' and  a.user_id = '" + user_id + "' and  a.parent_id = a.dept_folder_id ";
    mysql.query(sqlstr_1 , function(err,folderdocs){
       if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
       result.folders = folderdocs;
      
       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });

    var table_2 =  config[mgenv].mysql.header + "_shore_file";
    var sqlstr_2 = "select a.shore_file_id, a.name , a.type ,a.size , a.create_time, b.name as `dept_name`   from  " + table_2 + " as a , " + table + " as b   where a.dept_id = b.dept_id " + 
        " and a.isvalid = '1'  and a.user_id = '" + user_id + "' and  a.parent_id = a.dept_folder_id  ";
    mysql.query(sqlstr_2 , function(err,filedocs){
       if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
       result.files = filedocs;
       
       flag++;
       if(flag == end) return res.send({code:201 , datas:result});
    });

}



//删除共享文件和文件夹
function delmyshares(req,res){
    var returnFlag = 0;
    var user_id = req.session.userinfo.user_id;
    var end = 0;
    var  files = req.body.files ,  folders = req.body.folders;

    if( (files == '' || files == undefined)  && (folders == '' || folders == undefined)    ) return res.send({code:204,err:'未查询要删除的文件'});
    if(files)  { end++ ; files =JSON.parse(files) ; }
    if(folders) { end++ ; folders =JSON.parse(folders);} 

    console.log(files,folders )

    var flag = 0;
    if(files) {  //删除共享文件
        cloudfile.delshorefiles(user_id,files ,function(err){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            
            flag++;
            if(flag == end )  return res.send({code:201 });
        });
    }


    if(folders) {  //删除共享文件夹
        cloudfile.delshorefolders(user_id,folders ,function(err){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            
            flag++;
            if(flag == end )  return res.send({code:201 });
        });

    }



}




//下载文件
function downloadsharefile(req,res) {
    var shore_file_id = req.body.shore_file_id;
    if(shore_file_id == '' || shore_file_id == undefined)  return res.send({code:204,err:'shore_file_id参数不能为空'});
    

    var table =  config[mgenv].mysql.header + "_shore_file";
    
    //1.先查询文件是否存在
    var sqlstr = " select org_id , dept_id ,dept_folder_id , parent_id, diskname , name ,type from  " + table + " where isvalid = '1' and  shore_file_id = '" + shore_file_id + "'  ";
    mysql.query(sqlstr , function(err,docs){
       if(err)	 return res.send({code:204 , err:err});
       if(docs.length <= 0 ) return res.send({code:204 , err:"未查询到此文件"});

       var filedoc = docs[0], org_id = docs[0].org_id ,  dept_id = docs[0].dept_id , dept_folder_id =  docs[0].dept_folder_id ;
       var  parent_id = docs[0].parent_id ,  diskname = docs[0].diskname , name = docs[0].name;
       var filetype = docs[0].type;
        
       var targetpath = config[mgenv].orgcloudfolder + "/" + org_id + "/" + dept_id ;
       if(dept_folder_id != parent_id)  targetpath = targetpath +  "/" + config[mgenv].deptfolderfile;      //子文件下文件

       //开始下载前，检测文件是否存在于硬盘
       var filepath = targetpath + "/" + diskname;
       console.log("文件下载地址",filepath);
       fs.exists(filepath,function(flag){
            var newfilename = name + "." + filetype;
            if(flag == false ) return res.send({code:204 , err:"文件不存在"});
            else  return res.download(filepath, newfilename);
       }); //fs.exists end
       
    }); //mysql.query end

}




//下载文件
function downloadsharefile_GET(req,res) {
    var shore_file_id = req.query.shore_file_id;
    if(shore_file_id == '' || shore_file_id == undefined)  return res.send({code:204,err:'shore_file_id参数不能为空'});
    

    var table =  config[mgenv].mysql.header + "_shore_file";
    
    //1.先查询文件是否存在
    var sqlstr = " select org_id , dept_id ,dept_folder_id , parent_id, diskname , name ,type from  " + table + " where isvalid = '1' and  shore_file_id = '" + shore_file_id + "'  ";
    mysql.query(sqlstr , function(err,docs){
       if(err)	 return res.send({code:204 , err:err});
       if(docs.length <= 0 ) return res.send({code:204 , err:"未查询到此文件"});

       var filedoc = docs[0], org_id = docs[0].org_id ,  dept_id = docs[0].dept_id , dept_folder_id =  docs[0].dept_folder_id ;
       var  parent_id = docs[0].parent_id ,  diskname = docs[0].diskname , name = docs[0].name;
       var filetype = docs[0].type;
        
       var targetpath = config[mgenv].orgcloudfolder + "/" + org_id + "/" + dept_id ;
       if(dept_folder_id != parent_id)  targetpath = targetpath +  "/" + config[mgenv].deptfolderfile;      //子文件下文件

       //开始下载前，检测文件是否存在于硬盘
       var filepath = targetpath + "/" + diskname;
       console.log("文件下载地址",filepath);
       fs.exists(filepath,function(flag){
            var newfilename = name + "." + filetype;
            if(flag == false ) return res.send({code:204 , err:"文件不存在"});
            else  return res.download(filepath, newfilename);
       }); //fs.exists end
       
    }); //mysql.query end

}


















module.exports = router;





