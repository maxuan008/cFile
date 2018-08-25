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

var app_funs = require("./module/app_funs");
var apps = require("./module/apps");
var org = require("./module/org");
var role = require("./module/role");

var router = express.Router();

var mgenv = global.mgENV;

router.post('/login',login);   //登陆
router.get('/logout',logout);   //登出
router.get('/initializeinfo',initializeinfo);  //获取初始化数据

router.get('/org/searchorg',searchorg);   //查询组织
router.post('/org/addorg',addorg);   //添加组织
router.post('/org/delorg',delorg);   //删除组织
router.post('/org/updateorg',updateorg);   //更新组织信息


router.get('/org/initorgapp',initorgapp);   //初始化授权的组织信息
router.get('/org/getorgapp',getorgapp);   //获取授权的组织的功能信息
router.get('/org/updateorgapp',updateorgapp);   //更新授权的组织的功能信息


router.get('/role/initroleapp',initroleapp);   //初始化组织的角色功能信息 
router.get('/org/getroleapp',getroleapp);   //获取角色的功能
router.get('/org/updateroleapp',updateroleapp);   //更新角色的功能


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



router.post('/file/upload', upload);   




function upload(req,res) {
     var formidable = require('formidable');
     var fs = require("fs");
    // var querystring = require('querystring');
    // var writerStream = fs.createWriteStream('fileTest.doc');
    // // 使用 utf8 编码写入数据

    // // 定义了一个post变量，用于暂存请求体的信息
    // var post = '';     
 
    // // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    // req.on('data', function(chunk){    
    //     post += chunk;
    //     console.log('========');
    //      writerStream.write(chunk);
        
    // });

    // // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    // req.on('end', function(){    
    //     post = querystring.parse(post);
    //     console.log(post);
       
    //     // 标记文件末尾
    //     writerStream.end();

    //     return res.send(11);
    // });

    var form =new formidable.IncomingForm();
        form.keepExtensions =true;    //keep .jpg/.png
        form.uploadDir = './file';   //upload path});
        form.encoding = 'utf-8';   
        form.maxFieldsSize = 100 * 1024 * 1024;   //文件大小
    
        //console.log(req);

        form.parse(req,function(err, fields, files){
               
             // console.log("parse!");
             // console.dir(files.EDITFILE.path);
             // console.dir(files.EDITFILE.name);
             console.log(files.myfile.name);
              var newFilepath = '.\\file\\' + files.myfile.name;
              var oldFilepath =  files.myfile.path;
               
               console.log('Filepath',newFilepath,oldFilepath);

               fs.renameSync(oldFilepath, newFilepath);
               return  res.send('OK');
         });//bind event handler

        //form.on("progress",function(err){ console.log("progress:");})
       // form.on("complete",function(err){ console.log("complete:"); })


}




