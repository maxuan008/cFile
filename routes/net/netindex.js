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
var formidable = require('formidable');
var fs = require('fs');

var app_funs = require("./module/app_funs");
var apps = require("./module/apps");
var org = require("./module/org");
var dept = require("./module/dept");
var role = require("./module/role");
var cloudfile = require("../module/file");


var router = express.Router();

var mgenv = global.mgENV;

router.post('/index/courselist', courselist);   //首页课程列表

router.get('/register/searchorg_register',searchorg_register);   //注册用：查询所有有效组织
router.get('/register/searchdept_register',searchdept_register);   //注册用：查询组织的所有机构
router.get('/register/searchroles_register',searchroles_register);   //注册用：查询组织的角色 
router.post('/register/apply',register);   //注册申请 


router.post('/login',login);   //登陆
router.get('/logout',logout);   //登出
router.get('/initializeinfo',initializeinfo);  //获取初始化数据

router.get('/org/searchorg',searchorg);   //查询组织
router.post('/org/addorg',addorg);   //添加组织
router.post('/org/delorg',delorg);   //删除组织
router.post('/org/updateorg',updateorg);   //更新组织信息


router.get('/org/initorgapp',initorgapp);   //初始化授权的组织信息
router.get('/org/getorgapp',getorgapp);   //获取授权的组织的功能信息
router.post('/org/updateorgapp',updateorgapp);   //更新授权的组织的功能信息



router.get('/org/searchdept',searchdept);   //查询组织的所有机构 
router.post('/org/adddept',adddept);   //添加一个机构：组织下的机构名不能重复
router.post('/org/deldept',deldept);   //添加一个机构：组织下的机构名不能重复
router.post('/org/updatedept',updatedept);   //添加一个机构：组织下的机构名不能重复


router.get('/org/searchdeptuser',searchdeptuser);   //查询机构的用户
router.post('/org/adddeptuser',adddeptuser);   //添加机构的用户：用户不能重复； 默认用户有效
router.post('/org/deldeptuser',deldeptuser);   //删除机构下的一个用户
router.post('/org/updatedeptuser',updatedeptuser);   //更新机构用户的信息，如更改用户角色，审核用户：deptuser_id,必选


router.get('/role/initroleapp',initroleapp);   //初始化组织的角色功能信息 
router.get('/role/getroleapp',getroleapp);   //获取角色的功能
router.post('/role/updateroleapp',updateroleapp);   //更新角色的功能


router.get('/app/searchapp', searchapp);   //查询菜单功能
router.post('/app/addapp', addapp);   //添加菜单功能
router.post('/app/delapp', delapp);   //删除菜单功能
router.post('/app/updateapp', updateapp);   //更新菜单功能

router.get('/app/searchappfuns', searchappfuns);   //查询子功能
router.post('/app/addappfun', addappfun);   //添加子功能
router.post('/app/delappfun', delappfun);   //删除子功能
router.post('/app/updateappfun', updateappfun);   //更新子功能



router.get('/role/searchroles', searchroles);   //查询角色
router.post('/role/addrole', addrole);   //添加角色
router.post('/role/delrole', delrole);   //删除角色
router.post('/role/updaterole', updaterole);   //更新角色


router.post('/user/setdefaultrole', setdefaultrole);  //设置用户的默认机构角色
router.post('/user/changerole', changerole);  //切换机构角色
router.post('/user/applydeptuser', applydeptuser);  //申请加入到机构角色
router.post('/user/uploadheadpng', uploadheadpng);  //上传头像
router.get('/user/downloadpng', downloadpng);  //下载文件


router.post('/org/addusertodepuser', addusertodepuser);  //orgadmin组织管理员专用接口,添加用户到制定的机构，并制定角色
router.get('/org/searchundeptusers', searchundeptusers);  //搜索不在本机构下的有效用户，用户范围限于，并指定角色

router.post('/user/updateuserinfo', updateuserinfo);  //修改用户的全名，邮箱，密码 

router.get('/org/getdepttree', getdepttree);  //：获取当前登录所在机构树



//首页课程列表
function courselist(req, res) {

    var org_id = req.session.orginfo.org_id;
    if (org_id == '' || org_id == undefined) return res.send({ code: 204, err: 'org_id数据不正确' });

    var table = config[mgenv].mysql.header + "_dept";
    var sqlstr = " select dept_id, name from " + table + " where isvalid = '1' and  father_id = '" + org_id + "' order by dept_id ";
    //sqlstr = sqlstr + "  limit 0," + num;

    mysql.query(sqlstr, function (err, docs) {
        if (err) return res.send({ code: 204, err: err });
        if (docs.length <= 0) return res.send({ code: 201, datas: docs });
        console.log('99:',docs);

        var flag = 0, returnFlag=0;
        for (var i = 0; i < docs.length; i++) {
            (function (i) {
                fun_getDeptChildsCourseList(docs[i].dept_id, function (err, childsDoc) {
                    if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return res.send({ code: 204, err: err }); } else return; }
                    flag++;
                    docs[i].childs = childsDoc;
                    if (flag == docs.length) { return res.send({ code: 201, datas: docs }); returnFlag = 1; }
                });

            })(i);
        }

    }); //mysql.query end

}


//获取第一级机构下的子机构及其课程
function fun_getDeptChildsCourseList(dept_id, callback) {
    var table = config[mgenv].mysql.header + "_dept";
    var sqlstr = "select dept_id , name  from `" + table + "`  where  isvalid = '1' and father_id = '" + dept_id + "'   ";
    mysql.query(sqlstr, function (err, docs) {
        if (err) { console.log(err); return callback(err); }
        if (docs.length <= 0) return callback(err, []);
        //console.log('0000:', docs);
        var flag = 0, returnFlag = 0;
        for (var i = 0; i < docs.length; i++) {
            (function (i) {
                fun_getDeptCourseList(docs[i].dept_id, function (err, courselist) {
                    if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; return res.send({ code: 204, err: err }); } else return; }
                    flag++;
                    docs[i].courselist = courselist;
                    if (flag == docs.length) return callback(err, docs);
                });
            })(i);
        }
    });
}


//获取机构下的课程
function fun_getDeptCourseList(dept_id, callback) {

    mysql.query("CALL getDeptCourseList( '" + dept_id + "' )", function (err, tmpdocs) {
        var result = tmpdocs[0];

        var table = config[mgenv].mysql.header + "_dept";
        var sqlstr = "select dept_id , name  from  `" + table + "`  where  isvalid = '1' and father_id = '" + dept_id + "'   ";
        mysql.query(sqlstr, function (err, docs) {
            if (err) return callback(err);
            if (docs.length <= 0) return callback(err, result);

            async.eachSeries(docs, function (doc, callback) {
                fun_getDeptCourseList(doc.dept_id, function (err, childDocs) {
                    if (err) return callback();
                     result = result.concat(childDocs);
                    return callback(); 
                });

            }, function (err) {
                return callback(err, result );
            });  //async.  end
 
        });//mysql.query end

    }); //mysql.query end

}











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



function downloadpng(req,res) {
    var user_id = req.session.userinfo.user_id;
    if(user_id == '' || user_id == undefined)  return res.send({code:204,err:'session数据不正确'});

    var path = req.query.path;
    if(user_id == '' || user_id == undefined)  return res.send({code:204,err:'path数据不正确'});

    return res.download(path);

}



//上传头像
function  uploadheadpng(req,res) {
    var user_id = req.session.userinfo.user_id;
    if(user_id == '' || user_id == undefined)  return res.send({code:204,err:'session数据不正确'});

    var headPngPath = config[mgenv].account.headPng;

    uploadFile(headPngPath,req,function(err,fileDoc){
        if(err)	 return res.send({code:204 , err:err}); 
        
        var table_user =  config[mgenv].mysql.header + "_user";
        var sqlstr = " update "+ table_user + "  SET `headpngpath`='" +  fileDoc.path + "' ,  `headpngname` = '" +  fileDoc.name + "'  WHERE `user_id`='" + user_id+"' ";
        mysql.query(sqlstr,function(err, login_docs){
            if(err)	 return res.send({code:204 , err:err});
            else  return res.send({ code:201 ,datas:{path: fileDoc.path} });
        });

    }); //uploadFile 

}

