var Mysql = require("../DB/mysql");
var templater = require("./templater");
//var async = require("async");
var config = require("../../config/config.json");
var fs = require('fs');
var EventProxy = require('eventproxy');
var path = require('path');
var formidable = require('formidable');
var UUID = require('uuid');
var mgenv = global.mgENV;

function cloudfile(data) {
     this.data = data;
}


//
function mkdirpath(dirpath,callback){
    
    fs.exists(dirpath,function(flag){
        if(flag == false ) { //文件夹不存在
            //1。先判断是否是根目录下文件夹
            var rootpath = path.dirname(dirpath);

            if(rootpath  == '.' ){ //根目录，创建文件夹
                fs.mkdir(dirpath,function(err){
                     return callback(err);
                });
            } else { //如果不为根目录，则先创建好父级目录在，创建本目录
                
                mkdirpath( rootpath,function(err){
                    if(err) return callback(err);
                    fs.mkdir(dirpath,function(err){
                        return callback(err);
                    });  // fs.mkdir   end   
                }); // mkdirpath end
                
            } //if end
        } else return callback(null);  //if end

    });  //fs.exists end

}


//在初始化垃圾文件夹
cloudfile.initjunkfolder = function(callback) {
    var dirpath =  config[mgenv].junkfolder ;
    mkdirpath(dirpath,function(err){
            if(err)	 return callback(err);  
            return   callback(err); 
    });
}

//在初始化用户的硬盘文件夹
cloudfile.initdiskfolder = function(account,diskname,callback) {
    var creater = '' , uuid =  UUID.v1();
    var diskname = account + "_" + uuid;
    var dirpath =  config[mgenv].cloudfolder + "/" + diskname  + "/" + config[mgenv].childfolder ;
    mkdirpath(dirpath,function(err){
            if(err)	 return callback(err);  
            return   callback(err,{diskname:diskname}); 
    });
}

//在初始化用户的硬盘文件夹
function fun_initdiskfolder(diskname,callback) {

    var dirpath =  config[mgenv].cloudfolder + "/" + diskname  + "/" + config[mgenv].childfolder ;
    mkdirpath(dirpath,function(err){
            if(err)	 return callback(err);  
            return  callback(err,{diskname:diskname}); 
    });
}


//初始化组织的硬盘文件夹
function fun_initorgdiskfolder(diskname, callback ){
    var dirpath =  config[mgenv].orgcloudfolder + "/" + diskname  ;
    //console.log(dirpath);
    mkdirpath(dirpath,function(err){
            if(err)	 return callback(err);  
            return  callback(err,{diskname:diskname}); 
    });

}

//初始化机构的硬盘文件夹
function fun_initdeptdiskfolder(org_id,diskname, callback ){
    var dirpath =  config[mgenv].orgcloudfolder + "/" + org_id +  "/" + diskname + '/' + config[mgenv].deptfolderfile  ;
    console.log(dirpath);
    mkdirpath(dirpath,function(err){
            if(err)	 return callback(err);  
            return  callback(err,{diskname:diskname}); 
    });
}










//在初始化用户的文件夹DB
cloudfile.initfolderdata = function(account,user_id,callback) {
    //1.先查找数据库中是否存在用户文件夹： 不存在，先初始化硬盘，后生成DB数据； 存在:初始化硬盘；
    var table =  config[mgenv].mysql.header + "_user_folder";
    var sqlstr = "select user_folder_id, diskname from  " + table + " where isvalid='1' and user_id = '" + user_id + "' ";
    Mysql.query(sqlstr,function(err,userfolderdocs){
        if(userfolderdocs.length > 1) return callback("此账户的云文件有多份,云数据错误;");  
        if(userfolderdocs.length == 1){ //数据存在
            var userfolderdoc = userfolderdocs[0] , user_folder_id = userfolderdocs[0].user_folder_id , diskname = userfolderdocs[0].diskname;
        }

        if(userfolderdocs.length <= 0){ //数据不存在
            var creater = '' , uuid =  UUID.v1();
            var user_folder_id = UUID.v1()  , diskname = account + "_" + uuid;
        }

        //初始化用户的硬盘文件夹
        fun_initdiskfolder(diskname, function(err,doc){
            if(err)	 return callback(err);  
            if(userfolderdocs.length == 1) return callback(err, {user_folder_id:user_folder_id ,  diskname:diskname }  );
            else if(userfolderdocs.length == 0){  //创建用户文件夹数据库
                var data = {user_folder_id:user_folder_id , user_id:user_id , diskname:diskname, creater:user_id , create_time:new Date()   };
                templater.add( table , data, function(err,doc){
                    if(err)	 return callback(err);  
                     return callback(err, {user_folder_id:user_folder_id ,  diskname:diskname }  );
               });  // templater.add end

            } //if end
        }); //fun_initdiskfolder end

    }); //Mysql.query end

}


