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
//var cloudfile = require("../module/file");

// var mongoClient =  require("../module/mongoClient");
//var course =  require("../module/course");
var _QT =  require("../module/question");

// var app_funs = require("./module/app_funs");
// var apps = require("./module/apps");
// var org = require("./module/org");
// var role = require("./module/role");

var router = express.Router();

var mgenv = global.mgENV;

//************试题组实开发*********/

 router.post('/develop/addexam',addexam);   //创建新的试题组
 router.post('/develop/updateexam',updateexam);   //更新试题组
 router.post('/develop/delexam',delexam);   //删除试题组
 router.post('/develop/getexam',getexam);   //获取试题组全部试题信息
 router.post('/develop/publishexam',publishexam);   //发布试题组

 router.post('/develop/addquestion',addquestion);   //创建新的试题
 router.post('/develop/updatequestion',updatequestion);   //更新试题
 router.post('/develop/delquestion',delquestion);   //删除试题

 router.post('/develop/addoption',addoption);   //创建新的试题的选项
 router.post('/develop/updateoption',updateoption);   //更新试题的选项
 router.post('/develop/deloption',deloption);   //删除试题的选项
 router.post('/develop/deloption_blank',deloption_blank);   //删除填空的选项


 router.post('/develop/setanswer',setanswer);   //设置答案

//*********************************/




//===============================试题组============================================

function getexam(req,res,next){
    var exam_id = req.body.exam_id  ;
    if(exam_id == '' || exam_id == undefined)  return res.send({code:204,err:'exam_id参数不正确'});

    

    _QT.getexam( exam_id ,function(err,result){  //
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas:result });
    });
}




function addexam(req,res,next){
    var title = req.body.title  ;
    if(title == '' || title == undefined)  return res.send({code:204,err:'title参数不正确'});

    var creater = req.session.userinfo.user_id , create_time = new Date() ; 
    var data = {exam_id:UUID.v1(), title:title , iscompleted:'0' , isvalid:'1' , creater:creater, create_time:create_time } ;
    _QT.addexam( data ,function(err){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas: {exam_id:data.exam_id } });
    });
}