//上传文件
function uploadFile(path, req, callback){
    console.log(path);

    var form =new formidable.IncomingForm();
    form.keepExtensions =true;    //keep .jpg/.png
    form.uploadDir = path;   //upload path});
    form.encoding = 'utf-8';   
    form.maxFieldsSize = 2048 * 1024 * 1;   //文件大小
    

    mkdirpath(path,function(err){ 
        if(err)	 return callback(err);  
        form.parse(req,function(err, fields, files){
            if(err) return callback(err);
            console.log("files:",files);
            var name = files.file.name;
            var filetype = name.substr( name.lastIndexOf(".") + 1 );
            var size  = files.file.size;

            var oldFilepath =  files.file.path;
            var diskname = req.session.userinfo.account + "_" +  UUID.v1() + "." + filetype;
            var newFilepath = path + "/" + diskname ;

            fs.renameSync(oldFilepath, newFilepath);
            var data = {path:newFilepath, name:name, filetype:filetype  , size:size  };
            return callback(err,data);

        });//form.parse end
            
    }); //mkdirpath end

}






//查询组织:注册用
function searchorg_register(req,res) {

    var num = 300;
    var table =  config[mgenv].mysql.header + "_org";
    var sqlstr = " select org_id, name from " +  table + " where isvalid = '1' "; 
     sqlstr =sqlstr + "  limit 0," + num;

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });
}




//搜索组织下所有的机构:注册用
function searchdept_register(req,res){
    var org_id = req.query.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'orgid参数不能为空'});
   
    var table =  config[mgenv].mysql.header + "_dept";
    var sqlstr = "select dept_id , father_id, name, level from `" + table + "` where isvalid = '1' and org_id = '" + org_id +"' ";

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 



 //查询角色:注册用
function  searchroles_register(req,res) {
    var org_id = req.query.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id参数不正确'});

    var table =  config[mgenv].mysql.header + "_role";
    var sqlstr = " select `role_id`, `name`  from " +  table + " where isvalid = '1' and `status` in ('1','2') and `org_id`='" + org_id +"'";

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 






//注册
function register(req,res) {

    var org_id = req.body.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id参数不正确'});

    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不正确'});

    var role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不正确'});

    var account = req.body.account;
    if(account == '' || account == undefined)  return res.send({code:204,err:'account参数不正确'});

    var password = req.body.password , password_tmp = req.body.password;
    if(password == '' || password == undefined)  return res.send({code:204,err:'password参数不正确'});
   
    var email = req.body.email;
    if(email == '' || email == undefined)  return res.send({code:204,err:'email参数不正确'});

    var md5 = crypto.createHash('md5');
    password = config[mgenv].passsheader + md5.update(password).digest('base64');
     
    //1.添加用户账户
    var table_1 =  config[mgenv].mysql.header + "_user";
    
	//检测用户是否重复
	var wherejson = { account:account   };
	templater.isExist(table_1 , wherejson ,function(err,flag){  //检测用户名是否存在
    //console.log(111111);
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"用户名已经存在"});

        var user_id = UUID.v1() , create_time = new Date();
        var data_1 = {user_id:user_id , account:account , password:password, email:email, isadmin:'0' ,  create_time:create_time};
        templater.add( table_1 , data_1, function(err,userdoc){
    //console.log(2222222);
                if(err)	 return  res.send({code:204 , err:err});

                //2.添加用户到机构，并指定角色，并设置为待审核状态

                var table_2 =  config[mgenv].mysql.header + "_dept_user";
                var deptuser_id = UUID.v1() ,  headpngpath = config[mgenv].account.headPng + "/defalut.png" , headpngname = "defalut.png" ; 
                var data_2 =  {deptuser_id:deptuser_id,org_id: org_id, dept_id: dept_id, user_id:user_id , role_id:role_id , status:'0', 
                              headpngpath: headpngpath, headpngname:headpngname ,  create_time:create_time};
                
                templater.add( table_2 , data_2, function(err,userdoc){
     //console.log(3333333);                   
                    if(err)	 return  res.send({code:204 , err:err});
                    //初始化用户的文件夹
                    cloudfile.initfolderdata(account,user_id,function(err,userfolderdoc){
                        if(err) return res.send({code:204 , err:err});
      //console.log(5555555);                      
                        req.body.account = account ,   req.body.password = password_tmp  ;
                        login(req,res);
                    });

                    //return  res.send({ code:202 , datas:{user_id:user_id ,deptuser_id:deptuser_id } });
                }); //templater.add  end


        }); //templater.add  end

    }); //templater.isExist end
}