//在初始化组织的文件夹DB
cloudfile.initorgfolderdata = function(org_id,callback) {
    //1.先查找数据库中是否存在用户文件夹： 不存在，先初始化硬盘，后生成DB数据； 存在:初始化硬盘；
    var table =  config[mgenv].mysql.header + "_org_folder";
    var sqlstr = "select org_folder_id, diskname from  " + table + " where isvalid='1' and org_id = '" + org_id + "' ";
    Mysql.query(sqlstr,function(err,orgfolderdocs){
        if(orgfolderdocs.length > 1) return callback("此账户的云文件有多份,云数据错误;");  
        if(orgfolderdocs.length == 1){ //数据存在
            var orgfolderdoc = orgfolderdocs[0] , org_folder_id = orgfolderdocs[0].org_folder_id , diskname = userfolderdocs[0].diskname;
        }
        var creater = '';
        if(orgfolderdocs.length <= 0){ //数据不存在
            var uuid =  UUID.v1();
            var org_folder_id = UUID.v1()  , diskname = org_id;
        }

        //初始化组织的硬盘文件夹
        fun_initorgdiskfolder(diskname, function(err,doc){
            if(err)	 return callback(err);  
            if(orgfolderdocs.length == 1) return callback(err, {org_folder_id:org_folder_id ,  diskname:diskname }  );
            else if(orgfolderdocs.length == 0){  //创建用户文件夹数据库
                var data = {org_folder_id:org_folder_id , org_id:org_id , diskname:diskname,  create_time:new Date()   };
                templater.add( table , data, function(err,doc){
                    if(err)	 return callback(err);  
                     return callback(err, {org_folder_id:org_folder_id ,  diskname:diskname }  );
               });  // templater.add end

            } //if end
        }); //fun_initorgdiskfolder end

    }); //Mysql.query end

}




//在初始化机构的文件夹DB
cloudfile.initdeptfolderdata = function(org_id,dept_id ,callback) {
    //1.先查找数据库中是否存在用户文件夹： 不存在，先初始化硬盘，后生成DB数据； 存在:初始化硬盘；
    var table_1 =  config[mgenv].mysql.header + "_org_folder";
    var table_2 =  config[mgenv].mysql.header + "_dept_folder";

    var sqlstr = "select b.dept_folder_id, b.diskname,a.org_folder_id from  " + table_1 + " as a , " + table_2 + " as b where a.org_id=b.org_id and a.isvalid='1' and  b.isvalid='1' and b.dept_id = '" + dept_id + "' ";
    Mysql.query(sqlstr,function(err,deptfolderdocs){
        if(err)	 return callback(err);  
        if(deptfolderdocs.length > 1) return callback("此账户的云文件有多份,云数据错误;");  
        if(deptfolderdocs.length == 1){ //数据存在
            var deptfolderdoc = deptfolderdocs[0] , org_folder_id = deptfolderdocs[0].org_folder_id ,   dept_folder_id = deptfolderdocs[0].dept_folder_id , diskname = deptfolderdocs[0].diskname;
        }

        if(deptfolderdocs.length <= 0){ //数据不存在
            
            var dept_folder_id = UUID.v1()  , diskname = dept_id;
        }

        //初始化组织的硬盘文件夹
        fun_initdeptdiskfolder(org_id,diskname, function(err,doc){
            if(err)	 return callback(err);  
            if(deptfolderdocs.length == 1) return callback(err, {dept_folder_id:dept_folder_id ,  diskname:diskname }  );
            else if(deptfolderdocs.length == 0){  //创建用户文件夹数据库

                var sqlstr = "select org_folder_id, diskname from  " + table_1 + " where isvalid='1' and org_id = '" + org_id + "' ";
                Mysql.query(sqlstr,function(err,orgfolderdocs){
                    if(err)	 return callback(err); 
                    if(orgfolderdocs.length > 1) return callback("组织的云文件有多份,云数据错误;");
                    if(orgfolderdocs.length <= 0) return callback("组织的云文件有未查询到;");

                    var org_folder_id = orgfolderdocs[0].org_folder_id

                    var data = {dept_folder_id:dept_folder_id,org_folder_id:org_folder_id , org_id:org_id , diskname:diskname, dept_id:dept_id, create_time:new Date()   };
                    //console.log(data);
                    templater.add( table_2 , data, function(err,doc){
                        if(err)	 return callback(err);  
                        return callback(err, data  );
                    });  // templater.add end
                
                });



            } //if end
        }); //initdeptfolderdata end

    }); //Mysql.query end

}






//文件上传
cloudfile.uploadfile = function(id,req,callback) {

     var user_id = req.session.userinfo.user_id;
     var user_folder_id = req.session.userfolderinfo.user_folder_id;
     
     //生成
    var targetpath =  config[mgenv].cloudfolder + "/" + req.session.userfolderinfo.diskname;
     var isroot = 1;
     if(id != user_folder_id)  {isroot = 0;    var targetpath =  targetpath +  "/" + config[mgenv].childfolder;  }

     var form =new formidable.IncomingForm();
        form.keepExtensions =true;    //keep .jpg/.png
        form.uploadDir = targetpath;   //upload path});
        form.encoding = 'utf-8';   
        form.maxFieldsSize = 2048 * 1024 * 1024;   //文件大小

      form.parse(req,function(err, fields, files){
             if(err) return callback(err);
             console.log("files:",files);
             var name = files.myfile.name;
             var filetype = name.substr( name.lastIndexOf(".") + 1 );
             var size  = files.myfile.size;

             var oldFilepath =  files.myfile.path;

  
             fun_makeUserFileUniqueName(id,name,function(err,newName){
                 if(err) return callback(err);
                 var diskname = newName + "_" + UUID.v1();
                 var newFilepath = targetpath + "/" + diskname + "." + filetype;
                 //console.log('Filepath',newFilepath,oldFilepath);
                fs.renameSync(oldFilepath, newFilepath);
                var data = {diskname:diskname, newName:newName, filetype:filetype  , size:size  };
                return callback(err,data);

             });  //fun_makeUserFileUniqueName end
               

      });//bind event handler

}