//更新试题组
function updateexam(req,res,next){
    var exam_id=req.body.exam_id, title = req.body.title  ;
    if(title == '' || title == undefined)      return res.send({code:204,err:'title参数不正确'});
    if(exam_id == '' || exam_id == undefined)  return res.send({code:204,err:'exam_id参数不正确'});

    var updater = req.session.userinfo.user_id , update_time = new Date() ; 
    var  wherejson = {exam_id:exam_id};
    var data = { title:title, updater:updater, update_time:update_time } ;
    _QT.updateexam( data , wherejson , function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}

//删除试题组
function delexam(req,res,next){
    var exam_id = req.body.exam_id ;
    if(exam_id == '' || exam_id == undefined)  return res.send({code:204,err:'exam_id参数不正确'});
    var data = {isvalid:'0' } , wherejson = {exam_id: exam_id };
    _QT.updateexam( data , wherejson , function(err,result){ 
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}



//发布试题组
function publishexam(req,res,next){
    var exam_id=req.body.exam_id ;
    if(exam_id == '' || exam_id == undefined)  return res.send({code:204,err:'exam_id参数不正确'});

    var updater = req.session.userinfo.user_id , update_time = new Date() ; 
    var  wherejson = {exam_id:exam_id};
    var data = { iscompleted:'1', updater:updater, update_time:update_time } ;
    _QT.updateexam( data , wherejson , function(err,result){ 
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}

//===============================================================================================





//===============================创建新的试题============================================
function addquestion(req,res,next){
    var exam_id = req.body.exam_id  , type = req.body.type    ;
    if(exam_id == '' || exam_id == undefined)  return res.send({code:204,err:'exam_id参数不正确'});
    if(type == '' || type == undefined)  return res.send({code:204,err:'type参数不正确'});  

    var creater = req.session.userinfo.user_id , create_time = new Date() ; 
    var data = {question_id:UUID.v1(),exam_id:exam_id, type:type,  isvalid:'1' , creater:creater, create_time:create_time } ;
    _QT.addquestion( data ,function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas: result });
    });
}



//更新试题
function updatequestion(req,res,next){
    var question_id=req.body.question_id , score = req.body.score , des = req.body.des , degree = req.body.degree , parse = req.body.parse ;
    if(question_id == '' || question_id == undefined)      return res.send({code:204,err:'title参数不正确'});
   
    var updater = req.session.userinfo.user_id , update_time = new Date() ; 
    var wherejson = {question_id:question_id};
    var data = { updater:updater, update_time:update_time } ;    

    if(score != undefined) data.score = score;
    if(des != undefined) data.des = des;
    if(degree != undefined) data.degree = degree;
    if(parse != undefined) data.parse = parse;
    
    //console.log(data ,wherejson);
    _QT.updatequestion( data , wherejson , function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}

//删除试题
function delquestion(req,res,next){
    var question_id = req.body.question_id ;
    if(question_id == '' || question_id == undefined)  return res.send({code:204,err:'question_id参数不正确'});
    var data = {isvalid:'0',updater:req.session.userinfo.user_id , update_time:new Date() } , wherejson = {question_id: question_id };
    _QT.updatequestion( data , wherejson , function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}

//===============================================================================================


//===============================创建新的的选项============================================
function addoption(req,res,next){
    var exam_id = req.body.exam_id , question_id = req.body.question_id  , answertxt = req.body.answertxt  ;
    if(question_id == '' || question_id == undefined)  return res.send({code:204,err:'question_id参数不正确'});
    if(exam_id == '' || exam_id == undefined)  return res.send({code:204,err:'exam_id参数不正确'});

    var creater = req.session.userinfo.user_id , create_time = new Date() ; 
    var data = {option_id: UUID.v1()  , question_id:question_id, exam_id:exam_id, isanswer:'0',isvalid:'1' , creater:creater, create_time:create_time } ;
    if(answertxt != undefined) data.answertxt = answertxt;

    console.log(data);
    _QT.addoption( data ,function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 , datas: data });
    });
}



//更新选项
function updateoption(req,res,next){
    var option_id=req.body.option_id , type=req.body.type , num = req.body.num,  answer = req.body.answer , parse = req.body.parse;
    if(option_id == '' || option_id == undefined)      return res.send({code:204,err:' option_id 参数不正确'});
    if(type == '' || type == undefined)      return res.send({code:204,err:' type 参数不正确'}); 

    var updater = req.session.userinfo.user_id , update_time = new Date() ; 
    var wherejson = {option_id:option_id};
    var data = { updater:updater, update_time:update_time } ;    

    if(type == '1' || type == '2')  {data.des = answer;    }
    if(type == '3' || type == '4')  {data.answertxt = answer; data.num = num;  }

    if(parse != undefined) data.parse = parse;

    console.log(data, wherejson);
    _QT.updateoption( data , wherejson , function(err,result){  
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}



//删除试题选项
function deloption(req,res,next){
    var option_id = req.body.option_id ;
    if(option_id == '' || option_id == undefined)  return res.send({code:204,err:'option_id参数不正确'});
    var data = {isvalid:'0',updater:req.session.userinfo.user_id , update_time:new Date() } , wherejson = {option_id: option_id };
    _QT.updateoption( data , wherejson , function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}


//删除试题选项:填空题
function deloption_blank(req,res,next){
    var option_ids = JSON.parse(req.body.option_ids) ;
    console.log(option_ids , typeof(option_ids) );
    if(typeof(option_ids) != 'object' )  return res.send({code:204,err:'option_ids参数不正确'});
    var data = {isvalid:'0',updater:req.session.userinfo.user_id , update_time:new Date() } ;
    _QT.deloption_blank( data , option_ids , function(err,result){  //添加步骤
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}





//设置答案
function setanswer(req,res,next){
    var question_id = req.body.question_id ,type=req.body.type,  option_id=req.body.option_id , isanswer = req.body.isanswer, answertxt =  req.body.answertxt   ;
    if(question_id == '' || question_id == undefined)      return res.send({code:204,err:'question_id参数不正确'});
    if(option_id == '' || option_id == undefined)      return res.send({code:204,err:'option_id参数不正确'});
    if(type !='1' && type !='2' && type !='3' && type !='4'    )      return res.send({code:204,err:'type参数不正确'});

    if( (type =='1' || type =='2') && isanswer == undefined )      return res.send({code:204,err:'isanswer参数不正确'});
    if( (type =='3' || type =='4') && answertxt == undefined )    return res.send({code:204,err:'answertxt参数不正确'});

    var updater = req.session.userinfo.user_id , update_time = new Date(); 
    var data = {question_id:question_id, option_id:option_id,  isanswer:isanswer , updater:updater, update_time:update_time } ; 
        
    if(isanswer != undefined)  data.isanswer = isanswer;
    if(answertxt != undefined)  data.answertxt = answertxt;
    console.log(data);

    _QT.setanswer( data , function(err,result){  
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201  });
    });
}


//===============================================================================================






















//************做题， 试题组实例化****/

 router.post('/study/getmyexam',getmyexam);   //获取试题组全部试题信息
 router.post('/study/answerquestion',answerquestion);   //答题
 router.post('/study/completedexam',completedexam);   //提交完成

 router.post('/study/isexamover',isexamover);   //提交完成







//*********************************/
//**获取试题的信息**/
function getmyexam(req,res,next){
    var myexam_id = req.body.myexam_id;
    if(myexam_id == '' || myexam_id == undefined) return res.send({code:204,err:'myexam_id参数不正确'}); 

    var data = {myexam_id:myexam_id, user_id:req.session.userinfo.user_id };

    console.log("data:",data);
    
    _QT.getmyexam_V2(data,function(err,result){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 ,datas:result });
     })
}


//试题作答
function answerquestion(req,res,next){
    var myquestion_id = req.body.myquestion_id ,  myoption_id = req.body.myoption_id, type = req.body.type, 
    isselected = req.body.isselected , txt = req.body.txt ;
    if( myquestion_id== '' || myquestion_id == undefined) return res.send({code:204,err:'myquestion_id 参数不正确'}); 
    if( myoption_id== '' || myoption_id == undefined) return res.send({code:204,err:'myoption_id 参数不正确'}); 
    if( type== '' ||  type== undefined) return res.send({code:204,err:'type 参数不正确'}); 

    var data = {myquestion_id:myquestion_id , myoption_id: myoption_id,type: type };
    if( (type == '1' || type == '2') && (isselected != '0' && isselected != '1'  ) ) return res.send({code:204,err:'isselected 参数不正确'});     
    if( (type == '3' || type == '4') && ( txt == undefined ) ) return res.send({code:204,err:'txt 参数不正确'});     
    if(isselected != undefined) data.isselected = isselected;
    if(txt != undefined)  data.txt = txt;

    _QT.answerquestion(data,function(err){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 });
    }) 

}


//提交
function completedexam(req,res,next){
    var myexam_id = req.body.myexam_id;
    if(myexam_id == '' || myexam_id == undefined) return res.send({code:204,err:'myexam_id参数不正确'}); 
    
    var data = {myexam_id:myexam_id};
    _QT.completedexam(data,function(err){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 });
    }) 

}


//是否答题完成
function isexamover(req,res,next){
    var exam_id = req.body.exam_id;
    if(exam_id == '' || exam_id == undefined) return res.send({code:204,err:'exam_id参数不正确'}); 

    var  flag = true , data = {exam_id:exam_id  , isvalid:'1' , iscompleted:'0'  };
    _QT.isexamover(data,function(err,flag){
        if(err) return  res.send({code:204 , err:err});
        return   res.send({ code:201 ,datas: flag });
    }) 

}

















module.exports = router;