//登陆
function login(req,res) {
    var returnFlag=0; 
    var account = req.body.account , password = req.body.password ;
    if(account == '' || account == undefined)  return res.send({code:204,err:'账号不能为空'});
    if(password == '' || password == undefined)  return res.send({code:204,err:'密码不能为空'});

    var md5 = crypto.createHash('md5');    
    password = md5.update(password).digest('base64');
    //先判断用户身份： 1.如果为超管,触发超级管理员事件;如果为组织管理员，触发组织管理员事件；如果为普通用户触发，普通用户事件；
    var ep =new EventProxy();

    var userinfo = {} ,orginfo = {} ,menuinfo = [] , personalinfo =[] ,rolesinfo=[] ,roles=[];
    var userfolderinfo = {}, orgfolderinfo = {};
     /*设置session*/
    ep.all('setSession',function(doc){
        //console.log('99999999999');
        //登记登陆时间
        var table_user =  config[mgenv].mysql.header + "_user";
        var nowtime = new Date();
        var sqlstr_logintime = " update "+ table_user + "  SET `lastlogintime`='" +  nowtime + "' WHERE `user_id`='" + userinfo.user_id +"' ";
        mysql.query(sqlstr_logintime,function(err, login_docs){
            if(err)	 console.log(err); 
        });    

        delete userinfo.password;
        req.session.menuinfo = menuinfo;
        req.session.personalinfo = personalinfo;
        req.session.userinfo = userinfo;
        req.session.orginfo = orginfo;
        req.session.rolesinfo = rolesinfo;
        req.session.roles = roles;

        var flag = 0 , end = 2;
        //初始化用户的文件夹
        cloudfile.initfolderdata(account,userinfo.user_id,function(err,userfolderdoc){
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            userfolderinfo =  {user_folder_id:userfolderdoc.user_folder_id ,  diskname:userfolderdoc.diskname };
            req.session.userfolderinfo = userfolderinfo;
            
            flag++;
            if(flag == 2) {
                 var result = {menuinfo : menuinfo , personalinfo : personalinfo ,userinfo : userinfo, orginfo:orginfo , rolesinfo:rolesinfo , roles:roles };
                 return res.send({code:201 , datas:result});
            }

        })

        //无组织游客或超管无需组织文件信息session
       if(userinfo.roleType == 'superadmin' || userinfo.roleType == 'null' ) {
            var result = {menuinfo : menuinfo , personalinfo : personalinfo ,userinfo : userinfo, orginfo:orginfo , rolesinfo:rolesinfo , roles:roles };
            return res.send({code:201 , datas:result});
       }


        //设定组织的文件夹信息，session
        cloudfile.getorg_folder_info(orginfo.org_id, function(err, orgfolderinfo){
                if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
                orgfolderinfo = {org_folder_id:orgfolderinfo.org_folder_id   ,  diskname : orgfolderinfo.diskname } ;
                req.session.orgfolderinfo = orgfolderinfo;
                
                flag++;
                if(flag == 2) {
                    var result = {menuinfo : menuinfo , personalinfo : personalinfo ,userinfo : userinfo, orginfo:orginfo , rolesinfo:rolesinfo , roles:roles };
                    return res.send({code:201 , datas:result});
                }
        }); //cloudfile.getorg_folder_info end 
    

    });
    

     /* 普通用户事件*/
    ep.all('common_user',function(dept_user_docs){
        //获取当前的机构用户信息

        var dept_user_doc = dept_user_docs[0];
        if (dept_user_doc.status == '0') return res.send({ code: 204, err: '账户待审状态' });
        if (dept_user_doc.status == '2') return res.send({ code: 204, err: '账户审核未通过' });

        for(var i=0; i<dept_user_docs.length ;i++ ) { 
            if(dept_user_docs[i].ifdefault == '1') {dept_user_doc = dept_user_docs[i]; break;}
        }


        //1.获取用户的：当前组织信息,机构信息；机构角色信息；当前角色的功能权限信息； 
        var org_id = dept_user_doc.org_id , dept_id = dept_user_doc.dept_id  , role_id = dept_user_doc.role_id  , status = dept_user_doc.status ;

        var Mflag = 0 , Mend = 4;

        //获取角色信息


        mysql.query("CALL stroed_get_role( '" + org_id + "' )",function(err, tmpdocs){
                var rolesdoc = tmpdocs[0];
                
                if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
                roles = rolesdoc;
                Mflag++;
                //触发 设定session
                if(Mflag == Mend) ep.emit('setSession');
        }); // mysql.query end 


           //当前组织信息,机构信息；
        var table_org =  config[mgenv].mysql.header + "_org"  ,  table_dept =  config[mgenv].mysql.header + "_dept"   ;
        var sqlstr_1 = "select a.name as orgName , b.name as deptName from  "+ table_org + " as a , "+ table_dept + " as b where a.org_id=b.org_id  "  +
        " and b.dept_id = '"+ dept_id + "' ";
        
        mysql.query(sqlstr_1,function(err, orgdeptdoc){
            //console.log("11111:");
            if(err || orgdeptdoc.length <= 0) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 

            orginfo.org_id = org_id ,orginfo.orgName = orgdeptdoc[0].orgName ;            
            orginfo.dept_id = dept_id, orginfo.deptName = orgdeptdoc[0].deptName;
            orginfo.deptuser_id = dept_user_doc.deptuser_id;
            Mflag++;
            
            //触发 设定session
            if(Mflag == Mend) ep.emit('setSession');
        });



          //机构角色信息；



         
         mysql.query("CALL orgroles( '" + userinfo.user_id +"' )" , function(err, tmpdocs){
             var rolesdoc =  tmpdocs[0];
             //console.log("sqlstr_2:",orgdeptdoc);
             if(err || rolesdoc.length <= 0)  {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
             rolesinfo = rolesdoc;
             Mflag++;

            //触发 设定session
            if(Mflag == Mend) ep.emit('setSession');
         });


         //当前角色的功能权限信息； 
        apps.getapp_common(role_id , org_id , function(err,resultdoc) {
            //console.log("3333:");
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; } 
            menuinfo = resultdoc.menuinfo;
            personalinfo = resultdoc.personalinfo;
            Mflag++;
            //触发 设定session
            if(Mflag == Mend) ep.emit('setSession');
        });     



    });

    /* 无组织用户事件*/
    ep.all('nullorg_user',function(){
        return res.send({code:204 , err:'无组织游客'});

    });  

    /* 学校管理员事件*/
    ep.all('orgadmin',function(){
        /*1.查询组织是否存在或有效;  2.设置账户信息userinfo;  3.设置组织信息orginfo; 4.设置角色信息rolesinfo, roles; 5.设置功能信息menuinfo,personalinfo;  */
        var org_id = userinfo.org_id;
         org.orginfo(org_id,function(err,orgdocs){
             if(err) return res.send({code:204 , err:err});

            if(orgdocs.length <= 0) return res.send({code:204 , err:"未检测到组织"});
            if(orgdocs.length > 0) {
                orgdoc =  orgdocs[0];
                if(orgdoc.isvalid == '0') return res.send({code:204 , err:"此学校已被注销"}); 

                //如果组织有效
                userinfo.roleType = 'orgadmin';
                orginfo = {org_id:orgdoc.org_id, orgName:orgdoc.name , deptid:'', deptName:orgdoc.name,deptuser_id: 'orgadmin_ID'};
                rolesinfo = [{org_id:orgdoc.org_id, dept_id:'',orgName:orgdoc.name,deptName:orgdoc.name,role_id:'', roleType:'orgadmin', roleName:'学校管理员',deptuser_id:'orgadmin_ID'}];

                //获取角色信息
                var table =  config[mgenv].mysql.header + "_role";
                var sqlstr = "select role_id , name , type ,  status from " + table +" where isvalid = '1' and org_id = '" + org_id +"'   ";
                mysql.query(sqlstr,function(err, rolesdoc){
                     if(err) return res.send({code:204 , err:err});
                     roles = rolesdoc;

                     apps.getapp_Admin(userinfo.isadmin , function(err,resultdoc) {
                            if(err)	 return res.send({code:204 , err:err});
                            menuinfo = resultdoc.menuinfo;
                            personalinfo = resultdoc.personalinfo;
                            //触发 设定session
                            ep.emit('setSession');
                     }); // apps.getapp_Admin emd
                }); // mysql.query end 



            } //if end
         }); // org.orginfo end

    });



    /* 超级管理员事件*/
    ep.all('superadmin',function(){
       userinfo.roleType = 'superadmin';
       orginfo = {org_id:'',dept_id:'',orgName:'超管公司', deptid:'', deptName:'超管部门',deptuser_id: 'superadmin_ID'};
       rolesinfo = [{orgName:'超管公司',deptName:'超管部门',role_id:'', roleType:'superadmin', roleName:'超管',deptuser_id:'superadmin_ID'}];

       apps.getapp_Admin(userinfo.isadmin, function(err,resultdoc) {
           if(err)	 return res.send({code:204 , err:err});
           menuinfo = resultdoc.menuinfo;
           personalinfo = resultdoc.personalinfo;

           //触发 设定session
           ep.emit('setSession');
       });

    });


    var table =  config[mgenv].mysql.header + "_user";
    var namewhere = {account:account , isvalid : '1'};
    var selectstr = " `user_id` ,`account`, `password`,`fullname`,`isadmin`,`org_id`,`email` , `tel` , `headpngpath`   ";
    templater.get(table,namewhere,selectstr, function(err,userdatas){
        if(err)	 return res.send({code:204 , err:err});

        if(userdatas.length <=0 ) return res.send({code:204 , err:"用户不存在"});
        
        var userdata = userdatas[0];

        var password_tmp = config[mgenv].passsheader + password;

        if(password_tmp != userdata.password ) return res.send({ code:204 , err:"用户名或密码错误" });	
        else {
            userinfo =  userdata;
            
            if(userdata.isadmin == '1')       ep.emit('orgadmin');   /**触发组织管理员事件 */
            else if(userdata.isadmin == '2')  ep.emit('superadmin'); /**触发超级管理员事件 */  
            else {
                var table_dep_user = config[mgenv].mysql.header + "_dept_user";
                var sqlstr = "select * from  " + table_dep_user + " where  isvalid = '1'  and user_id ='" + userdata.user_id + "'  and status in ('0','1')  order by  status desc  ";

                //console.log(sqlstr);
                mysql.query(sqlstr,function(err, dept_user_docs){
                    if(err)	 return res.send({code:204 , err:err});

                    if(dept_user_docs.length <=0) ep.emit('nullorg_user');  /**触发游客事件 */
                    else ep.emit('common_user' , dept_user_docs);   /**触发普通用户事件 */
                });

            } //if end

        } //if end 

    }); //templater.get end 

}






//获取初始化数据:session
function initializeinfo(req,res) {
    

    var menuinfo = req.session.menuinfo;
    var personalinfo = req.session.personalinfo;
    var userinfo = req.session.userinfo;
    var orginfo = req.session.orginfo  ;
    var rolesinfo = req.session.rolesinfo ;
    var roles = req.session.roles ;
    var result = {menuinfo : menuinfo , personalinfo : personalinfo ,userinfo : userinfo, orginfo:orginfo , rolesinfo:rolesinfo , roles:roles  };
    return res.send({code:201 , datas:result});
}






//查询组织
function searchorg(req,res) {

    var name = req.query.name;
    var num=req.query.num; 

    if(num == undefined || num > 300 ) num =300;

    var table =  config[mgenv].mysql.header + "_org";
    var sqlstr = " select org_id, name from " +  table + " where isvalid = '1' "; 
    if(name != '' && name != undefined )  sqlstr =sqlstr + "  and  name like '%" + name + "%' " ;
    sqlstr =sqlstr + "  limit 0," + num;

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });
}