//获取机构的文件夹信息
cloudfile.getdept_folder_info = function(id,callback) {
    var table =  config[mgenv].mysql.header + "_dept_folder";
    var sqlstr = "select * from " + table + " where isvalid ='1' and (dept_folder_id = '" + id + "' or dept_id='" + id + "' ) ";
    console.log('SQL:',sqlstr);
   
    Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);
        

        if(docs.length > 1)  return callback("机构文件夹数据存在多个");  
        if(docs.length <=0 )  return callback(err,null); 
        
        return callback(err,docs[0]);
    });
}

//获取组织的文件夹信息
cloudfile.getorg_folder_info = function(id,callback) {
    console.log(6666);
    var table =  config[mgenv].mysql.header + "_org_folder";
    var sqlstr = "select * from " + table + " where isvalid ='1' and (org_folder_id = '" + id + "' or org_id='" + id + "' ) ";
    Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);
        if(docs.length <= 0)  return callback("组织文件夹数据未查询到");
        if(docs.length > 1)  return callback("组织文件夹数据存在多个");  

        return callback(err,docs[0]);
    });
}

//获取用户子文件夹的信息
function getchildfolderANDuserfolder(child_folder_id,callback) {
    var table_1 =  config[mgenv].mysql.header + "_child_folder";
    var table_2 =  config[mgenv].mysql.header + "_user_folder";

    var sqlstr = " select a.name as `childfoldername` , b.diskname as `userdiskfoldername`  from  " + table_1 + " as a , " + table_2+ " as b  where a.user_folder_id = b.user_folder_id and a.child_folder_id = '" + child_folder_id + "' ";
    console.log("子文件夹信息SQL:" , sqlstr)
    Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);
        if(docs.length <= 0)  return callback("组织文件夹数据未查询到");
        if(docs.length > 1)  return callback("组织文件夹数据存在多个");  

        return callback(err,docs[0]);
    });

}

//开始生成destFolderName, 例：如果存在同名文件夹，在后面加“(1)” ,如果(1)存在，生成(2)....,最多100；
function  getUniqueName(dept_folder_id,sourceFolderName, callback){
    var table =  config[mgenv].mysql.header + "_shore_folder";
    var sqlstr = " select name from  " + table + " where isvalid ='1' and parent_id='" + dept_folder_id + "' and (name = '" + sourceFolderName + "' or name like '" + sourceFolderName + "(%)' )   ";
    console.log('查找重名共享文件夹数量SQL：',sqlstr);
    Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);
        if(docs.length <=0 ) return callback(err, sourceFolderName);
        console.log(docs);
        var max = 1;
        for(var i=0; i< docs.length; i++){
            var doc =  docs[i] , newname = doc.name ;
            if(newname != sourceFolderName ) {
                newname = newname.substr(0, newname.length - 1 );
                var n = newname.substr( newname.lastIndexOf("(") + 1 );
                if(parseInt(n) >= max ) max = n;
            }
        }
        max++;
        var newname = sourceFolderName + "(" + max + ")";
        return callback(err, newname);
    }); // Mysql.query end 

}


function fun_makeUserFileUniqueName(id,name, callback){
    var pos = name.lastIndexOf(".");
    var filetype = name.substr(pos);
    var nametmp = name.substr(0,pos);

    var table =  config[mgenv].mysql.header + "_file";
    var sqlstr = " select name from  " + table + " where isvalid ='1' and folder_id='" + id + "' and ( name = '" + nametmp + "' or name like '" + nametmp + "(%)')  ";
    //console.log(sqlstr);
    Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);
        if(docs.length <=0 ) return callback(err, nametmp);

        var max = 1;
        for(var i=0; i< docs.length; i++){
            var doc =  docs[i] , newname = doc.name  ;
             if(newname != nametmp ) {
                newname = newname.substr(0, newname.length - 1 );

                var  n = newname.substr( newname.lastIndexOf("(") + 1 );

                if(parseInt(n) >= max ) max = n;
             } //if end
        } // for end
        max++;
        var newname = nametmp + "(" + max + ")";
        return callback(err, newname);
    }); // Mysql.query end 

}