//登陆
function login(req,res) {
    var account = req.body.account , password = req.body.password ;
    if(account == '' || account == undefined)  return res.send({code:204,err:'账号不能为空'});
    if(password == '' || password == undefined)  return res.send({code:204,err:'密码不能为空'});

    var md5 = crypto.createHash('md5');
    password = md5.update(password).digest('base64');
    //先判断用户身份： 1.如果为超管,触发超级管理员事件;如果为组织管理员，触发组织管理员事件；如果为普通用户触发，普通用户事件；
    var ep =new EventProxy();

    var userinfo = {} ,orginfo = {} ,menuinfo = [] , personalinfo =[] ,rolesinfo=[] ;

     /* 普通用户事件*/
    ep.all('setSession',function(doc){

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

        var result = {menuinfo : menuinfo , personalinfo : personalinfo ,userinfo : userinfo, orginfo:orginfo , rolesinfo:rolesinfo};
        return res.send({code:201 , datas:result});

    });
    

     /* 普通用户事件*/
    ep.all('common_user',function(doc){


    });

    /* 无组织用户事件*/
    ep.all('nullorg_user',function(){


    });  

    /* 学校管理员事件*/
    ep.all('orgadmin',function(){
        /*1.查询组织是否存在或有效;  2.设置账户信息userinfo;  3.设置组织信息orginfo; 4.设置角色信息rolesinfo; 5.设置功能信息menuinfo,personalinfo;  */
        var org_id = userinfo.org_id;
         org.orginfo(org_id,function(err,orgdocs){
             if(err) return res.send({code:204 , err:err});

            if(orgdocs.length <= 0) return res.send({code:204 , err:"未检测到组织"});
            if(orgdocs.length > 0) {
                orgdoc =  orgdocs[0];
                if(orgdoc.isvalid == '0') return res.send({code:204 , err:"此学校已被注销"}); 

                //如果组织有效
                userinfo.roleType = 'orgadmin';
                orginfo = {org_id:orgdoc.org_id, orgName:orgdoc.name , deptid:'', deptName:orgdoc.name,deptUserId: 'orgadmin_ID'};
                rolesinfo = [{org_id:orgdoc.org_id, dept_id:'',orgName:orgdoc.name,deptName:orgdoc.name,role_id:'', roleType:'orgadmin', roleTypeName:'学校管理员',deptUserId:'orgadmin_ID'}];

                apps.getapp_Admin(userinfo.isadmin ,function(err,resultdoc) {
                    if(err)	 return res.send({code:204 , err:err});
                    menuinfo = resultdoc.menuinfo;
                    personalinfo = resultdoc.personalinfo;

                    //触发 设定session
                    ep.emit('setSession');
                });

            } //if end
         }); // org.orginfo end

    });



    /* 超级管理员事件*/
    ep.all('superadmin',function(){
       userinfo.roleType = 'superadmin';
       orginfo = {org_id:'',dept_id:'',orgName:'超管公司', deptid:'', deptName:'超管部门',deptUserId: 'superadmin_ID'};
       rolesinfo = [{orgName:'超管公司',deptName:'超管部门',role_id:'', roleType:'superadmin', roleTypeName:'超管',deptUserId:'superadmin_ID'}];

       apps.getapp_Admin(userinfo.isadmin ,function(err,resultdoc) {
           if(err)	 return res.send({code:204 , err:err});
           menuinfo = resultdoc.menuinfo;
           personalinfo = resultdoc.personalinfo;

           //触发 设定session
           ep.emit('setSession');
       });

    });


    var table =  config[mgenv].mysql.header + "_user";
    var namewhere = {account:account , isvalid : '1'};
    var selectstr = " `user_id` , `password`,`fullname`,`isadmin`,`org_id`,`eamil` , `tel`  ";
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
                var sqlstr = "select * from  table_dep_user where  isvalid = '1' and user_id ='" + userdata.user_id + "' ";

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
    menuinfo = req.session.menuinfo;
    personalinfo = req.session.personalinfo;
    userinfo = req.session.userinfo;
    orginfo = req.session.orginfo  ;
    rolesinfo = req.session.rolesinfo ;
    var result = {menuinfo : menuinfo , personalinfo : personalinfo ,userinfo : userinfo, orginfo:orginfo , rolesinfo:rolesinfo};
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
    var creater = '';  //req.session.userinfo.user_id
    var name = req.body.name;
    if(name == '' || name == undefined)  return res.send({code:204,err:'名称不能为空'});
    var account = req.body.account;
    if(account == '' || account == undefined)  return res.send({code:204,err:'账号不能为空'});
    var password = req.body.password;
    if(password == '' || password == undefined)  return res.send({code:204,err:'密码不能为空'});

    var md5 = crypto.createHash('md5');
    password = config[mgenv].passsheader + md5.update(password).digest('base64');

    var table =  config[mgenv].mysql.header + "_org";

	//检测组织名字是否重复，  用户账户名是否重复
	var namewhere = {name :　name};
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
                    var data_2 = {user_id:UUID.v1(), account: account, password:password , fullname:name, isadmin:'1', org_id:org_id   };
                    templater.add( table_2 , data_2, function(err,doc){
                        if(err)	 return  res.send({code:204 , err:err});
                        
                        //开始添加固定的角色： student ：学生， teacher ：老师 
                        role.fixedrole(org_id, function(err,roledocs){
                            if(err)	 return  res.send({code:204 , err:err});
                            //console.log(roledocs);
                            return  res.send({ code:201 , datas:{id:org_id }  });
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
                    if(err)	 return res.send({code:204 , err:err});     
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
                    if(err)	 return callback({code:204,err:err});    
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
    var  org_id = req.query.org_id;
    if(org_id == '' || org_id == undefined)  return res.send({code:204,err:'org_id 参数不正确'}); 
   
    initorgapp_v2(org_id,function(doc){
        if(doc.code == 204 )  return res.send({code:204 , err:doc.err});
        //获取普通功能
        var table_1 =  config[mgenv].mysql.header + "_org_app";
        var table_2 =  config[mgenv].mysql.header + "_app";
        var sqlstr = "select a.org_app_id , a.org_id ,a.app_id ,a.status ,b.name  from " + table_1 + " as a , " + table_2 +" as b " +
         " where  a.isvalid = '1' and b.isvalid = '1'  and a.app_id = b.app_id  and a.org_id='" + org_id + "'  ";
        mysql.query(sqlstr , function(err,docs){
            if(err)	 return res.send({code:204 , err:err});
            return res.send({code:204 , datas:docs});
        });
    }); //initorgapp_v2 end
}


//更新授权的组织信息
function updateorgapp(req,res) {
    var updater = ''; 
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
                                if(err)	 return res.send({code:204 , err:err});     
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
                                if(err)	 return callback({code:204 , err:err});     
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
            
            var flag = 1;
            for(var i=0; i< roledocs.length ; i++ ) {
                var roledoc = roledocs[i]  , role_id = roledocs[i].role_id;
                (function(i){
                    var table_2 =  config[mgenv].mysql.header + "_role_app"; 
                    var table_3 =  config[mgenv].mysql.header + "_app"; 

                    var sqlstr_2 = " select a.role_app_id ,  a.app_id, a.status , b.name  from `" + table_2 + "` as a, `" + table_3 + "` as b  where a.app_id = b.app_id " + 
                    "  and a.isvalid = '1'  and b.isvalid = '1' and a.role_id = '" + role_id + "'   ";
                    mysql.query(sqlstr_2 , function(err,roleappdocs){
                        if(err)	 return res.send({code:204 , err:err});
                        flag++;
                        roledocs[i].roleapps = roleappdocs;
                        if(flag == roledocs.length )  return res.send({code:201}); 
                    });
                })(i);

            } //for end
        }); //mysql.query end

    }); //initroleapp_v2 end 

}