//添加组织
function addorg(req,res) {
    var creater = req.session.userinfo.user_id ;  //req.session.userinfo.user_id
    var name = req.body.name;
    if(name == '' || name == undefined)  return res.send({code:204,err:'名称不能为空'});
    var account = req.body.account;
    if(account == '' || account == undefined)  return res.send({code:204,err:'账号不能为空'});
    var password = req.body.password;
    if(password == '' || password == undefined)  return res.send({code:204,err:'密码不能为空'});

    var md5 = crypto.createHash('md5');
    password = config[mgenv].passsheader + md5.update(password).digest('base64');

    var table =  config[mgenv].mysql.header + "_org";

	//检测组织名字是否重复
	var namewhere = {name :　name ,  isvalid:'1'};
	templater.isExist(table , namewhere ,function(err,nameflag){  //检测组织名是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(nameflag == true) return  res.send({code:204 , err:"组织名已经存在"});

        var table_2 =  config[mgenv].mysql.header + "_user";
        var namewhere_2 = {account : account};
        
        templater.isExist(table_2 , namewhere_2 ,function(err,accountflag){  //检测账户名是否存在
            if(err)	 return  res.send({code:204 , err:err});
            if(accountflag == true) return  res.send({code:204 , err:"账户名已经存在"});

            var create_time = new Date();
            //开始添加组织   
            var org_id = UUID.v1(); 
            var data={org_id:org_id  , name:name, creater:creater ,create_time:create_time};
            templater.add( table , data, function(err,doc){
                if(err)	 return  res.send({code:204 , err:err});
                else {
                    //开始添加组织管理员账户
                    var orgadmin_userid = UUID.v1();
                    var data_2 = {user_id: orgadmin_userid , account: account, password:password , fullname:name, isadmin:'1', org_id:org_id   };
                    templater.add( table_2 , data_2, function(err,doc){
                        if(err)	 return  res.send({code:204 , err:err});
                        
                        //开始添加固定的角色： student ：学生， teacher ：老师 
                        role.fixedrole(org_id, function(err,roledocs){
                            if(err)	 return  res.send({code:204 , err:err});
                            //console.log(roledocs);
                            cloudfile.initorgfolderdata(org_id,function(){
                                 if(err)	 return  res.send({code:204 , err:err});
                                 cloudfile.initfolderdata(account,orgadmin_userid,function(err,userfolderdoc){
                                       if(err) return res.send({code:204 , err:err});
                                       return  res.send({ code:201 , datas:{id:org_id }  });
                                 });                      

                            })
                            
                        });                       
                    });
                } 
            }); //templater.add  end

        }); // templater.isExist end 

    }); //templater.isExist end
}


//删除组织
function delorg(req,res) {
    var  org_id = req.body.id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'id参数不正确'});

    var table =  config[mgenv].mysql.header + "_org";
    var wherejson = {org_id:org_id}; 
    var data = {isvalid:'0'};
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


//更新组织信息
function updateorg(req,res) {
    var  org_id = req.body.id;
    var  name = req.body.name;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'id参数不正确'}); 
    if(name == '' || name == undefined)  return res.send({code:204,err:'名称参数不正确'});  
    
    var table =  config[mgenv].mysql.header + "_org";
    var wherejson = {org_id:org_id}; 
    var data = {name:name};
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


//初始化授权的组织信息
function initorgapp(req,res) {
    var returnFlag = 0;
    var  org_id = req.query.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id 参数不正确'}); 
    
    var table =  config[mgenv].mysql.header + "_app";
    //获取普通功能
    var sqlstr = "select app_id from " + table + " where  isvalid = '1' and type='0'  ";
    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        //console.log(docs);
        if(docs.length <=0)   return res.send({code:201});
        else {
            var flag = 1;
            for(var i=0; i<docs.length; i++  ) {
                var doc = docs[i] , app_id = doc.app_id ;
                var org_app_id = UUID.v1();
                var sqlstr_2 = "call stroed_init_orgapp( '" + org_id +"' ,  '" + app_id + "' ,'" + org_app_id + "'  )";   
                mysql.query(sqlstr_2 , function(err,docs){  //初始化授权组织的功能数据
                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }      
                    flag++;
                    if(flag == docs.length) return res.send({code:201});   //如果为最后一次执行，返回
                });       
            } //for end
        } //if end 

    }); // mysql.query end   

}



//初始化授权的组织信息
function initorgapp_v2(org_id,callback) {
    //var  org_id = req.query.org_id;
    var returnFlag=0;
    if(org_id == '' || org_id == undefined)  return  callback({code:204,err:'org_id 参数不正确'}); 
    
    var table =  config[mgenv].mysql.header + "_app";
    //获取普通功能
    var sqlstr = "select app_id from " + table + " where  isvalid = '1' and type='0'  ";
    mysql.query(sqlstr , function(err,docs){
        if(err)	 return callback({code:204,err:err});
        //console.log(docs);
        if(docs.length <=0)   return callback({code:201});
        else {
            var flag = 1;
            for(var i=0; i<docs.length; i++  ) {
                var doc = docs[i] , app_id = doc.app_id ;
                var org_app_id = UUID.v1();
                var sqlstr_2 = "call stroed_init_orgapp( '" + org_id +"' ,  '" + app_id + "' ,'" + org_app_id + "'  )";   
                mysql.query(sqlstr_2 , function(err,docs){  //初始化授权组织的功能数据
                    if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }    
                    flag++;
                    if(flag == docs.length) return callback({code:201}); //如果为最后一次执行，返回
                });       
            } //for end
        } //if end 

    }); // mysql.query end   

}

//var docstmp = initorgapp_v2(org_id,function);
//console.log('uuuu',docstmp );



//获取授权的组织信息
function getorgapp(req,res) {
    var returnFlag=0;
    //1.获取所有有效的组织
    var table =  config[mgenv].mysql.header + "_org";
    var sqlstr = "select org_id , name as org_name from " + table +" where isvalid = '1' ";
    mysql.query(sqlstr , function(err,orgdocs){
            if(err)	 return res.send({code:204 , err:err});

            if(orgdocs.length <= 0) return res.send({code:201 , datas:[]});

            var flag = 0;
            for(var i=0; i < orgdocs.length; i++) {
                var orgdoc = orgdocs[i] ;
                var org_id = orgdoc.org_id , org_name = orgdoc.org_name;
                
                (function(i, org_id){
                    initorgapp_v2(org_id,function(doc){
                        if(doc.code == 204 )  return res.send({code:204 , err:doc.err});
                        //获取普通功能
                        var table_1 =  config[mgenv].mysql.header + "_org_app";
                        var table_2 =  config[mgenv].mysql.header + "_app";
                        var sqlstr_1 = "select a.org_app_id  ,a.app_id ,a.status ,b.name  from " + table_1 + " as a , " + table_2 +" as b " +
                        " where  a.isvalid = '1' and b.isvalid = '1'  and a.app_id = b.app_id  and a.org_id='" + org_id + "'  ";
                        console.log(sqlstr_1);
                        mysql.query(sqlstr_1 , function(err,orgappdocs){
                            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }
                            flag++;
                            orgdocs[i].orgappdocs = orgappdocs;
                            if(flag == orgdocs.length) return res.send({code:201 , datas:orgdocs});
                        });
                    }); //initorgapp_v2 end
                })(i , org_id);

            }//for end
    }); //mysql.query end

}


//更新授权的组织信息
function updateorgapp(req,res) {
    var updater = req.session.userinfo.user_id  ;  
    var org_app_id = req.body.org_app_id;
    if(org_app_id == '' || org_app_id == undefined)  return res.send({code:204,err:'org_app_id参数不正确'}); 

    var status = req.body.status;
    if(status == '' || status == undefined)  return res.send({code:204,err:'status参数不正确'}); 

    var update_time = new Date();

    var data = {status:status , update_time:update_time  ,   updater:updater };

    var table =  config[mgenv].mysql.header + "_org_app";
    var wherejson = {org_app_id: org_app_id }; 

    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}










//初始化组织的角色功能信息 
function initroleapp(req,res) {
    var  org_id;
    if(req.session.orginfo)    org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id session参数不正确'}); 
    
    var table =  config[mgenv].mysql.header + "_role";
    //获取普通功能
    var sqlstr ="select `role_id` from " + table + " where  isvalid = '1' and org_id = '" + org_id + "'  ";

    var returnFlag=0;
    mysql.query(sqlstr , function(err,roledocs){
        if(err)	 return res.send({code:204 , err:err});
        console.log(roledocs);
        if(roledocs.length <=0)   return res.send({code:201});
        else {

            //获取所有的功能app
            var table_2 =  config[mgenv].mysql.header + "_app";
            var sqlstr_2 = "select app_id from " + table_2 + " where  isvalid = '1' and type='0'  ";
            mysql.query(sqlstr_2 , function(err,appdocs){  //初始化授权组织的功能数据
                if(err)	 return res.send({code:204 , err:err});   
                console.log(appdocs);
                if(appdocs.length <=0)   return res.send({code:201});
                else {

                    //依次初始化每个角色的功能
                    var flag = 1;
                    for(var i=0; i<roledocs.length; i++  ) {
                        var roledoc = roledocs[i] , role_id = roledoc.role_id ;
                        
                        for(var j=0;j< appdocs.length; j++) {
                            var appdoc = appdocs[j] , app_id = appdoc.app_id;
                            var role_app_id = UUID.v1() ;
                            var sqlstr_3 = "call stroed_init_roleapp( '" + role_id +"' ,  '" + app_id + "' ,'" + role_app_id + "'  )";   
                            console.log(sqlstr_3);
                            mysql.query(sqlstr_3 , function(err,docs){  //初始化授权组织的功能数据
                                if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }     
                                flag++;
                                if(flag == roledocs.length * appdocs.length  ) return res.send({code:201});   //如果为最后一次执行，返回
                            });   //mysql.query  end 
                        }//for end
                    } //for end
                }//if  end 
            }); // mysql.query end  
        } //if end 
    }); // mysql.query end   
}