//生成数据库文件名：例：name不存在，不变； 存在：name(1), name(2),name(3)
cloudfile.makeUserFileUniqueName = function (id,name, callback){
    var pos = name.lastIndexOf(".");
    var filetype = name.substr(pos);
    var nametmp = name.substr(0,pos);


    var table =  config[mgenv].mysql.header + "_file";
    var sqlstr = " select name from  " + table + " where isvalid ='1' and folder_id='" + id + "' and ( name = '" + nametmp + "' or name like '" + nametmp + "(%)')  ";
    console.log(sqlstr);
    Mysql.query(sqlstr , function(err,docs){
        if(err)  { console.log(err); callback(err); }
        if(docs.length <=0 ) return callback(err, nametmp);

        var max = 1;
        for(var i=0; i< docs.length; i++){
            var doc =  docs[i] , newname = doc.name  ;
             if(newname != nametmp ) {
                newname = newname.substr(0, newname.length - 1 );

                n = newname.substr( newname.lastIndexOf("(") + 1 );

                if(parseInt(n) > max ) max = n;
             } //if end
        } // for end
        max++;
        var newname = nametmp + "(" + max + ")";
        return callback(err, newname);
    }); // Mysql.query end 

}



//生成共享文件的新文件名：例：name不存在，不变； 存在：name(1), name(2),name(3)
cloudfile.makeshoreFileUniqueName = function (parent_id,name, callback){

    var nametmp = name;

    var table =  config[mgenv].mysql.header + "_shore_file";
    var sqlstr = " select name from  " + table + " where isvalid ='1' and parent_id='" + parent_id + "' and ( name = '" + nametmp + "' or name like '" + nametmp + "(%)')  ";
    console.log("新共享文件名：",nametmp,sqlstr);
    Mysql.query(sqlstr , function(err,docs){
        if(err)  { console.log(err); callback(err); }
        if(docs.length <=0 ) return callback(err, nametmp);

        var max = 1;
        for(var i=0; i< docs.length; i++){
            var doc =  docs[i] , newname = doc.name  ;
             if(newname != nametmp ) {
                newname = newname.substr(0, newname.length - 1 );

                var n = newname.substr( newname.lastIndexOf("(") + 1 );

                if(parseInt(n) > max ) max = n;
             } //if end
        } // for end
        max++;
        var newname = nametmp + "(" + max + ")";
        return callback(err, newname);
    }); // Mysql.query end 

}





//共享文件夹到机构，并指定角色开放权限
cloudfile.shorefoldertodept = function(parent_id, user_id , child_folder_id,dept_id, role_id, callback) {
    var cfile = require('./file.js');
    console.log('进入共享函数：');
    //1.获取源文件信息
    getchildfolderANDuserfolder(child_folder_id,function(err,childfolderinfo){
        if(err)   { console.log(err); callback(err); }
        console.log("获取源文件信息：", childfolderinfo);
        var sourceFolderName = childfolderinfo.childfoldername;
        var sourceFolderPath =   config[mgenv].cloudfolder + "/" + childfolderinfo.userdiskfoldername + "/" +  config[mgenv].childfolder ;
        console.log("开始初始化用户文件夹..", childfolderinfo);
        mkdirpath(sourceFolderPath,function(err){  //初始化用户文件夹
                if(err) { console.log(err); callback(err); } 
                console.log("初始化源用户文件夹成功!");
                //2.获取目标机构的文件夹信息
                console.log("开始获取机构机构的文件夹信息..");
                cfile.getdept_folder_info(dept_id,function(err,deptfolderinfo ){
                    if(err) { console.log(err); callback(err); }
                    console.log("机构的文件夹信息获取成功：", deptfolderinfo);
                    var dept_folder_id = deptfolderinfo.dept_folder_id, org_folder_id = deptfolderinfo.org_folder_id;
                    var org_id = deptfolderinfo.org_id;
                    var deptdiskname = deptfolderinfo.diskname;
                    var destpath = config[mgenv].orgcloudfolder + "/" + org_id  + "/"+ deptdiskname+ "/" + config[mgenv].deptfolderfile;
                    
                    console.log("开始初始化机构的文件夹：", destpath);
                    mkdirpath(destpath,function(err){  //初始化机构的文件夹
                            if(err) { console.log(err); callback(err); }
                            //var info={sourceFolderName};
                            //查看机构的文件夹名是否存在，如果存在生成新的文件夹名
                            console.log("机构的文件夹初始化成功！");
                            console.log("检测机构的文件夹是否存在？",sourceFolderName);
                            
                            //检测机构的共享文件夹下是否存在此文件夹
                            isDeptShoreFolderExist(sourceFolderName,dept_folder_id,function(err,flag){ //flag:false不存在 ,true存在
                                 if(err) { console.log(err); callback(err); }
                                 //var  parent_id = dept_folder_id;
                                 if(!flag) { //如果共享文件夹不存在
                                       console.log('要共享的文件夹，不存在; 可以开始复制');
                                       //开始复制文件夹 , sourceFolderName:硬盘存在； destFolderName:硬盘不存在
                                        var destFolderName = sourceFolderName ;
                                                            
                                        fun_shorefoldertodept(user_id ,sourceFolderName, destFolderName, sourceFolderPath,destpath,dept_folder_id , child_folder_id,org_id, dept_id,parent_id,role_id, function(err,doc){
                                            if(err) console.log(err);
                                            return callback(err,doc);

                                        });   // fun_shorefoldertodept  end   
                                 }
                                 
                                 if(flag) { //开始生成destFolderName, 例：如果存在同名文件夹，在后面加“(1)” ,如果(1)存在，生成(2)....,最多100；
                                     console.log('要共享的文件夹，存在; 先生成一个文件夹名，再可以开始复制');
                                    getUniqueName(dept_folder_id,sourceFolderName,function(err,newname){
                                        if(err)	 return callback(err);
                                        console.log('新共享文件夹名：',newname );   
                                       //开始复制文件夹 , sourceFolderName:硬盘存在； destFolderName:硬盘不存在
                                        var destFolderName = newname ;
                                        
                                        fun_shorefoldertodept(user_id ,sourceFolderName, destFolderName, sourceFolderPath,destpath,dept_folder_id , child_folder_id,org_id, dept_id,parent_id,role_id, function(err,doc){
                                             if(err) {   console.log(err);  return callback(err); }
                                             else return callback(err,doc);

                                        });   // fun_shorefoldertodept  end                             
                                    }); // getUniqueName  end
                                } //if(flag)  end

                            }); // isDeptShoreFolderExist end
                            


                    });//mkdirpath end

                });//cfile.getdept_folder_info end
                
        }); ////mkdirpath end

    }); //getchildfolderANDuserfolder end


}


 //检测机构的共享文件夹下是否存在此文件夹
