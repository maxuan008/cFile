var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var redis =	require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var moment=require('moment');

//const MongoStore = require('connect-mongo')(session);
var os = require('os');

var config = require('./config/config.json');

var app = express();
var mgenv = app.get('env');
global.mgENV = mgenv;
console.log("-ENV模式: ",mgenv );

var mongo = require('./routes/DB/mongodb');
var mongoDB = new mongo(function(e){
    global.mongoDB = e;

// view engine setup  保存后,先后更新html, 表单项； 没此更新前，删除全部的表单项。
//首次进入，发送http请求向node 请求处理好的表单的html

//var fs = require('fs');
//var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
//var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var ip4='';

if(os.networkInterfaces().eth0) {
    for(var i=0;i<os.networkInterfaces().eth0.length;i++){
        if(os.networkInterfaces().eth0[i].family=='IPv4'){
          ip4=os.networkInterfaces().eth0[i].address;
        } //if end
    } //for end 
}  //if end

var hostname = os.hostname();
//console.log(os.networkInterfaces() );

console.log('-操作系统类型: %s,  主机名:%s , IP地址:%s  ', os.type() , hostname , ip4);
//console.log('----主机名: ' , hostname );
//console.log('----IP地址: ' , ip4);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));


//console.log('__dirname1:', path.join(__dirname, 'public') );

//app.set('view options', { pretty: true });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// //console.log(config);
// var dbpath = 'mongodb://' + config[mgenv].mongodb.host +':'+config[mgenv].mongodb.port + '/' + config[mgenv].mongodb.db;
// //console.log(dbpath);

// var newstroe = new MongoStore({
// 	   url:dbpath,
// 	   ttl: 90000,
// 	   });
//autoRemove: 'interval',
//autoRemoveInterval: 1 //     ttl: 7 * 24 * 60 * 60 // = 7 days. Default

// app.use(cookieParser());

// app.use(session({
//     secret:config[mgenv].cookiesecret,
//     resave: false,
//     saveUninitialized: false,
//     store: newstroe
//    })
// );







console.log("-redis 信息, ip: %s , 端口: %s " , config[mgenv]['redis']['host'] ,  config[mgenv]['redis']['port'] );
var redisConfig = {host:config[mgenv]['redis']['host'],port:config[mgenv]['redis']['port'], password:config[mgenv]['redis']['password']  };

var client = redis.createClient(redisConfig);


client.on("error", function (err) {
    console.log("Error " + err);
});

 app.use( session({
    secret: config[mgenv]['redis']['secret'],
    store: new  redisStore({
       client: client,
       //prefix: Config[env]['redis']['prefix'],    
       ttl : config[mgenv]['redis']['ttl']}),
       saveUninitialized: false,
       resave: false
})); 



//mysql数据库链接信息
console.log("-mysql 信息, ip: %s , 数据库: %s " , config[mgENV].mysql.host , config[mgENV].mysql.db );



//*******中间件：可以用于sesssion验证, 可信任站点，log访问日志的等等*********//

    function isOfficeIpPermit(reqIP, officeConfig, originalUrl) {
        var result = false; 
        if (officeConfig.permitPath.indexOf(originalUrl) == -1) return result;
        for (var i = 0; i < officeConfig.ips.length; i++)  if (reqIP.indexOf(officeConfig.ips[i]) > -1) result = true;
        return result;
    }


//***permitPath中的路径为可信任路径看，无需session也能通过中间件***//
    var permitPath = ['/', '/net/login', '/register', '/net/register/apply' , '/net/register/searchorg_register', '/net/register/searchdept_register','/net/register/searchroles_register']; 

    app.use(function (req, res, next) {
        //console.log("baseUrl:",req.baseUrl,"path:" , req.path , "originalUrl:" , req.originalUrl);
        //console.log(req);
        var reqpath = req.path, originalUrl = req.originalUrl, urlarray = reqpath.split('/'), baseUrl = urlarray[1], reqIP = req.ip    ;
        
        //
        //console.log('session数据：', req.session.userdatas);
        if (originalUrl.indexOf("?") > -1  ) originalUrl = originalUrl.substr(0, originalUrl.indexOf("?")  )
        console.log("R:", originalUrl, baseUrl);
        var officeFlag = isOfficeIpPermit(reqIP, config[mgenv]['onlyoffice'], originalUrl);
        console.log("IP:", reqIP, originalUrl , officeFlag);
        if (permitPath.indexOf(originalUrl) > -1 || officeFlag   ) { //通过可信任路径
            console.log("通过验证:", originalUrl);
            next();

        } else {  //如果未通过信任路径

            if (req.session.userinfo) {  //如果通过session
                console.log("通过验证:", originalUrl);
                next();
            } else {  //如果没有通过session ， 代码为：205
                console.log('session未通过验证');
                return res.send({ code: 205, err: "用户session不存在" });
            }

        } // if end

    }); // app.use end 



//*******中间件 END*********//




//*****模块1：网站框架:用户管理，功能管理，角色管理， 权限管理，访问记录******//

var netindex = require('./routes/net/netindex');
var fileindex = require('./routes/file/fileindex');
var pages = require('./routes/index/index');

var courseindex = require('./routes/course/courseindex');
var questionindex = require('./routes/question/questionindex');
var studyindex = require('./routes/study/studyindex');
var formindex = require('./routes/form/formindex');


app.use('/', pages);
app.use('/net', netindex);
app.use('/file', fileindex);

app.use('/course', courseindex);
app.use('/question', questionindex);

app.use('/study', studyindex);

app.use('/form', formindex);

//*****模块1：网站框架:用户管理，功能管理，角色管理， 权限管理，访问记录******//







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	//console.log('AAAAA');
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}




app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send( {
    message: err.message,
    error: {}
  });
});


 var socketDoc = require('./routes/module/socket');



app.listen( config[mgenv].port  ,  function () {
	var time = moment().format('YYYY-MM-DD HH:mm:ss');
	
  console.log("App项目:  prot:" + config[mgenv].port  + ". Listen Succeed at:" + time );

	});



module.exports = app;

});