//更新角色的功能信息
function updateroleapp(req,res) {
    var updater = ''; 
    var role_app_id = req.body.role_app_id;
    if(role_app_id == '' || role_app_i == undefined)  return res.send({code:204,err:'role_app_id 参数不正确'}); 

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
    var sqlstr = " select `app_id`, `name` , `isblank` ,`domain` , `href` , `type` , `position`  from " +  table + " where isvalid = '1' "; 
    if(name != '' && name != undefined )  sqlstr =sqlstr + "  and  name like '%" + name + "%' " ;
    sqlstr =sqlstr + "  limit 0," + num;

    console.log(sqlstr);

    mysql.query(sqlstr , function(err,docs){
        if(err)	 return res.send({code:204 , err:err});
        else  return res.send({ code:201 , datas:docs });
    });   
} 


//添加菜单功能
function addapp(req,res) {
    var creater = '';  //req.session.userinfo.user_id
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
    var updater = ''; 
    var  id = req.body.id;
    if(id == '' || id == undefined)  return res.send({code:204,err:'id参数不正确'}); 

    var  name = req.body.name ,domain_1 = req.body.domain ,isblank = req.body.isblank ,type = req.body.type   ;
    var  app_id = req.body.app_id ,   position = req.body.position ,  href = req.body.href;

    var update_time = new Date();

    var data = {app_id:id, update_time:update_time  ,   updater:updater };
    
    if( app_id != '' && app_id != undefined)   data.app_id = app_id;           
    if( name != undefined)   data.name = name;   
    if( domain_1 != undefined)   data.domain = domain_1;
    if( isblank != undefined)   data.isblank = isblank;
    if( type != undefined)   data.type = type;
    if( position != undefined)   data.position = position;
    if( href != undefined)   data.href = href;
    
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
    var creater = '';  //req.session.userinfo.user_id
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
    var updater = ''; 
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
    var org_id = req.query.orginfo.org_id;
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
    var creater = '';  //req.session.userinfo.user_id
   
    var org_id = req.session.orginfo.org_id;
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
    var wherejson = {dept_id:dept_id}; 



    templater.delete(table, wherejson,function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else  return res.send({ code:201 });        
    });

}



 //更新角色
function updaterole(req,res) {
    var updater = ''; 
    var org_id = req.session.orginfo.org_id;
    var  role_id = req.body.role_id;
    if(role_id == '' || role_id == undefined)  return res.send({code:204,err:'role_id参数不能为空'});

    var  name = req.body.name ,type = req.body.type  ,  status = req.body.status;
    if ( (name =='' || name ==undefined ) && (type =='' || type ==undefined ) && (status =='' || status ==undefined ) )  return res.send({code:204,err:'没有更新数据'});

    var update_time = new Date();

    var data = { update_time:update_time  ,   updater:updater };
    if( name != undefined)   data.name = name;
    if( type != undefined)   data.type = type;
    if( href != undefined)   data.status = status;
    
    var table =  config[mgenv].mysql.header + "_role";

	//检测此组织下的角色名name是否存在
	var wherejson = {org_id :org_id , name:name };
	templater.isExist(table , wherejson ,function(err,flag){  //检测标识是否存在
        if(err)	 return  res.send({code:204 , err:err});
        if(flag == true) return  res.send({code:204 , err:"此角色名已经存在"});

        var wherejson_2 = {fun_id :fun_id };
        templater.update(table, wherejson_2,  data,  function(err,doc){
            if(err) return  res.send({code:204 , err:err});
            else  return  res.send({ code:201 });
        });

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



















































module.exports = router;