function isDeptShoreFolderExist(sourceFolderName,dept_folder_id,callback) {
    var table = config[mgenv].mysql.header + "_shore_folder"; 
    var sqlstr = " select * from " + table + " where isvalid = '1' and name = '" + sourceFolderName +"' and parent_id = '" + dept_folder_id +"'   ";
    Mysql.query(sqlstr , function(err,docs){
        if(err) { console.log(err);return callback(err); }
        if(docs.length <= 0) return callback(err,false);
        else return callback(err,true);

    }); //Mysql.query end 
}



//获取用户子文件中的files
function fun_getchildfolderfiles(child_folder_id,callback){
    var table = config[mgenv].mysql.header + "_file"; 
    var sqlstr = " select * from " + table + " where isvalid = '1' and folder_id = '" + child_folder_id +"'   ";
    Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);

        return callback(err,docs);
    }); //Mysql.query end 
}

//复制文件，先查看文件是否存在
function copyfile(sourcepath,destpath, callback){
    //验证文件是否存在
    fs.exists(sourcepath,function(flag){
            if(flag == false )   return callback('源文件不存在:'+ sourcepath);
            var source = fs.createReadStream(sourcepath);
            var dest = fs.createWriteStream(destpath );
            source.pipe(dest);
            source.on('end', function() { 
                return callback(null);
            });

            source.on('error', function(err) { /* error */ 
                return callback(err);
            });
     }); // fs.exists
}


//外部调用：复制文件，先查看文件是否存在
cloudfile.copyfile = function (sourcepath,destpath, callback){
    //验证文件是否存在
    fs.exists(sourcepath,function(flag){
            if(flag == false )   return callback('源文件不存在');
            var source = fs.createReadStream(sourcepath);
            var dest = fs.createWriteStream(destpath );
            source.pipe(dest);
            source.on('end', function() { 
                return callback(null);
            });

            source.on('error', function(err) { /* error */ 
                return callback(err);
            });

    }); //fs.exists

}









 function getChildFolder(child_folder_id, callback){
     var table = config[mgenv].mysql.header + "_child_folder";
     var sqlstr = " select * from "  + table + " where isvalid ='1' and parent_id = '" + child_folder_id + "' ";
     Mysql.query(sqlstr , function(err,docs){
        if(err) console.log(err);
        return callback(err,docs);
     }); //Mysql.query end 

 }