//初始化组织的角色功能信息 
function initroleapp_v2(org_id,callback) {

    if(org_id == '' || org_id == undefined)  return callback({code:204,err:'org_id session参数不正确'}); 
    
    var table =  config[mgenv].mysql.header + "_role";
    //获取普通功能
    var sqlstr ="select `role_id` from " + table + " where  isvalid = '1' and org_id = '" + org_id + "'  ";

    var returnFlag=0;
    mysql.query(sqlstr , function(err,roledocs){
        if(err)	 return callback({code:204 , err:err});
        //console.log(roledocs);
        if(roledocs.length <=0)   return callback({code:201});
        else {

            //获取所有的功能app
            var table_2 =  config[mgenv].mysql.header + "_app";
            var sqlstr_2 = "select app_id from " + table_2 + " where  isvalid = '1' and type='0'  ";
            mysql.query(sqlstr_2 , function(err,appdocs){  //初始化授权组织的功能数据
                if(err)	 return callback({code:204 , err:err});   
                console.log(appdocs);
                if(appdocs.length <=0)   return callback({code:201});
                else {

                    //依次初始化每个角色的功能
                    var flag = 1;
                    for(var i=0; i<roledocs.length; i++  ) {
                        var roledoc = roledocs[i] , role_id = roledoc.role_id ;
                        
                        for(var j=0;j< appdocs.length; j++) {
                            var appdoc = appdocs[j] , app_id = appdoc.app_id;
                            var role_app_id = UUID.v1() ;
                            var sqlstr_3 = "call stroed_init_roleapp( '" + role_id +"' ,  '" + app_id + "' ,'" + role_app_id + "'  )";   
                            console.log(sqlstr_3);
                            mysql.query(sqlstr_3 , function(err,docs){  //初始化授权组织的功能数据
                                if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }    
                                flag++;
                                if(flag == roledocs.length * appdocs.length  ) return callback({code:201});   //如果为最后一次执行，返回
                            });   //mysql.query  end 
                        }//for end
                    } //for end
                }//if  end 
            }); // mysql.query end  
        } //if end 
    }); // mysql.query end   
}








//获取组织的角色功能
function getroleapp(req,res) {
    var  org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id 参数不正确'}); 
   
    //初始化
    initroleapp_v2(org_id,function(doc){
        if(doc.code == 204 )  return res.send({code:204,err:doc.err}); 

        //获取普通功能
        var table =  config[mgenv].mysql.header + "_role";
        var sqlstr = "select role_id , name   from " + table + " where  isvalid = '1' and org_id='" + org_id + "'  ";
        mysql.query(sqlstr , function(err,roledocs){
            if(err)	 return res.send({code:204 , err:err});
            
            var flag = 0, returnFlag=0;
            for(var i=0; i< roledocs.length ; i++ ) {
                var roledoc = roledocs[i]  , role_id = roledocs[i].role_id;
                (function(i){
                    var table_2 =  config[mgenv].mysql.header + "_role_app"; 
                    var table_3 =  config[mgenv].mysql.header + "_app"; 

                    var sqlstr_2 = " select a.role_app_id ,  a.app_id, a.status , b.name  from `" + table_2 + "` as a, `" + table_3 + "` as b  where a.app_id = b.app_id " + 
                    "  and a.isvalid = '1'  and b.isvalid = '1' and a.role_id = '" + role_id + "'   ";
                    mysql.query(sqlstr_2 , function(err,roleappdocs){
                        if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }
                        flag++;
                        roledocs[i].roleapps = roleappdocs;
                        if(flag == roledocs.length )  {returnFlag =1; return res.send({code:201,datas:roledocs});  }
                    });
                })(i);

            } //for end
        }); //mysql.query end

    }); //initroleapp_v2 end 

}







