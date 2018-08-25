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

var _FM =  require("../module/form");


var router = express.Router();

var mgenv = global.mgENV;

//************表单开发*********/

 router.post('/develop/addform', addform);   //创建新的表单
 router.post('/develop/getform', getform);   //查询表单
 router.post('/develop/updateform', updateform);   //更新表单
 router.post('/develop/delform', delform);   //删除表单
 router.post('/develop/completedform', completedform);   //完成表单

 router.post('/develop/addformele', addformele);   //创建新的表单项
 router.post('/develop/getformeles', getformeles);   //查询表单下的表单项：
 router.post('/develop/updateformele', updateformele);   //更新表单项
 router.post('/develop/updateformele_v2', updateformele_v2);   //更新表单项V2
 router.post('/develop/delformele', delformele);   //删除表单项
 router.post('/develop/delformele_v2', delformele_v2);   //删除表单项


 router.post('/develop/addformele', addformeles);   //创建新的表单项集合

router.post('/study/getstudyform', getstudyform);   //查询实例化了的表单：
router.post('/study/updatestudyformele', updatestudyformele);   //更新实例化表单项


//查询实例化了的表单：
function getstudyform(req,res,next){
    var study_html_id = req.body.study_html_id ,result = {};
    if (study_html_id == '' || study_html_id == undefined) return res.send({ code: 204, err:'study_html_id参数不正确'});

    var table = config[mgenv].mysql.header + "_form_study_html";
    var wherejson = { study_html_id: study_html_id, isvalid: '1' };
    var selectstr = " `html_id` ,  `code` ";
    //console.log("");
    templater.get(table, wherejson, selectstr, function (err, docs) {
        if (err) return res.send({ code: 204, err: err });
        if (docs.length <= 0)  return res.send({ code: 204, err: "表单不存在" });
        result.forminfo = docs[0];

        var table_2 = config[mgenv].mysql.header + "_form_study_ele";
        var wherejson_2 = { study_html_id: study_html_id, isvalid: '1' };
        var selectstr_2 = " `study_html_ele_id`, `name` ,  `sid` , `type` , `value` , `title` ";

        templater.get(table_2, wherejson_2, selectstr_2, function (err, eledocs) {
            if (err) return res.send({ code: 204, err: err });
            result.eles = eledocs;
            return res.send({ code: 201, datas:result });
        });
    });

}


//更新实例化表单项
function updatestudyformele(req,res,next){
    var study_html_ele_id = req.body.study_html_ele_id ,  value =  req.body.value;

    var table =  config[mgenv].mysql.header + "_form_study_ele";
    var wherejson = {study_html_ele_id:study_html_ele_id}; 
    var data = {value:value , updater: req.session.userinfo.user_id , update_time: new Date() };
    templater.update(table, wherejson,  data,  function(err,doc){
        if(err) return  res.send({code:204 , err:err});
        else res.send({ code:201 });
    });


}













//*********************************表单设计*********************************//

//添加表单
function addform(req,res,next){
    var code = req.body.code  ;
    if (code == '' || code == undefined) return res.send({ code: 204, err:'code参数不正确'});

    var data = { html_id: UUID.v1(), code: code, status: '0', isvalid: '1', creater: req.session.userinfo.user_id, create_time: new Date() };
    var table = config[mgenv].mysql.header + "_form_html";
    //添加表单
    templater.add(table, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else {
            data.html_id = data.html_id;
            return res.send({ code: 201, datas: { html_id: data.html_id } });
        }
    }); //templater.add  end	
 }


//查询表单
function getform(req, res, next) {
    var html_id = req.body.html_id;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err: 'html_id参数不正确' });

    var table = config[mgenv].mysql.header + "_form_html";
    var wherejson = { html_id: html_id, isvalid: '1' };
    var selectstr = " `code` ";
    templater.get(table, wherejson, selectstr, function (err, docs) {
        if (err) return res.send({ code: 204, err: err });
        if (docs.length <= 0) return res.send({ code: 204, err: "表单不存在" });
        return res.send({ code: 201, datas: { code: docs[0].code } });
    });
}


//更新表单
function updateform(req,res,next){
    var html_id = req.body.html_id, code = req.body.code  ;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err:'html_id参数不正确'});
    if (code == '' || code == undefined) return res.send({ code: 204, err:'code参数不正确'});

    var wherejson = { html_id: html_id}, data = { code: code, updater: req.session.userinfo.user_id, update_time: new Date() };
    var table = config[mgenv].mysql.header + "_form_html";

    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}


//删除表单
function delform(req,res,next){
    var html_id = req.body.html_id ;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err:'html_id参数不正确'});
    var data = { isvalid: '0' }, wherejson = { html_id: html_id }, table = config[mgenv].mysql.header + "_form_html";
    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}


//发布表单
function completedform(req,res,next){
    var html_id = req.body.html_id;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err: 'html_id参数不正确' });
    var data = { status: '0' }, wherejson = { html_id: html_id }, table = config[mgenv].mysql.header + "_form_html";
    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}