//开始复制文件夹
function fun_shorefoldertodept(user_id ,sourceFolderName,destFolderName,sourceFolderPath,destFolderpath ,dept_folder_id, child_folder_id,org_id, dept_id,parent_id , role_id,callback){
    console.log("进入开始复制文件夹",sourceFolderPath,sourceFolderName, destFolderpath,destFolderName);
    var data = {} ,result = {}
    var returnFlag = 0;

    var ep =new EventProxy();
    //1.数据库中创建新共享的文件夹
    var shore_folder_id = UUID.v1();
    var table = config[mgenv].mysql.header + "_shore_folder";
        data = {
            shore_folder_id:shore_folder_id, org_id:org_id, dept_id:dept_id,
            dept_folder_id:dept_folder_id , parent_id:parent_id , name:destFolderName,
            child_folder_id:child_folder_id,role_id_arry:role_id ,
            user_id:user_id, create_time: new Date(), creater : user_id 
            };

        result = {shore_folder_id:shore_folder_id ,name:destFolderName };


          
        //2.获取源文件的所有文件，复制到机构的共享文件夹中；2.数据库中创建新共享的文件夹destFolderName
        fun_getchildfolderfiles(child_folder_id,function(err,files){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

             console.log('开始复制源文件夹中的所有的文件：',files); 
            var flag = 0 , end = files.length ;

            if(files.length <= 0) {  //数据库中创建此文件夹

                    templater.add( table , data, function(err,doc){
                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

                        console.log('空文件夹数据库创建成功',data);   
                        ep.emit('copychildfolder');
                    });


            } else if(files.length > 0)

                    for(var i=0; i< files.length; i++ ) {
                            var file = files[i], destfile_diskname = file.name + "_" + UUID.v1() + "." + file.type ;
                            var sourcepath = sourceFolderPath + "/" + file.diskname;
                            var destpath = destFolderpath + "/" + destfile_diskname;
                            console.log('单个文件开始复制，路径：', sourcepath,destpath);
                            
                            //var shore_file_id = UUID.v1();
                            var data_tmp = {shore_file_id: UUID.v1() , destfile_diskname:destfile_diskname ,sourcepath:sourcepath , destpath:destpath };
                            
                            (function(file, data_tmp){

                                    copyfile(sourcepath,destpath, function(err){
                                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                                    
                                    
                                        //3.数据库中创建复制的文件
                                        var table_2 = config[mgenv].mysql.header + "_shore_file";  
                                        
                                        var data_2 = {
                                                 shore_file_id:data_tmp.shore_file_id,org_id:org_id, dept_id:dept_id,
                                                 dept_folder_id:dept_folder_id,parent_id: shore_folder_id,
                                                 user_id:user_id, size:file.size
                                                 };
                                        data_2.name = file.name, data_2.file_id = file.file_id ;
                                        data_2.diskname = data_tmp.destfile_diskname , data_2.type = file.type;
                                        data_2.role_id_arry = role_id;
                                        data_2.create_time = new Date(),  data_2.creater = user_id ;
                                        console.log('复制单个文件：',data_2); 
                                        templater.add( table_2 , data_2, function(err,doc){
                                            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                                            console.log('单个文件添加进入数据库：',data_2);
                                        
                                            flag++;  
                                            if(flag == end)
                                                templater.add( table , data, function(err,doc){
                                                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                                                    console.log('数据库中创建新共享的文件夹成功',data);   
                                                    ep.emit('copychildfolder');
                                                });
                                        });  //templater.add end 

                                    }); //copyfile end

                            })(file, data_tmp);

                    } // for end

        }); //fun_getchildfolderfiles end


   //3.判断源文件sourceFolderName下是否还有子文件夹：没有，返回成功； 递归复制子文件夹；
   ep.all('copychildfolder',function(){
       console.log('开始复制子文件夹');
        getChildFolder(child_folder_id, function(err,childs){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

            console.log('子文件夹：', childs);
            if(childs.length <= 0 ) { returnFlag=1; return callback(err, result); }
            
            if(childs.length > 0 ) {
                 console.log('存在子文件夹：' );
                var Mval = 0 , Mend = childs.length;
                for(var i=0; i< childs.length; i++ ) {
                    //递归复制子文件夹
                    var childdoc = childs[i];
                    var sourceFolderName_2 = childdoc.name , destFolderName_2 = childdoc.name ;
                    var sourceFolderPath_2 = sourceFolderPath ;
                    var destpath_2 = destFolderpath, dept_folder_id_2 =dept_folder_id;
                    var org_id_2 = org_id, dept_id_2 = dept_id;
                    var child_folder_id_2 = childdoc.child_folder_id , parent_id_2 = result.shore_folder_id;
                                        
                    fun_shorefoldertodept(user_id ,sourceFolderName_2,destFolderName_2,sourceFolderPath_2,destpath_2 ,dept_folder_id, child_folder_id_2,org_id_2, dept_id_2,parent_id_2 ,role_id , function(err,doc){
                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

                        Mval++;
                        if(Mval == Mend ) {returnFlag=1; return callback(err, result); }
                    });               
                }


            }

        });

   }); //ep.all('copychildfolder') end 

}



//删除文件
function cleanfile(filepath,junkpath, callback){
       fs.exists(filepath,function(flag){
            if(flag == false ) return callback("文件不存在");
            else { fs.renameSync(filepath, junkpath); return callback(null);  }

       }); //fs.exists end

       
}