//更新角色的功能信息
function updateroleapp(req,res) {
    var updater = req.session.userinfo.user_id  ; 
    var role_app_id = req.body.role_app_id;
    if(role_app_id == '' || role_app_id == undefined)  return res.send({code:204,err:'role_app_id 参数不正确'}); 

    var status = req.body.status;
    if(status == '' || status == undefined)  return res.send({code:204,err:'status参数不正确'}); 

    var update_time = new Date();

    var data = {status:status , update_time:update_time  ,   updater:updater };

    var table =  config[mgenv].mysql.header + "_role_app";
    var wherejson = {role_app_id: role_app_id }; 

    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


















 //查询菜单功能
function  searchapp(req,res) {
    var name = req.query.name;
    var num=req.query.num; 
    //if(num == undefined) 

    if(num == undefined || num > 50 ) num =50;

    var table =  config[mgenv].mysql.header + "_app";
    var sqlstr = " select `app_id`, `name` , `isblank` ,`domain` , `href` , `type` , `position`, `developmark`  from " +  table + " where isvalid = '1' "; 
    if(name != '' && name != undefined )  sqlstr =sqlstr + "  and  name like '%" + name + "%' " ;
    sqlstr =sqlstr + "  limit 0," + num;

    //console.log(sqlstr);

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 


//添加菜单功能
function addapp(req,res) {
    var creater = req.session.userinfo.user_id ;  //req.session.userinfo.user_id
    var name = req.body.name;
    if(name == '' || name == undefined)  return res.send({code:204,err:'name参数不正确'});

    var id = req.body.id;
    if(id == '' || id == undefined)  return res.send({code:204,err:'id参数不正确'});

    var domain_1 = req.body.domain;
    if( domain_1 == undefined)  return res.send({code:204,err:'domain参数不正确'});

    var isblank = req.body.isblank;
    if(isblank == '' || isblank == undefined)  return res.send({code:204,err:'isblank参数不正确'});

    var type = req.body.type;
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'});

    var position = req.body.position;
    if(position == '' || position == undefined)  return res.send({code:204,err:'position参数不正确'});

    var create_time = new Date();
    var data={app_id:id , name:name, isblank:isblank , domain:domain_1 ,  type:type , position:position,  creater:creater ,create_time:create_time};

    var href = req.body.href;
    if( href != undefined)  data.href =href;

    var developmark = req.body.developmark;
    if( developmark != undefined)  data.developmark = developmark;

    var table =  config[mgenv].mysql.header + "_app";

	//检测功能是否重复
	var wherejson = {app_id :id , name:name };
	templater.isExist(table , wherejson ,function(err,flag){  //检测功能是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此功能的id或功能名已经存在"});

        //开始添加功能名
        templater.add( table , data, function(err,doc){
            if(err)	 return  res.send({code:204 , err:err});
            else {
                //console.log(docs);
                delete  data.creater;
                return  res.send({ code:201  });
            } 
        }); //templater.add  end	  

    }); //templater.isExist end
}


//更新菜单功能
function updateapp(req,res) {
    var updater = req.session.userinfo.user_id  ;  
    var  id = req.body.id;
    if(id == '' || id == undefined)  return res.send({code:204,err:'id参数不正确'}); 

    var  name = req.body.name ,domain_1 = req.body.domain ,isblank = req.body.isblank ,type = req.body.type   ;
    var  app_id = req.body.app_id ,   position = req.body.position ,  href = req.body.href;
    var  developmark = req.body.developmark;

    var update_time = new Date();

    var data = {app_id:id, update_time:update_time  ,   updater:updater };
    
    if( app_id != '' && app_id != undefined)   data.app_id = app_id;           
    if( name != undefined)   data.name = name;   
    if( domain_1 != undefined)   data.domain = domain_1;
    if( isblank != undefined)   data.isblank = isblank;
    if( type != undefined)   data.type = type;
    if( position != undefined)   data.position = position;
    if( href != undefined)   data.href = href;
    if( developmark != undefined)   data.developmark = developmark;
    
    var table =  config[mgenv].mysql.header + "_app";
    var wherejson = {app_id:id}; 

    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


//删除菜单功能 ,后续还有删除子功能
function delapp(req,res) {
    var  app_id = req.body.id;
    if(app_id == '' || app_id == undefined)  return res.send({code:204,err:'id参数不正确'});

    var table =  config[mgenv].mysql.header + "_app";
    var wherejson = {app_id:app_id}; 

    templater.delete(table, wherejson,function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else {
            //开始删除子功能
            var funwherejson = {app_id:app_id};
            app_funs.delete(funwherejson,function(err,docs){
                if(err) return  res.send({code:204 , err:err});
                else  return res.send({ code:201 });
            });
           
        }
    });

}



















 //查询子功能
function  searchappfuns(req,res) {
    var app_id = req.query.app_id;

    if(app_id == '' || app_id == undefined)  return res.send({code:204,err:'app_id 参数不正确'});

    var table =  config[mgenv].mysql.header + "_app_funs";
    var sqlstr = " select `fun_id`, `name` , `type` , `href`  from " +  table + " where isvalid = '1' and app_id='" + app_id+"'";
    //select f.fun_id, f.name , f.type , f.href  from mx_app_funs f left join mx_app a on f.app_id = a.app_id where f.isvalid = '1'
    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 


//添加子功能
function addappfun(req,res) {
    var creater = req.session.userinfo.user_id  ;   //req.session.userinfo.user_id
    var name = req.body.name;
    if(name == '' || name == undefined)  return res.send({code:204,err:'name参数不正确'});

    var app_id = req.body.app_id;
    if(app_id == '' || app_id == undefined)  return res.send({code:204,err:'app_id参数不正确'});

    var href = req.body.href;
    if(href == '' || href == undefined)  return res.send({code:204,err:'href参数不正确'});

    var type = req.body.type;
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'});
    var create_time = new Date();

    var fun_id = UUID.v1();
    var data={fun_id:fun_id , app_id:app_id , name:name, href:href , type:type, creater:creater ,create_time:create_time };
    var table =  config[mgenv].mysql.header + "_app_funs";

	//检测功能是否重复
	var wherejson = {app_id :app_id ,  href:href };
	templater.isExist(table , wherejson ,function(err,flag){  //检测功能是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此功能的标识已经存在"});

        //开始添加功能名
        templater.add( table , data, function(err,doc){
            if(err)	 return  res.send({code:204 , err:err});
            else {
                //console.log(docs);
                data.id = doc.insertId;
                delete  data.creater;
                return  res.send({ code:201 , datas:{fun_id:fun_id} });
            } 
        }); //templater.add  end	  

    }); //templater.isExist end
}



//删除子功能
function delappfun(req,res) {
    var  fun_id = req.body.fun_id;
    if(fun_id == '' || fun_id == undefined)  return res.send({code:204,err:'id参数不正确'});

    var table =  config[mgenv].mysql.header + "_app_funs";
    var wherejson = {fun_id:fun_id}; 

    templater.delete(table, wherejson,function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else  return res.send({ code:201 });        
    });

}


 //更新子功能
function updateappfun(req,res) {
    var updater = req.session.userinfo.user_id  ;  
    var app_id = req.body.app_id;
    var  fun_id = req.body.fun_id;
    if(fun_id == '' || fun_id == undefined)  return res.send({code:204,err:'id参数不正确'});

    var  name = req.body.name ,type = req.body.type  ,  href = req.body.href ;

    var update_time = new Date();

    var data = { update_time:update_time  ,   updater:updater };
    if( name != undefined)   data.name = name;
    if( type != undefined)   data.type = type;
    if( href != undefined)   data.href = href;
    
    var table =  config[mgenv].mysql.header + "_app_funs";

	//检测子功能的标识href是否存在
	var wherejson = {app_id :app_id , href:href };
	templater.isExist(table , wherejson ,function(err,flag){  //检测标识是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此功能的href标识已经存在"});

        var wherejson_2 = {fun_id :fun_id };
        templater.update(table, wherejson_2,  data,  function(err,doc){
            if(err) return  res.send({code:204 , err:err});
            else  return  res.send({ code:201 });
        });

    });

}















 //查询角色
function  searchroles(req,res) {
    var org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id参数不正确'});

    var table =  config[mgenv].mysql.header + "_role";
    var sqlstr = " select `role_id`, `name` , `type` , `status`  from " +  table + " where isvalid = '1' and `org_id`='" + org_id +"'";

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 





//添加角色
function addrole(req,res) {
    var creater = req.session.userinfo.user_id  ;   //req.session.userinfo.user_id
   
    var org_id = req.session.orginfo.org_id;
    console.log(org_id);
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id参数不正确'});

    var name = req.body.name;
    if(name == '' || name == undefined)  return res.send({code:204,err:'name参数不正确'});

    var status = req.body.status;
    if(status == '' || status == undefined)  return res.send({code:204,err:'status参数不正确'});

    var type = req.body.type;
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'});

    var create_time = new Date();
    var data={role_id:UUID.v1() , org_id:org_id , name:name, status:status , type:type, creater:creater ,create_time:create_time};
    var table =  config[mgenv].mysql.header + "_role";

	//检测功能是否重复
	var wherejson = {org_id :org_id ,  name:name };
	templater.isExist(table , wherejson ,function(err,flag){  //检测本组织下的角色名是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此角色名已经存在"});

        //开始添加角色
        templater.add( table , data, function(err,doc){
            if(err)	 return  res.send({code:204 , err:err});
            else {
                //console.log(docs);
                //data.id = doc.insertId;
                //delete  data.creater;
                return  res.send({ code:201 , datas:{role_id:doc.insertId} });
            } 
        }); //templater.add  end	  

    }); //templater.isExist end
}





//删除角色
function delrole(req,res) {
    var  role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不能为空'});

    var table =  config[mgenv].mysql.header + "_role";
    var wherejson = {role_id:role_id}; 

    templater.delete(table, wherejson,function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else  return res.send({ code:201 });        
    });

}



 //更新角色
function updaterole(req,res) {
    var updater = req.session.userinfo.user_id  ; 
   var org_id = req.session.orginfo.org_id;
    var  role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不能为空'});

    var  name = req.body.name ,type = req.body.type  ,  status = req.body.status;
    if ( (name =='' || name ==undefined ) && (type =='' || type ==undefined ) && (status =='' || status ==undefined ) )  return res.send({code:204,err:'没有更新数据'});

    var update_time = new Date();

    var data = { update_time:update_time  ,   updater:updater };
    if( name != undefined)   data.name = name;
    if( type != undefined)   data.type = type;
    if( status != undefined)   data.status = status;
    
    var table =  config[mgenv].mysql.header + "_role";

	//检测此组织下的角色名name是否存在
	var wherejson = {org_id :org_id , name:name };
	templater.isExist(table , wherejson ,function(err,flag){  //检测标识是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此角色名已经存在"});

        var wherejson_2 = {role_id :role_id };
        templater.update(table, wherejson_2,  data,  function(err,doc){
            if(err) return  res.send({code:204 , err:err});
            else  return  res.send({ code:201 });
        });

    });

}













//搜索组织下所有的机构
function searchdept(req,res){
    var org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'orgid参数不能为空'});
   
    var table =  config[mgenv].mysql.header + "_dept";
    var sqlstr = "select dept_id , father_id, name, level from `" + table + "` where isvalid = '1' and org_id = '" + org_id +"' ";

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 








//添加机构
function adddept(req,res) {
    var creater = req.session.userinfo.user_id  ;   //req.session.userinfo.user_id
   
    var org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id参数不正确'});

    var name = req.body.name;
    if(name == '' || name == undefined)  return res.send({code:204,err:'name参数不正确'});

    var father_id = req.body.father_id;
    if(father_id == '' || father_id == undefined)  return res.send({code:204,err:'father_id参数不正确'});

    var level = req.body.level;
    if(level == '' || level == undefined)  return res.send({code:204,err:'level参数不正确'});

    var create_time = new Date();
    var dept_id = UUID.v1() ;
    var data={dept_id: dept_id, org_id:org_id , name:name, father_id:father_id , level:level, creater:creater ,create_time:create_time};
    var table =  config[mgenv].mysql.header + "_dept";

	//检测功能是否重复
	var wherejson = {father_id:father_id ,  name:name };
	templater.isExist(table , wherejson ,function(err,flag){  //检测本组织下的角色名是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此功能名已经存在"});

        //开始添加角色
        templater.add( table , data, function(err,doc){
            if(err)	 return  res.send({code:204 , err:err});
            else {
                //console.log(docs);
                //data.id = doc.insertId;
                //delete  data.creater;
                cloudfile.initdeptfolderdata(org_id,dept_id , function(err,doc) {
                    if(err)	 return  res.send({code:204 , err:err});
                    return  res.send({ code:201 , datas:{dept_id:dept_id} });
                });
                
            } 
        }); //templater.add  end	  

    }); //templater.isExist end
}




/*此功能很危险，只能有组织管理员使用*****/
//删除机构, 后续还有注销机构和所有子机构的用户，共享文件夹，共享文件
function deldept(req,res) {
    var updater = req.session.userinfo.user_id  ; 
    var  dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    var table =  config[mgenv].mysql.header + "_dept";
    var wherejson = {dept_id:dept_id}; 

    var update_time = new Date();
    var data = {isvalid:'0', update_time:update_time  ,   updater:updater };
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else  return  res.send({ code:201 });
    });

}



 //更新机构
