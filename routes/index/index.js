var express = require('express');
var path = require('path');

var router = express.Router();

router.get('/control',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/control.html');
    return  res.sendFile(htmlpath);
});

router.get('/org',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/org.html');
    return  res.sendFile(htmlpath);
});

router.get('/control/file',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/file.html');
    return  res.sendFile(htmlpath);
});

router.get('/control/file/share',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/file-share.html');
    return  res.sendFile(htmlpath);
});

router.get('/register',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/register.html');
    return  res.sendFile(htmlpath);
});

router.get('/testPost',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/testPost.html');
    return  res.sendFile(htmlpath);
});

router.get('/userCenter',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/userCenter.html');
    return  res.sendFile(htmlpath);
});

router.get('/control/myShare',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/share-manage.html');
    return  res.sendFile(htmlpath);
});

//main pages
router.get('/home',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/home.html');
    return  res.sendFile(htmlpath);
});

router.get('/',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/login.html');
    return  res.sendFile(htmlpath);
});

router.get('/create-course',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/create-course.html');
    return  res.sendFile(htmlpath);
});

router.get('/create-area',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/create-area.html');
    return  res.sendFile(htmlpath);
});

router.get('/course-assort',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/course-assort.html');
    return  res.sendFile(htmlpath);
});

router.get('/course',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/course.html');
    return  res.sendFile(htmlpath);
});

router.get('/exam-edit',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/exam-edit.html');
    return  res.sendFile(htmlpath);
});

router.get('/exam',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/exam.html');
    return  res.sendFile(htmlpath);
});

router.get('/study',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/study.html');
    return  res.sendFile(htmlpath);
});

router.get('/test',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/test.html');
    return  res.sendFile(htmlpath);
});

router.get('/org-course',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/org-course.html');
    return  res.sendFile(htmlpath);
});

router.get('/course-child',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/course-child.html');
    return  res.sendFile(htmlpath);
});

router.get('/study-org',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/study-org.html');
    return  res.sendFile(htmlpath);
});

router.get('/study-subject',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/study-subject.html');
    return  res.sendFile(htmlpath);
});

router.get('/form-edit',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/form-edit.html');
    return  res.sendFile(htmlpath);
});

router.get('/form',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/form.html');
    return  res.sendFile(htmlpath);
});

router.get('/form-study',function(req,res){
    var htmlpath = path.join(__dirname, '../../views/index/form-study.html');
    return  res.sendFile(htmlpath);
});

module.exports = router;