function fun_delfolder(user_id,child_folder_id,userfolderdiskname,callback){

    var table =  config[mgenv].mysql.header + "_child_folder";
    var table_2 =  config[mgenv].mysql.header + "_file";
    var returnFlag = 0;

    var ep =new EventProxy();


    //3.删除自身文件夹
    ep.all('delmyself',function(){

        //注销本身文件夹
        var wherejson = {child_folder_id :child_folder_id , user_id:user_id  };
        var data = {isvalid: '0'};
        templater.update(table, wherejson ,  data,  function(err,doc){
              callback(err);
        }); //templater.update end  

    });


    //2.删除子文件夹
    ep.all('delchildfolder',function(){
        var sqlstr_2 = "select child_folder_id  from " + table + " where isvalid = '1' and parent_id = '" + child_folder_id + "' ";
        Mysql.query(sqlstr_2 , function(err,childdocs){
            if(err)	 return callback(err);
            if(childdocs.length <=0 ) ep.emit('delmyself');
            else if(childdocs.length > 0 ) {

                var flag_2 = 0, end_2 = childdocs.length ;
                for(var j=0;j< childdocs.length ; j++) {
                    var child_folder_id_tmp = childdocs[j].child_folder_id;
                    fun_delfolder(user_id,child_folder_id_tmp,userfolderdiskname,function(err){
                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

                        flag_2++;
                        if(flag_2 == end_2) ep.emit('delmyself');
                    });
                } //for
            } //if end
        }); //mysql.query end

    }); //ep.all('delchildfolder'






    //1.删除所有的子文件
    
    var sqlstr = "select file_id, diskname from " + table_2 + " where isvalid = '1' and folder_id = '" + child_folder_id + "'    ";
  console.log('1.删除所有的子文件',sqlstr);
   Mysql.query(sqlstr , function(err,docs){
        if(err)	 return callback(err);
        console.log(docs);
        if(docs.length <=0 ) ep.emit('delchildfolder');
        else if(docs.length >0 ){ //删除
            
            var Mflag = 0 ;
            for(var i=0; i< docs.length; i++) {
                    var doc = docs[i];
                    console.log(doc);
                    var filepath = config[mgenv].cloudfolder + "/" + userfolderdiskname +  "/" + config[mgenv].childfolder + "/" + doc.diskname; 
                    var junkpath = config[mgenv].junkfolder + "/" +  doc.diskname ;

                    console.log(filepath);console.log(junkpath);

                    (function(i,filepath,junkpath,doc ){
                            fs.exists(filepath,function(flag){
                                if(!flag) {
                                     Mflag++; console.log('A Flag:',Mflag,docs.length );
                                     if(Mflag == docs.length ) { //子文件删除完成
                                                console.log('A 注销数据库所有文件:');
                                                
                                                var wherejson_2 = {folder_id :child_folder_id ,isvalid:'1' };
                                                var data = {isvalid: '0'};
                                                templater.update(table_2, wherejson_2 ,  data,  function(err,doc){
                                                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                                                    else ep.emit('delchildfolder');
                                                }); //templater.update end  
                                          
                                        }
                                }  
                                
                                if(flag)   { //垃圾文件清理
                                    cleanfile(filepath,junkpath,function(err){
                                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                                        Mflag++;  console.log('B Flag:',Mflag);

                                        if(Mflag == docs.length ) { //子文件删除完成
                                               console.log('B 注销数据库所有文件:');
                                                
                                                var wherejson_2 = {folder_id :child_folder_id ,isvalid:'1' };
                                                var data = {isvalid: '0'};
                                                templater.update(table_2, wherejson_2 ,  data,  function(err,doc){
                                                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
                                                    else ep.emit('delchildfolder');
                                                }); //templater.update end  
                                          
                                        }
                                        
                                    }); //cleanfile end
                                }//if end
                            }); //fs.exists end

                    })(i,filepath,junkpath,doc );
            } //for end

        } //if end

    }); //mysql.query end



}




cloudfile.delfolder = function (user_id,child_folder_id,userfolderdiskname, callback){

  fun_delfolder(user_id,child_folder_id,userfolderdiskname,function(err){
      return callback(err);
  });

}


//删除共享文件
cloudfile.delshorefiles = function(user_id,files, callback ) {
    console.log('删除共享文件');
    if(files.length <= 0) return callback("未查询到要删除的文件");
    //var table =  config[mgenv].mysql.header + "_child_folder";
    var table =  config[mgenv].mysql.header + "_shore_file";
    var wherestr = " ( ";
    for(var i=0; i< files.length; i++ ) {
       if(i <= 0) wherestr = wherestr +  " '" + files[i] + "' " ;
       else  wherestr = wherestr +  ", '" + files[i] + "' " ;
      } //for end
    wherestr =wherestr + " ) ";

    //先注销共享文件的数据库
    var sqlstr = "update `" + table + "` set  isvalid= '0' where user_id = '" + user_id + "'    "+
     " and `shore_file_id` in " + wherestr ;

     console.log('批量注销共享文件数据库：', sqlstr);
    Mysql.query(sqlstr , function(err,doc){
         if(err) return callback(err);
         //开始转移共享文件到垃圾箱
         mkdirpath(config[mgenv].share_junkfolder,function(err){  //初始化垃圾箱
            if(err) { console.log(err); return callback(err); } 
           
            var sqlstr_2 = "select org_id,dept_id ,diskname ,dept_folder_id , parent_id   from  `" + table + "` where  user_id = '" + user_id + "'    "+
            " and `shore_file_id` in " + wherestr ;
            console.log('获取所有注销共享文件数据库：', sqlstr_2);
            Mysql.query(sqlstr_2 , function(err,filedocs){
                 if(err) return callback(err);
                 console.log(filedocs);
                 for(var j=0;j<filedocs.length; j++ ) {
                     var org_id=filedocs[j].org_id ,dept_id=filedocs[j].dept_id ,diskname=filedocs[j].diskname  ;
                     var dept_folder_id=filedocs[j].dept_folder_id , parent_id=filedocs[j].parent_id;
                     
                     var sourcepath = config[mgenv].orgcloudfolder + "/" + org_id + "/" +  dept_id ;
                     if(dept_folder_id != parent_id ) sourcepath = sourcepath  + "/" + config[mgenv].deptfolderfile;

                     sourcepath = sourcepath + "/" + diskname;

                     (function(sourcepath,diskname){
                            fs.exists(sourcepath,function(flag){
                                console.log("清理文件：" , sourcepath , config[mgenv].share_junkfolder + "/" + diskname  );
                                if(flag)   fs.renameSync(sourcepath, config[mgenv].share_junkfolder + "/" + diskname );
                            });
                     })(sourcepath,diskname);

                 } //for end

                return callback(err);
            }); //Mysql.query end

         }); //mkdirpath end

    }); //Mysql.query end

}