function updatedept(req,res) {
    var updater = req.session.userinfo.user_id  ; 
    if(req.session.orginfo == undefined)  return res.send({code:204,err:'组织session数据不正确'});
    
    var org_id = req.session.orginfo.org_id;

    var  dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    var name = req.body.name , father_id = req.body.father_id  ,  isvalid = req.body.isvalid  ,  level = req.body.level  ;

    if ( (name =='' || name ==undefined ) && (father_id =='' || father_id ==undefined ) && (isvalid =='' || isvalid ==undefined ) && (level =='' || level ==undefined ) )  return res.send({code:204,err:'没有更新数据'});

    var update_time = new Date();

    var data = { update_time:update_time  ,   updater:updater };
    if( name != undefined)   data.name = name;
    if( father_id != undefined)   data.father_id = father_id;
    if( isvalid != undefined)   data.isvalid = isvalid;
    if( level != undefined)   data.level = level;
    
    var table =  config[mgenv].mysql.header + "_dept";

	//检测此组织下的机构名name是否存在
	var wherejson = {dept_id :dept_id , name:name };
	templater.isExist(table , wherejson ,function(err,flag){  //检测机构名是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此机构名已经存在"});

        var wherejson_2 = {dept_id :dept_id };
        templater.update(table, wherejson_2,  data,  function(err,doc){
            if(err) return  res.send({code:204 , err:err});
            else  return  res.send({ code:201 });
        });

    });

}







//搜索机构下所有的用户
function searchdeptuser(req,res){
    var dept_id = req.query.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});
   
    var table_1 =  config[mgenv].mysql.header + "_dept_user";
    var table_2 =  config[mgenv].mysql.header + "_user";
    
    var sqlstr = "select a.deptuser_id, a.user_id, a.role_id,a.status , b.account ,b.fullname from `" + table_1 + "` as a , `" + table_2 + "`  as b " + 
    " where a.user_id = b.user_id and  a.isvalid = '1' and  b.isvalid = '1' and a.dept_id = '" + dept_id +"' ";

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 




//添加机构的用户
function adddeptuser(req,res) {
    var creater = req.session.userinfo.user_id  ;   //req.session.userinfo.user_id
   
    var org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id参数不正确'});

    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不正确'});
 
    var role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不正确'});

    var account = req.body.account;
    if(account == '' || account == undefined)  return res.send({code:204,err:'account参数不正确'});

    var password = req.body.password;
    if(password == '' || password == undefined)  return res.send({code:204,err:'password参数不正确'});

    var md5 = crypto.createHash('md5');
    password = config[mgenv].passsheader + md5.update(password).digest('base64');
     
    //1.添加用户账户
    var table_1 =  config[mgenv].mysql.header + "_user";
    
    var user_id = UUID.v1() , create_time = new Date();


	//检测功能是否重复
	var wherejson = {isvalid:'1' ,  account:account };
	templater.isExist(table_1 , wherejson ,function(err,flag){  //检测有效账户名是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"用户名已经存在"});

        var data_1 = {user_id:user_id , account:account , password:password, isadmin:'0' ,  creater:creater ,create_time:create_time};
        templater.add( table_1 , data_1, function(err,userdoc){
                if(err)	 return  res.send({code:204 , err:err});

        //2.添加用户的到机构并指定角色
                var table_2 =  config[mgenv].mysql.header + "_dept_user";
                var deptuser_id = UUID.v1(); 
                var data_2 =  {deptuser_id:deptuser_id,org_id: org_id, dept_id: dept_id, user_id:user_id , role_id:role_id , status:'1',  creater:creater ,create_time:create_time};
                
                templater.add( table_2 , data_2, function(err,userdoc){
                    if(err)	 return  res.send({code:204 , err:err}); 
                    //初始化用户的文件夹
                    cloudfile.initfolderdata(account,user_id,function(err,userfolderdoc){
                        if(err) return res.send({code:204 , err:err});
                        return  res.send({ code:201 , datas:{user_id:user_id ,deptuser_id:deptuser_id } });  
                    }); //cloudfile.initfolderdata end

                }); //templater.add  end

        }); //templater.add  end	       
    }); //templater.isExist end
}





//删除机构的一个用户 ，考虑后期用户已在学习或工作中的情况，能否删除；
function deldeptuser(req,res) {
    var updater = req.session.userinfo.user_id  ; 
    var  deptuser_id = req.body.deptuser_id;
    if(deptuser_id == '' || deptuser_id == undefined)  return res.send({code:204,err:'deptuser_id参数不能为空'});

    var table =  config[mgenv].mysql.header + "_dept_user";
    var wherejson = {deptuser_id:deptuser_id}; 

    var update_time = new Date();
    var data = {isvalid:'0', update_time:update_time  ,   updater:updater };
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else  return  res.send({ code:201 });
    });

}



 //更新机构的用户
function updatedeptuser(req,res) {
    var updater = req.session.userinfo.user_id  ; 
    if(req.session.orginfo == undefined)  return res.send({code:204,err:'组织session数据不正确'});
    
    var org_id = req.session.orginfo.org_id;

    var  deptuser_id = req.body.deptuser_id;
    if(deptuser_id == '' || deptuser_id == undefined)  return res.send({code:204,err:'deptuser_id参数不能为空'});

     var  status = req.body.status;
    // if(status == '' || status == undefined)  return res.send({code:204,err:'status参数不能为空'});

     var  role_id = req.body.role_id;
    // if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不能为空'});


    if ( (status =='' || status ==undefined ) && (role_id =='' || role_id ==undefined )  )  return res.send({code:204,err:'没有更新数据'});

    var update_time = new Date();

    var data = { update_time:update_time  ,   updater:updater };
    if( status != undefined)   data.status = status;
    if( role_id != undefined)   data.role_id = role_id;

    
    var table =  config[mgenv].mysql.header + "_dept_user";

    var wherejson = {deptuser_id :deptuser_id };
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else  return  res.send({ code:201 });
    });

}







//登出
function logout(req ,res) {

    delete req.session.userinfo;
    delete req.session.orginfo;
    delete req.session.rolesinfo;
    delete req.session.personalinfo;
    delete req.session.menuinfo;

    return res.send({code:201   });

}





 //设置用户的默认机构角色
function setdefaultrole(req,res) {
    var deptuser_id = req.body.deptuser_id  ; 
    var user_id =req.session.userinfo.user_id;
    if(deptuser_id== undefined)  return res.send({code:204,err:'deptuser_id参数不正确'});

    var table =  config[mgenv].mysql.header + "_dept_user";

    //1.清空所有机构角色默认；  2.重新设置角色默认

    var data_1 = {isdefault:'0' , update_time: new Date  ,   updater:user_id };
    var data_2 = {isdefault:'1' , update_time: new Date  ,   updater:user_id };
    var wherejson_1 = {user_id :user_id };
    var wherejson_2 = {deptuser_id :deptuser_id };

    templater.update(table, wherejson_1,  data_1,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});

        templater.update(table, wherejson_2,  data_2,  function(err,doc){
            if(err) return  res.send({code:204 , err:err}); 
                return res.send({code:201   });
       });          
    });

}


 //切换机构角色
