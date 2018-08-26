var express = require('express');
var config = require("../../config/config.json");
var fs = require('fs');
var UUID = require('uuid');

var mgenv = global.mgENV;
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var group = {}, roomUsers = {};
var GROUP_key_redis = 'group_333777', ROOM_key_redis = 'room_333777';

var roles = {}, rolesRoomSocket = {};
var studyRooms = {}, talkingRomms = {};


var redis = require("redis"), client = redis.createClient({ host: config[mgenv]['redis']['host'], port: config[mgenv]['redis']['port'], password: config[mgenv]['redis']['password'] });


var study_Obj = require('./study');
var _STUDY_LOG = global.mongoDB.collection.study_log;
var _STUDY_TEAM = global.mongoDB.collection.study_team;
var _TASK = global.mongoDB.collection.concrete_task;
var _STUDY_STEP = global.mongoDB.collection.study_step;
var _STUDY_TASK = global.mongoDB.collection.study_task;



function socket(data) {
     this.data = data;
}



//链接的时候触发
io.on('connection', function (socket) {
    //console.log("PPPPPP");
    //console.log("Cookie:", socket.handshake.headers.cookie );

    //获取用户session，信息
    function getUserSessionInfo(socketDoc, callback) {
        /***  验证session */
        var socketcookies = socketDoc.handshake.headers.cookie;
        
        //console.log("----Cookie:", socketcookies);
        if (!socketcookies) { console.log("Cookie数据错误"); return callback("Cookie数据错误"); }
        var pos = -1;
        if (socketcookies.indexOf('; connect.sid=s%3A') > -1) {
            pos = socketcookies.indexOf('; connect.sid=s%3A');
            var sessionCookie = socketcookies.substring(pos + 18, socketcookies.indexOf('.', pos + 19));
        } else {
            pos = socketcookies.indexOf('connect.sid=s%3A');
            var sessionCookie = socketcookies.substring(pos + 16, socketcookies.indexOf('.', pos + 18));
        }                             
            


        //console.log('----pos:',pos);

        if (pos == -1) { console.log("Session 未通过"); return callback("Session未通过"); }
        
        //console.log('Socket Server: connetct cookie is:', sessionCookie ); /* … */
        var seesionKey = "sess:" + sessionCookie;

        //console.log('----sess:', seesionKey );

        client.get(seesionKey, function (err, reply) {
            if (err) { console.log(err); return callback(err); }
            reply = JSON.parse(reply);
            //console.log('----redis reply:', reply);

            if (!reply) return callback("session未通过");
            if (!reply.userinfo) return callback("session未通过");
           
            //console.log("Key Session Info:" , reply);
            return callback(err, reply);
        });
    }

    //重新选定队长
    function changeLeader(study_log_id) {
        var i = 0; for (var user_id in roomUsers[study_log_id]) { i++; if (i == 1) roomUsers[study_log_id][user_id].isleader = '1'; break; }
    }




    //=====大厅相关事件==//

    function processUsers(teamdocs) {
        var result = []; for (i = 0; i < teamdocs.length; i++) result[i] = { user_id: teamdocs[i].user_id, fullname: teamdocs[i].fullname, account: teamdocs[i].account, isleader: teamdocs[i].isleader };
        return result;
    }

    //事件一： 获取大厅数据:  getHall
    socket.on('getHall', function (data) {
        //console.log("getHall参数:" , data);
        if (data == "" || data == undefined) { socket.emit('getHall_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.course_child_id == "" || data.course_child_id == undefined) { socket.emit('getHall_result', { code: 204, err: "course_child_id参数不正确" }); return; }

        //console.log('1:--------', data.course_child_id);

        var course_child_id = data.course_child_id;
        //console.log("course_child_id:",course_child_id);



        //1.未开始的数据。  2.已开始的数据
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('getHall_result', { code: 204, err: err }); return; }
            var result = {};

            //console.log('2:--------', sessionInfo);
            
            //-- 未开始数据
            _STUDY_LOG.find({ course_child_id: course_child_id, type: '1', isvalid: '1' }).toArray(function (err, logdocs) {
                if (err) { console.log(err); socket.emit('getHall_result', { code: 204, err: err }); return; }
                //console.log('2:--------', logdocs);

                var returnFlag = 0, flag = 0, end = logdocs.length;
                if (end <= 0) { socket.join(course_child_id); socket.emit('getHall_result', { code: 201, datas: result }); return;}
                for (var i = 0; i < end; i++) {  //--逐个检查组织学习是否已经开始了
                    (function (i) {
                        //console.log(end,i);  
                        var study_log_id = logdocs[i].study_log_id;
                        result[logdocs[i].study_log_id] = { orgtitle: logdocs[i].orgtitle, least: logdocs[i].least, most: logdocs[i].most };
                        _STUDY_TEAM.find({ study_log_id: logdocs[i].study_log_id, isvalid: '1' }).toArray(function (err, teamdocs) {
                            if (err) { console.log(err); if (returnFlag == 0) { returnFlag = 1; socket.emit('getHall_result', { code: 204, err: err }); return; } else return; }

                            if (teamdocs.length <= 0) { //如果团队尚未形成
                                result[logdocs[i].study_log_id].users = roomUsers[logdocs[i].study_log_id]; result[study_log_id].isStart = '0';
                            } else if (teamdocs.length > 0) {  //此次组织已经开始学习
                                var team_tmp = processUsers(teamdocs);
                                result[logdocs[i].study_log_id].users = team_tmp; result[logdocs[i].study_log_id].isStart = '1';
                            }

                            flag++;   //console.log("L ,N:",end, flag)
                            if (flag == end) { socket.join(course_child_id); socket.emit('getHall_result', { code: 201, datas: result }); }
                        }); //_STUDY_TEAM.find end

                    })(i);
                } // for end
            }); //_STUDY_LOG.findOne end



        }); //getUserSessionInfo end


    });  //socket.on('getHall', end 



    //事件二： 获取房间数据:  getRoom
    socket.on('getRoom', function (data) {
        //console.log("getRoom参数:" , data);
        if (data == "" || data == undefined) { socket.emit('getRoom_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('getRoom_result', { code: 204, err: "study_log_id参数不正确" }); return; }

        var study_log_id = data.study_log_id, result = roomUsers[study_log_id];
        socket.emit('getRoom_result', { code: 201, datas: result });
    });




    //=====大厅相关事件  END==//




    //事件1：占位
    socket.on('join', function (data) {
        //console.log("参数socket:" , socket);
        //console.log("参数:" , data);
        console.log("连接ID:", socket.client.conn.id);

        if (data == "" || data == undefined) { console.log("传递参数不正确"); socket.emit('join_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { console.log("study_log_id参数不正确"); socket.emit('join_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.course_child_id == "" || data.course_child_id == undefined) { console.log("course_child_id参数不正确"); socket.emit('join_result', { code: 204, err: "course_child_id参数不正确" }); return; }


        var study_log_id = data.study_log_id, course_child_id = data.course_child_id;

        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { console.log(err); socket.emit('join_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;

            //console.log("Session Userinfo:" , sessionInfo.userinfo );
            var leader_Flag = '0';
            console.log("进入房间数据：", group[study_log_id]  );
            if (!group[study_log_id] || JSON.stringify(group[study_log_id]) == "{}"  ) { console.log("FFFFF"); group[study_log_id] = {}, roomUsers[study_log_id] = {}; leader_Flag = '1'; }
            if (group[study_log_id][user_id] != undefined || roomUsers[study_log_id][user_id] != undefined) { console.log("不能重复占位"); socket.emit('join_result', { code: 206, err: "不能重复占位" }); return; }

            //加入房间，并广播

            group[study_log_id][user_id] = { socketid: socket.client.conn.id, course_child_id: course_child_id };

            client.set(GROUP_key_redis, JSON.stringify(group));  //client.set(ROOM_key_redis, JSON.stringify(roomUsers) ); 

            console.log("房间信息：", roomUsers[study_log_id]);

            var userinfo_tmp = {
                user_id: sessionInfo.userinfo.user_id  ,
                account: sessionInfo.userinfo.account ,
                fullname: sessionInfo.userinfo.fullname ,
                isadmin: sessionInfo.userinfo.isadmin ,
                org_id: sessionInfo.userinfo.org_id ,
                email: sessionInfo.userinfo.email ,
                tel: sessionInfo.userinfo.tel ,
                headpngpath: sessionInfo.userinfo.headpngpath 
            } ;
            userinfo_tmp.isAgree = '0'; userinfo_tmp.isleader = leader_Flag; userinfo_tmp.joinTime = new Date();
            //console.log("userinfo:", sessionInfo.userinfo, userinfo_tmp);
            roomUsers[study_log_id][user_id] = userinfo_tmp; client.set(ROOM_key_redis, JSON.stringify(roomUsers));

            socket.join(study_log_id);
            //console.log("TTTTTT:",study_log_id ,roomUsers[study_log_id] , roomUsers );
            io.sockets.in(study_log_id).emit('broadcast_room_users', roomUsers[study_log_id]); //广播房间
            io.sockets.in(course_child_id).emit('broadcast_hall_user', { study_log_id: study_log_id, flag: '1', userinfo: sessionInfo.userinfo }); //广播大厅

        }); //getUserSessionInfo end


    }); //事件1：占位---结束



    //事件2: 退出
    socket.on('quit', function (data) {
        console.log("参数:", data);

        if (data == "" || data == undefined) { socket.emit('quit_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('quit_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        //if(data.course_child_id=="" || data.course_child_id==undefined ) {socket.emit('join_result',{code:204 , err: "course_child_id参数不正确"  }); return ;  }

        var study_log_id = data.study_log_id;
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('join_result', { code: 204, err: err }); return; }

            _STUDY_LOG.findOne({ study_log_id: study_log_id }, function (err, logdoc) {
                if (err) { socket.emit('join_result', { code: 204, err: err }); return; }
                var course_child_id = logdoc.course_child_id;
                var user_id = sessionInfo.userinfo.user_id;

                //console.log('PPPPPP:',group[study_log_id][user_id],  roomUsers[study_log_id][user_id] );
                if (group[study_log_id] == undefined || roomUsers[study_log_id] == undefined) {
                    delete group[study_log_id]; delete roomUsers[study_log_id];
                    client.set(GROUP_key_redis, JSON.stringify(group)); client.set(ROOM_key_redis, JSON.stringify(roomUsers));

                    io.sockets.in(study_log_id).emit('broadcast_room_users', roomUsers[study_log_id]); //广播房间
                    io.sockets.to(course_child_id).emit('broadcast_hall_user', { study_log_id: study_log_id, flag: '0', userinfo: sessionInfo.userinfo }); //广播大厅
                    socket.leave(study_log_id); return;
                }


                if (group[study_log_id][user_id] != undefined && roomUsers[study_log_id][user_id] != undefined) {
                    delete group[study_log_id][user_id]; delete roomUsers[study_log_id][user_id];    // 退出房间  退出大厅
                    changeLeader(study_log_id); //重新选定队长
                    client.set(GROUP_key_redis, JSON.stringify(group)); client.set(ROOM_key_redis, JSON.stringify(roomUsers));

                    io.sockets.in(study_log_id).emit('broadcast_room_users', roomUsers[study_log_id]); //广播房间
                    io.sockets.to(course_child_id).emit('broadcast_hall_user', { study_log_id: study_log_id, flag: '0', userinfo: sessionInfo.userinfo }); //广播大厅
                    socket.leave(study_log_id);
                }
            }); //_STUDY_LOG.findOne end 

        });

    });




    //事件2: 同意
    socket.on('agree', function (data) {
        if (data == "" || data == undefined) { socket.emit('agree_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('agree_result', { code: 204, err: "study_log_id参数不正确" }); return; }

        var study_log_id = data.study_log_id;
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('agree_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            roomUsers[study_log_id][user_id].isAgree = '1'; client.set(ROOM_key_redis, JSON.stringify(roomUsers));
            io.sockets.in(study_log_id).emit('broadcast_room_users', roomUsers[study_log_id]); //广播房间
        }); //_STUDY_LOG.findOne end

    });



    //事件3: 不同意
    socket.on('disagree', function (data) {

        if (data == "" || data == undefined) { socket.emit('disagree_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('disagree_result', { code: 204, err: "study_log_id参数不正确" }); return; }

        var study_log_id = data.study_log_id;
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('disagree_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            roomUsers[study_log_id][user_id].isAgree = '0'; client.set(ROOM_key_redis, JSON.stringify(roomUsers));
            io.sockets.in(study_log_id).emit('broadcast_room_users', roomUsers[study_log_id]); //广播房间
        }); //_STUDY_LOG.findOne end

    });








    //事件3：开始
    socket.on('begin', function (data) {
        if (data == "" || data == undefined) { socket.emit('begin_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('begin_result', { code: 204, err: "study_log_id参数不正确" }); return; }

        var study_log_id = data.study_log_id;

        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('begin_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            roomUsers[study_log_id][user_id].isAgree = '0';

            //console.log(111111, study_log_id, roomUsers);
            //检查是否都已同意，以及人数是否合规
            var count = 0, teams = [];
            for (var user_id in roomUsers[study_log_id]) {
                if (roomUsers[study_log_id][user_id].isAgree == '0' && roomUsers[study_log_id][user_id].isleader != '1') { socket.emit('begin_result', { code: 204, err: "还有队员未同意开始:" + roomUsers[study_log_id][user_id].fullname }); return; }
                count++;
                teams[teams.length] = {
                    study_team_id: UUID.v1(), study_log_id: study_log_id, user_id: user_id, fullname: roomUsers[study_log_id][user_id].fullname, account: roomUsers[study_log_id][user_id].account ,headpngpath:roomUsers[study_log_id][user_id].headpngpath  
                    , isleader: roomUsers[study_log_id][user_id].isleader, study_flow:[], create_time: new Date(), isvalid: '1'
                }
            } //for end

            //console.log(222222, teams);   
            //创建团队
            _STUDY_LOG.findOne({ study_log_id: study_log_id }, function (err, logDoc) {
                if (err) { socket.emit('begin_result', { code: 204, err: err }); return; }
                if (logDoc.length <= 0) { socket.emit('begin_result', { code: 204, err: "学习记录不存在" }); return; }
                if (logDoc.isstart == '1') { socket.emit('begin_result', { code: 204, err: "此次学习组织人员已完成，不能重复组建" }); return; }

                if (count < logDoc.least || count > logDoc.most) { socket.emit('begin_result', { code: 204, err: "队员人数不合规" }); return; }
                //console.log(333,  logDoc );

                _STUDY_LOG.update({ study_log_id: study_log_id }, { $set: { isstart: '1' } }, { multi: true }, function (err, doc) {
                    if (err) { socket.emit('begin_result', { code: 204, err: err }); return; }
                    _STUDY_TEAM.insertMany(teams, function (err, doc) {
                        if (err) { socket.emit('begin_result', { code: 204, err: err }); return; }
                        study_Obj.getlearn_next({ study_log_id: study_log_id }, function (err, nextResult) {
                            if (err) { socket.emit('begin_result', { code: 204, err: err }); return; }
                            io.sockets.in(study_log_id).emit('next_broadcast', { code: 201, datas: nextResult }); //广播房间开始课程学习
                        });

                    }); //_STUDY_LOG.insertMany end
                });  //_STUDY_LOG.update end

            }); //_STUDY_LOG.findOne end

        }); //_STUDY_LOG.findOne end


    });



    //--------关于角色

    //事件4：获取角色
    socket.on('getroles', function (data) {
        if (data == "" || data == undefined) { socket.emit('getroles_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('begin_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.step_id == "" || data.step_id == undefined) { socket.emit('getroles_result', { code: 204, err: "step_id参数不正确" }); return; }

        var study_log_id = data.study_log_id, step_id = data.step_id;

        //console.log("A 角色大厅参数:", study_log_id, step_id);
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('getroles_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            var role_room = "Room_" + study_log_id + "_" + step_id;

            var socketid = socket.client.conn.id;

            //   rolesRoomSocket
            //console.log("B 角色大厅参数:", role_room, socketid);

            if (roles[study_log_id] == undefined) roles[study_log_id] = {}, rolesRoomSocket[study_log_id] = {};


            if (roles[study_log_id][step_id] != undefined) {

                //if (rolesRoomSocket[study_log_id][step_id]['users'][user_id].socketid != undefined) { socket.emit('getroles_result', { code: 204, err: "不能重复获取角色" }); return; }
                roles[study_log_id][step_id]['users'][user_id].socketid = socketid;
                socket.join(role_room);
                socket.emit('getroles_result', { code: 201, datas: roles[study_log_id][step_id] });




            } else {  //数据库获取角色信息, 人员信息
                _TASK.find({ step_id: step_id, isvalid: '1' }).toArray(function (err, taskDocs) {
                    if (err) { socket.emit('getroles_result', { code: 204, err: err }); return; }
                    if (taskDocs.length <= 0) { socket.emit('getroles_result', { code: 204, err: "数据错误，此步骤下没有任务" }); return; }
                    roles[study_log_id][step_id] = {}, rolesRoomSocket[study_log_id][step_id] = {};
                    roles[study_log_id][step_id]['users'] = {};
                    var rolesInfo = {};
                    for (var i = 0; i < taskDocs.length; i++) rolesInfo[taskDocs[i].task_id] = { rolename: taskDocs[i].rolename };
                    roles[study_log_id][step_id]['roles'] = rolesInfo;

                    //console.log("C 角色信息：", rolesInfo);
                    _STUDY_TEAM.find({ study_log_id: study_log_id, isvalid: '1' }).toArray(function (err, teams) {
                        if (err) { socket.emit('getroles_result', { code: 204, err: err }); return; }
                        if (teams.length <= 0) { socket.emit('getroles_result', { code: 204, err: "此次组织未检测到队员，请先组队" }); return; }
                       // console.log("D 队员：", teams);

                        for (var j = 0; j < teams.length; j++)  roles[study_log_id][step_id]['users'][teams[j].user_id] = { user_id: teams[j].user_id, fullname: teams[j].fullname, account: teams[j].account , headpngpath: teams[j].headpngpath  };
                        roles[study_log_id][step_id]['users'][user_id].socketid = socketid;

                        socket.join(role_room);
                        socket.emit('getroles_result', { code: 201, datas: roles[study_log_id][step_id] });
                    }); //_STUDY_TEAM.find end

                }); //_TASK.find end

            } //if end

        }); //getUserSessionInfo end 

    });

    //角色选择是否完成
    function isRoleOver(userRoles) {
        var result = true;
        for (var user_id in userRoles) { if (userRoles[user_id].task_id == undefined || userRoles[user_id].socketid == undefined) result = false; }
        return result;
    }



    //事件5：选择角色
    socket.on('choose_role', function (data) {
        if (data == "" || data == undefined) { socket.emit('choose_role_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('choose_role_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.step_id == "" || data.step_id == undefined) { socket.emit('choose_role_result', { code: 204, err: "step_id参数不正确" }); return; }
        if (data.task_id == "" || data.task_id == undefined) { socket.emit('choose_role_result', { code: 204, err: "task_id参数不正确" }); return; }
        var study_log_id = data.study_log_id, step_id = data.step_id, task_id = data.task_id;

        console.log("选择角色 参数：", data);

        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('choose_role_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;

            if (roles[study_log_id][step_id]['roles'] == undefined) { socket.emit('choose_role_result', { code: 204, err: "角色数据不完整" }); return; }
            if (roles[study_log_id][step_id]['roles'][task_id] == undefined) { socket.emit('choose_role_result', { code: 204, err: "task_id不正确" }); return; }

            roles[study_log_id][step_id]['users'][user_id].task_id = task_id, roles[study_log_id][step_id]['users'][user_id].rolename = roles[study_log_id][step_id]['roles'][task_id].rolename;

            var role_room = "Room_" + study_log_id + "_" + step_id;
            io.sockets.in(role_room).emit('roles_broadcast', { datas: roles[study_log_id][step_id] }); //广播角色房间

            var flag = isRoleOver(roles[study_log_id][step_id]['users']);
            if (flag) {
                study_Obj.createStep_Task_many(study_log_id, step_id, roles[study_log_id][step_id], function (err) { //实例化
                    if (err) { console.log(err); socket.emit('choose_role_result', { code: 204, err: err }); return; }
                    io.sockets.in(role_room).emit('roles_over', { code: 201, datas: roles[study_log_id][step_id]['users'] }); //广播角色分配完成
                    //清除此角色房间
                    cancel_roleRoom(study_log_id, step_id);
                });

            }

        }); //getUserSessionInfo end 

    });

    //清除房间
    function cancel_roleRoom(study_log_id, step_id) {
        var role_room = "Room_" + study_log_id + "_" + step_id;
        for (var user in roles[study_log_id][step_id])
            delete roles[study_log_id][step_id];
    }




    //事件6：取消角色
    socket.on('cancel_role', function (data) {
        if (data == "" || data == undefined) { socket.emit('cancel_role_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('cancel_role_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.step_id == "" || data.step_id == undefined) { socket.emit('cancel_role_result', { code: 204, err: "step_id参数不正确" }); return; }
        if (data.task_id == "" || data.task_id == undefined) { socket.emit('cancel_role_result', { code: 204, err: "task_id参数不正确" }); return; }
        var study_log_id = data.study_log_id, step_id = data.step_id, task_id = data.task_id;
        console.log('AAAA:', data, roles[study_log_id][step_id]);

        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('cancel_role_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            console.log('BBBBB:', user_id);
            if (roles[study_log_id][step_id]['roles'] == undefined) { socket.emit('cancel_role_result', { code: 204, err: "角色数据不完整" }); return; }
            if (roles[study_log_id][step_id]['roles'][task_id] == undefined) { socket.emit('cancel_role_result', { code: 204, err: "task_id不正确" }); return; }

            delete roles[study_log_id][step_id]['users'][user_id].task_id; delete roles[study_log_id][step_id]['users'][user_id].rolename;

            console.log("取消角色后的数据：", roles[study_log_id][step_id]);

            var role_room = "Room_" + study_log_id + "_" + step_id;
            io.sockets.in(role_room).emit('roles_broadcast', { datas: roles[study_log_id][step_id] }); //广播角色房间


        }); //getUserSessionInfo end 

    });

    //--------关于角色 - end










    //--------关于学习



    //事件4：进入学习大厅
    socket.on('learn_join', function (data) {
        if (data == "" || data == undefined) { socket.emit('learn_join_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('learn_join_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.step_id == "" || data.step_id == undefined) { socket.emit('learn_join_result', { code: 204, err: "step_id参数不正确" }); return; }

        var study_log_id = data.study_log_id, step_id = data.step_id;

        //console.log("A 学习大厅参数:", study_log_id, step_id);
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('learn_join_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            var role_room = "Study_" + study_log_id + "_" + step_id;

            var socketid = socket.client.conn.id;

            //rolesRoomSocket
            //console.log("B 学习大厅参数:", role_room, socketid);


            if (studyRooms[study_log_id] == undefined) studyRooms[study_log_id] = {};

            if (studyRooms[study_log_id][step_id] != undefined && studyRooms[study_log_id][step_id] != null ) {
                //过滤非法进入
                if (studyRooms[study_log_id][step_id]['users'][user_id] == undefined) { socket.emit('learn_join_result', { code: 204, err: "您不是学习团队成员,无权访问" }); return; }
                if (studyRooms[study_log_id][step_id]['users'][user_id].socketid != undefined) { socket.emit('learn_join_result', { code: 206, err: "您已经在其它地方登入,并正在学习中,不能重复登入" }); return; }

                studyRooms[study_log_id][step_id]['users'][user_id].socketid = socketid;
                socket.join(role_room);
                io.sockets.in(role_room).emit('learn_broadcast', { users: studyRooms[study_log_id][step_id]['users'] }); //广播角色房间

            } else {  //数据库获取人员信息,学习信息

                console.log("YYYY:", { study_log_id: study_log_id, step_id: step_id, isvalid: '1' });
                _STUDY_TASK.find({ study_log_id: study_log_id, step_id: step_id, isvalid: '1' }).toArray(function (err, studyTaskDocs) {
                    if (err) { socket.emit('learn_join_result', { code: 204, err: err }); return; }
                    if (studyTaskDocs.length <= 0) { socket.emit('learn_join_result', { code: 204, err: "数据错误，此任务没有实例化" }); return; }
                    studyRooms[study_log_id][step_id] = {};
                    studyRooms[study_log_id][step_id]['users'] = {};

                    //console.log("C ",  );
                    _STUDY_TEAM.find({ study_log_id: study_log_id, isvalid: '1' }).toArray(function (err, teams) {
                        if (err) { socket.emit('learn_join_result', { code: 204, err: err }); return; }
                        if (teams.length <= 0) { socket.emit('learn_join_result', { code: 204, err: "此次组织未检测到队员，请先组队" }); return; }
                        //console.log("D 队员：", teams);

                        for (var j = 0; j < teams.length; j++)  studyRooms[study_log_id][step_id]['users'][teams[j].user_id] = { user_id: teams[j].user_id, fullname: teams[j].fullname, account: teams[j].account ,headpngpath:teams[j].headpngpath   };
                        studyRooms[study_log_id][step_id]['users'][user_id].socketid = socketid;

                        for (var i = 0; i < studyTaskDocs.length; i++) {
                            //console.log('9999:', studyTaskDocs[i] );
                            //var taskInfo = { task_id: studyTaskDocs[i].task_id, step_id: studyTaskDocs[i].step_id, study_task_id: studyTaskDocs[i].study_task_id, rolename: studyTaskDocs[i].rolename };
                            studyRooms[study_log_id][step_id]['users'][studyTaskDocs[i].user_id].task = { task_id: studyTaskDocs[i].task_id, step_id: studyTaskDocs[i].step_id, study_task_id: studyTaskDocs[i].study_task_id, rolename: studyTaskDocs[i].rolename };
                            studyRooms[study_log_id][step_id]['users'][studyTaskDocs[i].user_id].status = studyTaskDocs[i].is_over;
                        } 

                        socket.join(role_room);
                        console.log('RRR:', studyRooms[study_log_id][step_id]['users']);
                        io.sockets.in(role_room).emit('learn_broadcast', { users: studyRooms[study_log_id][step_id]['users'] }); //广播学习房间
                    }); //_STUDY_TEAM.find end

                }); //_TASK.find end

            } //if end

        }); //getUserSessionInfo end 

    });




    function fun_updateStudyFlow(flowInfo, callback){
        var study_log_id = flowInfo.study_log_id, user_id = flowInfo.user_id, task_id = flowInfo.task_id,
            study_task_id = flowInfo.study_task_id, step_id = flowInfo.step_id, study_step_id = flowInfo.study_step_id;

        _STUDY_TEAM.findOne({ study_log_id: study_log_id, user_id: user_id, isvalid: '1' }, function (err, teamDoc) {
            if (err) return callback(err);
            var study_flow = teamDoc.study_flow;
            if (study_flow == undefined || study_flow == null) study_flow = [];
            study_flow[study_flow.length] = { study_task_id: study_task_id, task_id: task_id, study_step_id: study_step_id, step_id: step_id };

            _STUDY_TEAM.update({ study_team_id: teamDoc.study_team_id, isvalid: '1' }, { $set: { study_flow: study_flow } }, { multi: true }, function (err, doc) {
               return callback(err);
            });//_STUDY_TEAM.update end
            
        });// _STUDY_TEAM.findOne end


    }





    function isStudyOver(studyRooms_users) {
        var result = true;

        for (var user_id in studyRooms_users) { if (studyRooms_users[user_id].status == '0') result = false; }
        return result;
    }


    //事件5：学完了，下一步
    socket.on('learn_finished', function (data) {
        if (data == "" || data == undefined) { socket.emit('learn_finished_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('learn_finished_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.step_id == "" || data.step_id == undefined) { socket.emit('learn_finished_result', { code: 204, err: "step_id参数不正确" }); return; }
        if (data.study_task_id == "" || data.study_task_id == undefined) { socket.emit('learn_finished_result', { code: 204, err: "study_task_id参数不正确" }); return; }

        if (data.task_id == "" || data.task_id == undefined) { socket.emit('learn_finished_result', { code: 204, err: "task_id参数不正确" }); return; }
        if (data.study_step_id == "" || data.study_step_id == undefined) { socket.emit('learn_finished_result', { code: 204, err: "study_step_id参数不正确" }); return; }

        var study_log_id = data.study_log_id, step_id = data.step_id, study_task_id = data.study_task_id, task_id = data.task_id, study_step_id = data.study_step_id ;

        console.log("A 角色大厅参数:", study_log_id, step_id);
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('learn_finished_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            var role_room = "Study_" + study_log_id + "_" + step_id;

            var socketid = socket.client.conn.id;

            if (studyRooms[study_log_id][step_id]['users'] == undefined && studyRooms[study_log_id][step_id]['users'] == null) { socket.emit('learn_finished', { code: 204, err: "此次组织学习已学习完或" }); return; }

            _STUDY_STEP.update({ study_log_id: study_log_id, step_id: step_id, user_id: user_id, isvalid: '1' }, { $set: { isstart: '3' } }, { multi: true }, function (err, doc1) {
                if (err) { socket.emit('learn_finished', { code: 204, err: err }); return; }
                _STUDY_TASK.update({ study_task_id: study_task_id, isvalid: '1' }, { $set: { is_over: '1' } }, { multi: true }, function (err, doc2) {
                    if (err) { socket.emit('learn_finished', { code: 204, err: err }); return; }

                    var flowInfo = { study_log_id: study_log_id, user_id: user_id, task_id: task_id, study_task_id: study_task_id, step_id: step_id, study_step_id: study_step_id    };
                    //console.log("flowInfo:", flowInfo );
                    fun_updateStudyFlow(flowInfo, function (err) {
                        if (err) { socket.emit('learn_finished', { code: 204, err: err }); return; }

                        studyRooms[study_log_id][step_id]['users'][user_id].status = '1';
                        io.sockets.in(role_room).emit('learn_broadcast', { users: studyRooms[study_log_id][step_id]['users'] }); //广播学习房间
                        //如果全部学完，进行下一步
                        var flag = isStudyOver(studyRooms[study_log_id][step_id]['users']);
                        console.log("是否全部学完:", flag);
                        if (flag) {
                            study_Obj.getlearn_next({ study_log_id: study_log_id }, function (err, nextResult) {
                                if (err) { io.sockets.in(study_log_id).emit('next_broadcast', { code: 204, err: "无法进行下一步" + err }); return; }
                                io.sockets.in(study_log_id).emit('next_broadcast', { code: 201, datas: nextResult }); //广播房间开始课程学习

                                //解除学习房间
                                delete studyRooms[study_log_id][step_id]['users'][user_id];
                            });
                        }

                    }); //fun_updateStudyFlow end 

                    //console.log();


                }); //_STUDY_TASK.update END
            }); //_STUDY_STEP.update end

        }); // getUserSessionInfo end
    });



    //----学习大厅----end---//



     //  talkingRomms

    //事件5：进入聊天
    socket.on('talking_join', function (data) {
        if (data == "" || data == undefined) { socket.emit('join_talking_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('join_talking_result', { code: 204, err: "study_log_id参数不正确" }); return; }

        var study_log_id = data.study_log_id ;

        console.log("A 聊天大厅参数:", study_log_id);
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('join_talking_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            var talking_room = "Talking_" + study_log_id ;

            var socketid = socket.client.conn.id;
  
            console.log("B 聊天大厅参数:", talking_room, socketid);

            

            if (talkingRomms[study_log_id] != undefined) {
                //过滤非法进入
                if (talkingRomms[study_log_id]['users'][user_id] == undefined) { socket.emit('join_talking_result', { code: 204, err: "您不是学习团队成员,无权访问" }); return; }
                if (talkingRomms[study_log_id]['users'][user_id].socketid != undefined) { socket.emit('join_talking_result', { code: 206, err: "您已经在其它地方登入,并正在学习中,不能重复登入" }); return; }

                talkingRomms[study_log_id]['users'][user_id].socketid = socketid;
                socket.join(talking_room);

                //返回当天聊天记录
                study_Obj.getTodayTalkingInfo({ study_log_id: study_log_id }, function (err, TalkingInfo) {
                    if (err) { socket.emit('join_talking_result', { code: 204, err: err }); return; }
                    socket.emit('join_talking_result', { code: 201, datas: TalkingInfo });
                });


            } else {  //数据库获取人员信息,聊天信息
                    talkingRomms[study_log_id] = {};
                    _STUDY_TEAM.find({ study_log_id: study_log_id, isvalid: '1' }).toArray(function (err, teams) {
                        if (err) { socket.emit('join_talking_result', { code: 204, err: err }); return; }
                        if (teams.length <= 0) { socket.emit('join_talking_result', { code: 204, err: "此次组织未检测到队员，请先组队" }); return; }
                        console.log("C 队员：", teams);
                        talkingRomms[study_log_id]['users'] = {};
                        for (var j = 0; j < teams.length; j++)  talkingRomms[study_log_id]['users'][teams[j].user_id] = { user_id: teams[j].user_id, fullname: teams[j].fullname, account: teams[j].account , headpngpath:teams[j].headpngpath    };
                        talkingRomms[study_log_id]['users'][user_id].socketid = socketid;
                        console.log("UTF-8:", teams);

                        socket.join(talking_room);
                        //返回当天聊天记录
                        study_Obj.getTodayTalkingInfo({ study_log_id: study_log_id }, function (err, TalkingInfo) {
                            if (err) { socket.emit('join_talking_result', { code: 204, err: err }); return; }
                            socket.emit('join_talking_result', { code: 201, datas: TalkingInfo });
                        });
                    }); //_STUDY_TEAM.find end 

            } //if end

        }); //getUserSessionInfo end 
    });



    //事件6：聊天
    socket.on('talking_sendinfo', function (data) {
        if (data == "" || data == undefined) { socket.emit('talking_sendinfo_result', { code: 204, err: "传递参数不正确" }); return; }
        if (data.study_log_id == "" || data.study_log_id == undefined) { socket.emit('talking_sendinfo_result', { code: 204, err: "study_log_id参数不正确" }); return; }
        if (data.txt == "" || data.txt == undefined) { socket.emit('talking_sendinfo_result', { code: 204, err: "txt参数不正确" }); return; }


        var study_log_id = data.study_log_id, txt = data.txt ;

        console.log("A 聊天发送消息参数:", study_log_id, txt);
        getUserSessionInfo(socket, function (err, sessionInfo) {
            if (err) { socket.emit('talking_sendinfo_result', { code: 204, err: err }); return; }
            var user_id = sessionInfo.userinfo.user_id;
            var talking_room = "Talking_" + study_log_id;

            var socketid = socket.client.conn.id;

            console.log("B 学习大厅参数:", talking_room, socketid);

            if (talkingRomms[study_log_id] == undefined) { socket.emit('talking_sendinfo_result', { code: 204, err: "房间数据不正确" }); return; }

            if (talkingRomms[study_log_id]['users'][user_id] == undefined) { socket.emit('join_talking_result', { code: 204, err: "您不是学习团队成员,无权访问" }); return; }
            if (talkingRomms[study_log_id]['users'][user_id].socketid != socketid ) { socket.emit('join_talking_result', { code: 206, err: "发现您的链接与上次登记簿一致" }); return; }

            //存入条天记录，并广播
            var info = { study_log_id: study_log_id, user_id: user_id, account: sessionInfo.userinfo.account, fullname: sessionInfo.userinfo.fullname, txt: txt, sendTime: new Date() };
            study_Obj.saveTalkingInfo(info, function (err) {
                if (err) { socket.emit('join_talking_result', { code: 204, err: err }); return; }
                io.sockets.in(talking_room).emit('talking_broadcast', { datas: info });  //广播
                
            });


        }); //getUserSessionInfo end 
    });



















    //断开连接
    socket.on('disconnect', function () {
        //console.log("disconnect TTTTTTTTTTTTTTTTTTTTTTTT:", socket.client.conn.id);
        var socketid = socket.client.conn.id;

        for (var study_log_id in group) {
            var logJson = group[study_log_id];
            for (var user_id in logJson) {
                if (socketid == group[study_log_id][user_id].socketid) { //找到了此链接的信息
                    console.log("成功找到断开连接信息");
                    var course_child_id = group[study_log_id][user_id].course_child_id, userinfo = roomUsers[study_log_id][user_id];
                    delete group[study_log_id][user_id]; delete roomUsers[study_log_id][user_id];
                    changeLeader(study_log_id); //重新选定队长 
                    client.set(GROUP_key_redis, JSON.stringify(group)); client.set(ROOM_key_redis, JSON.stringify(roomUsers));
                    io.sockets.in(study_log_id).emit('broadcast_room_users', roomUsers[study_log_id]); //广播房间
                    console.log("退出房间：", { study_log_id: study_log_id, flag: '0', userinfo: roomUsers[study_log_id][user_id] });
                    io.sockets.in(course_child_id).emit('broadcast_hall_user', { study_log_id: study_log_id, flag: '0', userinfo: userinfo }); //广播大厅
                    socket.leave(study_log_id); socket.leave(course_child_id);     // 退出房间  退出大厅

                } //if end
            }
        }


        //清除角色房间

        for (var study_log_id in roles) {
            for (var step_id in roles[study_log_id]) {
                if (roles[study_log_id][step_id] != undefined)
                    for (var user_id in roles[study_log_id][step_id]['users']) {
                        if (socketid == roles[study_log_id][step_id]['users'][user_id].socketid) { //找到了此链接的信息
                            console.log("成功找到角色房间的断开连接信息");
                            //1.清除 roles 2.广播角色房间.  3.退出角色房间
                            roles[study_log_id][step_id]['users'][user_id] = {};
                            var role_room = "Room_" + study_log_id + "_" + step_id;
                            io.sockets.in(role_room).emit('roles_broadcast', { datas: roles[study_log_id][step_id] }); //广播角色房间
                            socket.leave(role_room);     // 退出角色房间
                        } //if end
                    } //for end
            }
        }


        //清除学习房间

        for (var study_log_id in studyRooms) {
            for (var step_id in studyRooms[study_log_id]) {
                if (studyRooms[study_log_id][step_id] != undefined)
                    for (var user_id in studyRooms[study_log_id][step_id]['users']) {
                        if (socketid == studyRooms[study_log_id][step_id]['users'][user_id].socketid) { //找到了此链接的信息
                            console.log("成功找到学习房间的断开连接信息");
                            //1.清除 studyRooms 2.广播角色房间.  3.退出角色房间
                            delete studyRooms[study_log_id][step_id]['users'][user_id].socketid;
                            var role_room = "Study_" + study_log_id + "_" + step_id;
                            io.sockets.in(role_room).emit('learn_broadcast', { users: studyRooms[study_log_id][step_id]['users'] }); //广播角色房间
                            socket.leave(role_room);     // 退出角色房间
                        } //if end
                    } //for end
            }
        }
        //delete group[][];


        //清除聊天记录       talkingRomms[study_log_id]['users'][user_id]
        for (var study_log_id in talkingRomms) {
            if (talkingRomms[study_log_id] != undefined)
                for (var user_id in talkingRomms[study_log_id]['users']) {
                    if (socketid == talkingRomms[study_log_id]['users'][user_id].socketid) { //找到了此链接的信息
                            console.log("成功找到聊天房间的断开连接信息");
                            //1.清除 talkingRomms  2.退出角色房间
                            delete talkingRomms[study_log_id]['users'][user_id].socketid;
                            var talking_room = "Talking_" + study_log_id ;
                            socket.leave(talking_room);     // 退出角色房间
                    } //if end
                } //for end
        }
   







    });





    //事件4：学完了，下一步
    socket.on('reconnecting', function (data) {
        console.log("重新连接成功");

    });

});     

server.listen(config[mgenv].socketPort, function () {
    var time = new Date();
    console.log(" Socket启动:  prot:" + config[mgenv].socketPort + ". Listen Succeed at:" + time);

});





module.exports = socket;