//获取所有的共享子文件夹的ID
function fun_getallchildfolders(shore_folder_id, callback){
    var returnFlag = 0;
    var result  = [{shore_folder_id:shore_folder_id}] ;
    
    var table =  config[mgenv].mysql.header + "_shore_folder";
    var sqlstr = " select shore_folder_id from `" + table + "` where  isvalid = '1' and  parent_id = '" + shore_folder_id + "'     ";

    console.log("本SQL：", sqlstr );
    Mysql.query(sqlstr , function(err,docs){
         if(err) return callback(err);
         console.log("本次子文件夹ID：",docs);
         //result = result.concat(docs);
         
         if(docs.length <= 0) return callback(err,result);
         else {
             var flag = 0 , end = docs.length;
             for(var i=0; i<docs.length; i++ ) {
                  fun_getallchildfolders(docs[i].shore_folder_id ,  function(err,childs){
                      if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }

                      result = result.concat(childs);
                      flag++;
                      if(flag == end)  return callback(err,result);
                  });
             } //for end
         } //if end
        
    });

}


//将数组内的json元素变为 单元素
function changeArr(docs , x){
    var result = [];
    for(var i=0 ;i <docs.length; i++ ) result[result.length] = docs[i][x];
    return result;
}




//删除共享文件夹
cloudfile.delshorefolders = function(user_id,folders , callback) {
    if(folders.length <= 0) return callback(null);
    
    var ep =new EventProxy();

    var returnFlag=0;
    var folderall = [] , filesall = [];


    console.log('1:开始获取所有的共享子文件夹的ID:',folders);
    //1.获取所有的共享子文件夹的ID
    var flag = 0 ,  end = folders.length;
    for(var i=0; i<folders.length; i++  ){
        var shore_folder_id = folders[i];
        //folderall[folderall.length] = shore_folder_id;
        
        //获取所有的子文件夹ID
        fun_getallchildfolders(shore_folder_id,function(err,docs){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return callback(err); } else return ; }
            var docsarr = changeArr(docs, 'shore_folder_id');
            folderall = folderall.concat(docsarr);
            
            flag++;
            if(flag == end)  ep.emit('getallfiles');

        });
    } //for

    
    var wherestr_2 = '';

    //2.获取所有的子文件的filesid
    ep.all('getallfiles',function(){
        console.log('2:所有的共享子文件夹的ID:',folderall,folderall.length );
        var table_2 =  config[mgenv].mysql.header + "_shore_file";

        wherestr_2 = " ( ";
        for(var j=0; j< folderall.length; j++ ) {
            
            if(j <= 0) wherestr_2 = wherestr_2 +  " '" + folderall[j] + "' " ;
            else  wherestr_2 = wherestr_2 +  ", '" + folderall[j] + "' " ;
        } //for end
        wherestr_2 = wherestr_2 + " ) ";

        var sqlstr_2 = "select `shore_file_id` from  `" + table_2 + "` where  isvalid= '1' and user_id = '" + user_id + "'   " + 
        " and parent_id  in " + wherestr_2;
        
        console.log('获取所有的子文件的filesid SQL:',sqlstr_2);
       
        Mysql.query(sqlstr_2 , function(err,filesdocs){
                if(err) return callback(err);

                //开始转移共享文件到垃圾箱
                filesall = docsarr = changeArr(filesdocs, 'shore_file_id');

                //3.开始注销所有文件夹和文件
                ep.emit('delall');
        }); //Mysql.query end

    }); // ep.all('getallfiles' end
   


    //3.注销所有的文件夹和文件
    ep.all('delall',function(){
        console.log('3，开始注销所有的文件夹和文件:' ,filesall);
        var table_3 =  config[mgenv].mysql.header + "_shore_folder";
        var wherestr_3 = wherestr_2 ;

        //先注销共享文件夹的数据库
        var sqlstr_3 = "update `" + table_3 + "` set  isvalid= '0' where user_id = '" + user_id + "'    " +
        " and `shore_folder_id` in " + wherestr_3 ;
        console.log(' 注销所有的文件夹 SQL:' , sqlstr_3 );
        Mysql.query(sqlstr_3 , function(err,doc){
            if(err) return callback(err);
            var me = require("./file");
            //开始注销所有子文件
            console.log(' 注销所有的文件: ' , filesall );
            if(filesall.length <=0 ) return callback(err);
            else  me.delshorefiles(user_id,filesall, function(err){
                    return callback(err);
                  }); //me.delshorefiles end

        }); //Mysql.query end

   }); // ep.all('delall' end


}








module.exports = cloudfile;