function changerole(req,res) {
    var ep =new EventProxy();
    var deptuser_id = req.body.deptuser_id  ; 
    var user_id =req.session.userinfo.user_id;
    var userinfo = req.session.userinfo;
    if(deptuser_id== undefined)  return res.send({code:204,err:'deptuser_id参数不正确'});
    var returnFlag=0;
   
   var orginfo = {}, rolesinfo={},menuinfo=[],personalinfo=[];

    ep.all('setSession',function(doc){
        req.session.menuinfo = menuinfo;
        req.session.personalinfo = personalinfo;
        req.session.orginfo = orginfo;
        req.session.rolesinfo = rolesinfo;

        //无组织游客或超管无需组织文件信息session
       if(userinfo.roleType == 'superadmin' || userinfo.roleType == 'null' )  return res.send({code:201});

        //设定组织的文件夹信息，session
        cloudfile.getorg_folder_info(orginfo.org_id, function(err, orgfolderinfo){
            if(err) return res.send({code:204 , err:err});
            var orgfolderinfo = {org_folder_id:orgfolderinfo.org_folder_id   ,  diskname : orgfolderinfo.diskname } ;
            req.session.orgfolderinfo = orgfolderinfo;

            return res.send({code:201 });
        });//cloudfile.getorg_folder_info end 

    
    });





    /* 无组织用户事件*/
    ep.all('nullorg_user',function(){
        return res.send({code:204 , err:'无组织游客'});

    });  

     /* 普通用户事件*/
    ep.all('common_user',function(dept_user_doc){
        //console.log('普通用户事件:',dept_user_doc);
        //1.获取用户的：当前组织信息,机构信息；机构角色信息；当前角色的功能权限信息； 
        var org_id = dept_user_doc.org_id , dept_id = dept_user_doc.dept_id  , role_id = dept_user_doc.role_id  , status = dept_user_doc.status ;

        var Mflag = 0 , Mend = 3;
        
         //当前组织信息,机构信息；
        var table_org =  config[mgenv].mysql.header + "_org"  ,  table_dept =  config[mgenv].mysql.header + "_dept"   ;
        var sqlstr_1 = "select a.name as orgName , b.name as deptName from  "+ table_org + " as a , "+ table_dept + " as b where a.org_id=b.org_id  "  +
        " and b.dept_id = '"+ dept_id + "' ";
        console.log('sqlstr_1:',sqlstr_1);
        mysql.query(sqlstr_1,function(err, orgdeptdoc){
            if(err || orgdeptdoc.length <= 0)  {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err});} else return ; }
            console.log('orgdeptdoc:',orgdeptdoc);
            orginfo.org_id = org_id ,orginfo.orgName = orgdeptdoc[0].orgName ;            
            orginfo.dept_id = dept_id, orginfo.deptName = orgdeptdoc[0].deptName;
            orginfo.deptuser_id = dept_user_doc.deptuser_id;
            Mflag++;
            
            //触发 设定session
            if(Mflag == Mend) ep.emit('setSession');
        });


          //机构角色信息；
          var  table_dept_user =  config[mgenv].mysql.header + "_dept_user"  ,  table_role =  config[mgenv].mysql.header + "_role"   ;
          var sqlstr_2 = "select a.org_id, a.name as orgName, b.dept_id, b.name as deptName ,d.role_id , d.type as roleType,d.name as roleName  ,c.deptuser_id,c.status   " +
          " from " + table_org + " as a, " + table_dept + " as b ," + table_dept_user + " as c , " + table_role + " as d where a.org_id = b.org_id and b.dept_id=c.dept_id and c.role_id = d.role_id " + 
          " and a.isvalid = '1'  and b.isvalid = '1' and c.isvalid = '1' and d.isvalid = '1'  "+
          " and c.user_id = '" + user_id + "' ";
          console.log("sqlstr_2",sqlstr_2);
         
         mysql.query(sqlstr_2,function(err, rolesdoc){
              //console.log("2222:");
             console.log("sqlstr_2:",rolesdoc);
             if(err || rolesdoc.length <= 0)  {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err});} else return ; }
             rolesinfo = rolesdoc;
             Mflag++;

            //触发 设定session
            if(Mflag == Mend) ep.emit('setSession');
         });


         //当前角色的功能权限信息； 
        apps.getapp_common(role_id , org_id , function(err,resultdoc) {
            console.log("3333:",resultdoc);
            if(err) {console.log(err); if(returnFlag==0){returnFlag=1; return res.send({code:204 , err:err}); } else return ; }
            //if(err)	 return res.send({code:204 , err:err});
            menuinfo = resultdoc.menuinfo;
            personalinfo = resultdoc.personalinfo;
            Mflag++;
            //触发 设定session
            if(Mflag == Mend) ep.emit('setSession');
        });     

    });




    //获取机构用户信息
    var table =  config[mgenv].mysql.header + "_dept_user";
    var sqlstr = "select * from  " + table + " where deptuser_id ='" + deptuser_id + "'   ";

    console.log(sqlstr);
    mysql.query(sqlstr,function(err, dept_user_docs){
        if(err)	 return res.send({code:204 , err:err});

        if(dept_user_docs.length <=0) ep.emit('nullorg_user');  /**触发游客事件 */
        else ep.emit('common_user' , dept_user_docs[0]);   /**触发普通用户事件 */
    });

}




//添加机构的用户
function applydeptuser(req,res) {
    var user_id = req.session.userinfo.user_id  ;   //req.session.userinfo.user_id

     var org_id = req.body.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'dept_id参数不正确'});

    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不正确'});
 
    var role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不正确'});

    var create_time = new Date();

    //.添加用户的到机构并指定角色,未审核状态
    var table_2 =  config[mgenv].mysql.header + "_dept_user";
    var deptuser_id = UUID.v1(); 
    var data_2 =  {deptuser_id:deptuser_id, org_id: org_id, dept_id: dept_id, user_id:user_id , role_id:role_id , status:'0',  creater:user_id ,create_time:create_time};
    
    templater.add( table_2 , data_2, function(err,userdoc){
        if(err)	 return  res.send({code:204 , err:err}); 
       return  res.send({ code:201 , datas:{deptuser_id:deptuser_id } });  

    }); //templater.add  end

}

//orgadmin组织管理员专用接口：
function addusertodepuser(req,res) {
    var creater = req.session.userinfo.user_id  ;   //req.session.userinfo.user_id
    var org_id = req.session.orginfo.org_id;
   
    var dept_id = req.body.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不正确'});
 
    var role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不正确'});

    var user_id = req.body.user_id;
    if(user_id == '' || user_id == undefined)  return res.send({code:204,err:'user_id参数不正确'});

    var create_time = new Date();

    //.添加用户的到机构并指定角色,已审核状态
    var table_2 =  config[mgenv].mysql.header + "_dept_user";
    var deptuser_id = UUID.v1(); 
    var data_2 =  {deptuser_id:deptuser_id, org_id: org_id, dept_id: dept_id, user_id:user_id , role_id:role_id , status:'1',  creater:creater ,create_time:create_time};
    
    templater.add( table_2 , data_2, function(err,userdoc){
        if(err)	 return  res.send({code:204 , err:err}); 
       return  res.send({ code:201 , datas:{deptuser_id:deptuser_id } });  

    }); //templater.add  end

}




//搜索不在本机构下的有效用户，用户范围限于
function searchundeptusers(req,res) {
    var org_id = req.session.orginfo.org_id;
   
    var accountname = req.query.accountname;
    if(accountname == '' || accountname == undefined)  return res.send({code:204,err:'accountname参数不正确'});
    
    var dept_id = req.query.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不正确'});

    //搜索用户，范围：1.用户在本组织中； 2.包含未审核的用户； 3.用户不存于本机构中；
    var table_1 =  config[mgenv].mysql.header + "_user";
    var table_2 =  config[mgenv].mysql.header + "_dept_user";

    var sqlstr = "select  a.user_id , a.account from " + table_1 + "  as a, " + table_2 + "  as b where a.user_id = b.user_id and a.isvalid='1'     "+
    " and b.org_id = '" + org_id + "' and  b.status in ('0','1') and  b.dept_id != '" + dept_id + "' and a.account like '%" + accountname + "%'  ";
    console.log(sqlstr);
    mysql.query(sqlstr,function(err, userdocs){
        if(err)	 return res.send({code:204 , err:err});
        return res.send({code:201 , datas:userdocs});
    });

}



//修改用户的全名，邮箱，密码,昵称
function updateuserinfo(req,res) {
    var user_id = req.session.userinfo.user_id;
   
    var fullname = req.body.fullname;
    var email = req.body.email;
    var password = req.body.password;
    var nickname = req.body.nickname;

    if(  (fullname == '' || fullname == undefined) &&  (nickname == '' || nickname == undefined) && (email == '' || email == undefined) &&  (password == '' || password == undefined)   )  return res.send({code:204,err:'没有要更新的参数'});
    
    var data = {};
    var md5 = crypto.createHash('md5');

    if(fullname != undefined)  data.fullname = fullname ;
    if(email != undefined)  data.email = email ;
    if(password != undefined && password != '')  data.password = config[mgenv].passsheader + md5.update(password).digest('base64');
    if(nickname != undefined)  data.nickname = nickname ;


    //修改用户的全名，邮箱，密码 
    var table =  config[mgenv].mysql.header + "_user";

    var wherejson = {user_id:user_id}; 

    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });

}


//获取当前登录所在机构树 
function getdepttree(req,res){
    var org_id = req.session.orginfo.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'orgid参数不能为空'});
   
    var dept_id =  req.session.orginfo.dept_id;
    if(dept_id == '' || dept_id == undefined)  return res.send({code:204,err:'dept_id参数不能为空'});

    dept.getdepttree(dept_id , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 





module.exports = router;