//添加表单项
function addformele(req, res, next) {
    var html_id = req.body.html_id, name = req.body.name, type = req.body.type, value = req.body.value, title = req.body.title ;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err: 'html_id参数不正确' });
    if (name == '' || name == undefined) return res.send({ code: 204, err: 'name参数不正确' });
    if (type == '' || type == undefined) return res.send({ code: 204, err: 'type参数不正确' });
    var data = { html_ele_id: UUID.v1() , html_id: html_id, name: name, type: type,  isvalid: '1', creater: req.session.userinfo.user_id, create_time: new Date() }

    if (title != undefined) data.title = title; if (value != undefined) data.value = value;

    var table = config[mgenv].mysql.header + "_form_ele";
    //添加表单项
    templater.add(table, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else {
            data.html_id = doc.insertId;
            return res.send({ code: 201, datas: { html_ele_id: data.html_ele_id } });
        }
    }); //templater.add  end	
}


//添加表单项结合
function addformeles(req, res, next) {
    var eles = req.body.eles; var gettype = Object.prototype.toString
    if (eles == '' || eles == undefined) return res.send({ code: 204, err: 'eles参数不正确' });
    eles = JSON.parse(eles);
    if (gettype.call(eles) != "[object Array]") return res.send({ code: 204, err: 'eles参数需为数组' });
    if (eles.length <= 0) return res.send({ code: 204, err: 'eles为空' });
    //add_Arry = function (table,datas
    var datas = [];
    for (var i = 0; i < eles.length; i++) {
        if (eles[i].html_id == '' || eles[i].html_id == undefined) return res.send({ code: 204, err: 'html_id参数不正确' });
        if (eles[i].name == '' || eles[i].name == undefined) return res.send({ code: 204, err: 'name参数不正确' });
        if (eles[i].type == '' || eles[i].type == undefined) return res.send({ code: 204, err: 'type参数不正确' });
        datas[i] = { html_ele_id: UUID.v1(), html_id: eles[i].html_id, name: eles[i].name, type: eles[i].type, isvalid: '1', creater: req.session.userinfo.user_id, create_time: new Date() };
        if (eles[i].title != undefined) datas[i].title = title; if (eles[i].value != undefined) datas[i].value = value;
    }

    //添加表单项
    var table = config[mgenv].mysql.header + "_form_ele";
    templater.add_Arry(table, datas, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201});
    }); //templater.add  end	
}








//查询表单下的表单项：
function getformeles(req, res, next) {
    var html_id = req.body.html_id;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err: 'html_id参数不正确' });

    var table = config[mgenv].mysql.header + "_form_ele";
    var wherejson = { html_id: html_id, isvalid: '1' };
    var selectstr = " `html_ele_id` ,  `name` ,  `type` , `value` , `title` ";
    templater.get(table, wherejson, selectstr, function (err, docs) {
        if (err) return res.send({ code: 204, err: err });
        return res.send({ code: 201, datas: docs});
    });
}





//更新表单项
function updateformele(req, res, next) {
    var html_ele_id = req.body.html_ele_id, name = req.body.name, type = req.body.type, value = req.body.value, title = req.body.title;
    if (html_ele_id == '' || html_ele_id == undefined) return res.send({ code: 204, err: 'html_ele_id参数不正确' });
    var data = { updater: req.session.userinfo.user_id, update_time: new Date() };

    if (name != undefined)   data.name = name;       if(type != undefined) data.type = type;
    if (title != undefined)  data.title = title;     if (value != undefined) data.value = value;

    var wherejson = { html_ele_id: html_ele_id };
    var table = config[mgenv].mysql.header + "_form_ele";

    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}


//更新表单项V2
function updateformele_v2(req, res, next) {
    var html_id = req.body.html_id, name = req.body.name, type = req.body.type, value = req.body.value, title = req.body.title;
    if (html_id == '' || html_id == undefined) return res.send({ code: 204, err: 'html_id参数不正确' });
    if (name == '' || name == undefined) return res.send({ code: 204, err: 'name参数不正确' });

    var data = { name: name, updater: req.session.userinfo.user_id, update_time: new Date() };

    if (type != undefined) data.type = type; if (title != undefined) data.title = title;
    if (value != undefined) data.value = value;

    var wherejson = { html_id: html_id, name: name, isvalid: '1'  };
    var table = config[mgenv].mysql.header + "_form_ele";

    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}




//删除表单项
function delformele(req, res, next) {
    var html_ele_id = req.body.html_ele_id;
    if (html_ele_id == '' || html_ele_id == undefined) return res.send({ code: 204, err: 'html_ele_id参数不正确' });
    var data = { isvalid: '0' }, wherejson = { html_ele_id: html_ele_id }, table = config[mgenv].mysql.header + "_form_ele";
    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}



//删除表单项V2
function delformele_v2(req, res, next) {
    var html_id = req.body.html_id, name = req.body.name ;
    if (html_ele_id == '' || html_ele_id == undefined) return res.send({ code: 204, err: 'html_ele_id参数不正确' });
    if (name == '' || name == undefined) return res.send({ code: 204, err: 'name参数不正确' });

    var data = { isvalid: '0' }, wherejson = { html_id: html_id, name: name, isvalid: '1' }, table = config[mgenv].mysql.header + "_form_ele";
    templater.update(table, wherejson, data, function (err, doc) {
        if (err) return res.send({ code: 204, err: err });
        else return res.send({ code: 201 });
    });
}




//*********************************表单设计*********************************//





















module.exports = router;





