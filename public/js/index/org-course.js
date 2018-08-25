var course_child_id,course_info,currRoomId,roomDatas,roomList = [],socket,totalPage,toRoomId;

var infoArray = [
    {key:'describe',name:'课程描述',icon:'e30d'},
    {key:'teacher_introduction',name:'教师介绍',icon:'e7fd'},
    {key:'workflow',name:'工作过程',icon:'e335'},
    {key:'target',name:'工作目标',icon:'e838'},
    {key:'tool',name:'工具',icon:'e869'},
    {key:'for_use_people',name:'适用人群',icon:'e8d3'},
    {key:'content',name:'课程内容',icon:'e02f'},
    {key:'task',name:'工作任务',icon:'e153'},
    {key:'keynote',name:'重难点',icon:'e8e7'},
    {key:'method',name:'工作方法与组织方式',icon:'e6dd'}
];

var getCourseInfo = function(callback){
    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getcourse_child',{course_child_id : course_child_id},function(data1){
        if(data1.code === 201){
            course_info = data1.datas;
            callback();
        }else if(data1.code === 204){
            $.InfoBox('alert','error','错误',data1.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var initInfos = function(){
    $('.j-info[data-index="2"]').empty();
    $(infoArray).each(function(i,a){
        if(course_info[a.key]){
            $('.j-info[data-index="2"]').append('<div><h4><span class="j-icon">&#x'+ a.icon+'</span>'+ a.name+'</h4><p>'+course_info[a.key]+'</p></div>');
        }
    });
};

var setPage = function(){
    var index = 0;
    for(var one in roomDatas){
        if(roomDatas.hasOwnProperty(one)){
            roomDatas[one].study_log_id = one;
            if(index === 0){
                roomList[0] = [];
                roomList[0].push(roomDatas[one]);
            }else if(index%12 === 0){
                roomList[index/12] = [];
                roomList[index/12].push(roomDatas[one]);
            }else{
                roomList[Math.floor(index/12)].push(roomDatas[one]);
            }
            index++;
        }
    }
    totalPage = Math.ceil(index/12);
    $('.j-info[data-index="1"]').empty().append('<div class="j-list-con"></div><div class="j-list-page"></div> ');
    $('.j-list-page').empty().append('<span class="j-page j-prev-page">上一页</span>');
    var i = 0;
    for(i = 0;i<totalPage;i++){
        $('.j-list-page').append('<span class="j-page" data-page="'+i+'">'+(i+1)+'</span>');
    }
    $('.j-list-page').append('<span class="j-page j-next-page">下一页</span>');
};

var refrashRoom = function(){
    var appendStr = '',index = 0;
    var canStart = true;
    if(!roomDatas[currRoomId].users[userinfo.user_id]) return false;
    for(var j in roomDatas[currRoomId].users){
        index ++;
    }
    appendStr += '<div class="j-room-con"><div class="j-room-title"><h4>'+roomDatas[currRoomId].orgtitle+'</h4><p>('+index+'/'+roomDatas[currRoomId].most+')</p>';
    if(roomDatas[currRoomId].users[userinfo.user_id].isleader === '1'){
        if(index < parseInt(roomDatas[currRoomId].least))canStart = false;
        appendStr += '<button class="start">开始</button><button class="quit">退出</button>';
    }else{
        if(roomDatas[currRoomId].users[userinfo.user_id].isAgree === '1'){
            appendStr += '<button class="disagree">取消</button><button class="quit">退出</button>';
        }else{
            appendStr += '<button class="agree">准备</button><button class="quit">退出</button>';
        }
    }
    appendStr += '</div><div class="j-room-body">';
    for(var i in roomDatas[currRoomId].users){
        if(roomDatas[currRoomId].users[i].isleader !== '1' && roomDatas[currRoomId].users[i].isAgree !== '1') canStart = false;
        appendStr += '<div class="j-room-one '+(roomDatas[currRoomId].users[i].user_id===userinfo.user_id?'me':'')+'" data-id="'+roomDatas[currRoomId].users[i].user_id+'"><img src="'+(roomDatas[currRoomId].users[i].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+roomDatas[currRoomId].users[i].headpngpath:'/img/default/touxiang.png')+'"/><span class="j-icon j-room-leader '+(roomDatas[currRoomId].users[i].isleader==='1'?'active':'')+'">&#xe838</span><span class="j-prepare '+(roomDatas[currRoomId].users[i].isAgree==='1'?'active':'')+'">已准备</span><p>'+roomDatas[currRoomId].users[i].fullname+'</p></div>'
    }
    appendStr += '</div></div>';
    $('.j-info[data-index="1"]').empty().append(appendStr);
    if(canStart)$('button.start').addClass('active');
};

var initRoom = function(callback){
    var initSocket = function(){
        var socket = io.connect(ports.socket.domain?ports.socket.domain:location.origin);

        socket.on('join_result',function(data){
            if(data.code !== 201){
                currRoomId = '';
                $.InfoBox('alert','error',data.err);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        }).on('broadcast_room_users',function(data){
            roomDatas[currRoomId].users = data;
            refrashRoom();
        }).on('quit_result',function(data){
            if(data.code !== 201)  $.InfoBox('alert','error',data.err);
        }).on('quit_broadcast',function(data){
            if(data.code === 201){
                if(roomDatas[currRoomId].users[data.datas.user_id].isleader){

                }
                $('.j-room-one[data-id="'+data.datas.user_id+'"]').remove();
                delete roomDatas[currRoomId].users[data.datas.user_id];
                refrashRoom();
                if(data.datas.user_id === userinfo.user_id){
                    currRoomId = '';
                    setPage();
                    $('.j-page[data-page="0"]').click();
                }
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        }).on('agree_result',function(data){
            if(data.code !== 201) $.InfoBox('alert','error',data.err);
        }).on('agree_broadcast',function(data){
            if(data.code === 201){
                $('.j-room-one[data-id="'+data.datas.user_id+'"]').find('j-prepare').addClass('active');
                roomDatas[currRoomId].users[data.datas.user_id].isAgree = '1';
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        }).on('begin_result',function(data){
            if(data.code !== 201) $.InfoBox('alert','error',data.err);
        }).on('next_broadcast',function(data){
            var index = 0;
            if(data.code === 201){
                $(data.datas).each(function(i,u){
                    if(u.user_id === userinfo.user_id){
                        index = i;
                    }
                });
                setTimeout('window.location.href = (ports.study.domain === location.host ? ports.study.domain : "") + "/study-org#" + currRoomId',100*(index+1));
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        }).on('getHall_result',function(data){
            if(data.code === 201){
                roomDatas = data.datas;
                var index = false;
                for(var i in roomDatas){
                    index = true;
                    if(!roomDatas[i].users){
                        roomDatas[i].users = {};
                    }
                }
                if(!index){
                    $('.j-info[data-index="1"]').empty().append('<p class="j-load-none">_(:з」∠)_组织列表空空如也</p>');
                    return false;
                }
                if(currRoomId) return false;
                setPage();
                $('.j-page[data-page="0"]').click();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        }).on('broadcast_hall_user',function(data){
            if(data.userinfo.user_id === userinfo.user_id && data.flag === '0'){
                delete roomDatas[data.study_log_id].users[data.userinfo.user_id];
                currRoomId = '';
                setPage();
                $('.j-page[data-page="0"]').click();
                return false;
            }
            if(currRoomId) return false;
            var num,html;
            $(roomList).each(function(i,l){
                $(l).each(function(j,o){
                    if(o.study_log_id === data.study_log_id){
                        if(data.flag === '1'){
                            roomList[i][j].users[data.userinfo.user_id] = data.userinfo;
                            roomDatas[data.study_log_id][data.userinfo.user_id] = data.userinfo;
                            $('.j-list-one>.j-list-body[data-id="'+data.study_log_id+'"]').append('<div class="j-list-user" data-id="'+data.userinfo.user_id+'"><img src="'+(data.userinfo.headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+data.userinfo.headpngpath:'/img/default/touxiang.png')+'"/><p>'+data.userinfo.fullname+'</p></div>');
                            num = $('.j-list-one>.j-list-body[data-id="'+data.study_log_id+'"] .j-list-user').length;
                            html = '('+num+'/'+roomDatas[data.study_log_id].most+')';
                            if(num >= parseInt(roomList[i][j].most)){
                                $('.j-list-one>.j-list-title[data-id="'+data.study_log_id+'"]>button').removeClass('active').html('满员');
                            }
                            $('.j-list-one>.j-list-title[data-id="'+data.study_log_id+'"]>span').html(html);
                        }else{
                            delete roomList[i][j].users[data.userinfo.user_id];
                            delete roomDatas[data.study_log_id][data.userinfo.user_id];
                            $('.j-list-user[data-id="'+data.userinfo.user_id+'"]').remove();
                            num = $('.j-list-one>.j-list-body[data-id="'+data.study_log_id+'"] .j-list-user').length;
                            html = '('+num+'/'+roomDatas[data.study_log_id].most+')';
                            $('.j-list-one>.j-list-title[data-id="'+data.study_log_id+'"]>span').html(html);
                        }
                    }
                });
            });

        });
        return socket;
    };
    $('.j-info[data-index="1"]').empty().append('<i class="j-icon j-loading">&#xe9a5</i>');
    socket = initSocket();
    socket.emit('getHall',{course_child_id:course_child_id});
    callback();
};

var bindEvents = function(){
    $('.j-tab').on('click','p',function(){
        $('.j-tab p.active').removeClass('active');

        var index = $(this).addClass('active').attr('data-index');
        $('.j-info').hide();
        $('.j-info[data-index="'+index+'"]').show();
    });

    $('.j-info')
        .on('click','.j-page',changePage)
        .on('click','.j-list-title>button',joinRoom)
        .on('click','.j-room-title>.quit',quitRoom)
        .on('click','.j-room-title>.agree',agreeRoom)
        .on('click','.j-room-title>.start',startRoom)
        .on('click','.j-room-title>.disagree',disagreeRoom)
    ;
};

var disagreeRoom = function(){
    socket.emit('disagree',{study_log_id:currRoomId});
};

var startRoom = function(){
    if(!$(this).hasClass('active')) return false;
    socket.emit('begin',{study_log_id:currRoomId});
};

var agreeRoom = function(){
    socket.emit('agree',{study_log_id:currRoomId});
};

var quitRoom = function(){
    socket.emit('quit',{study_log_id:currRoomId});
};

var joinRoom = function(){
    if(!$(this).hasClass('active') && !$(this).hasClass('have')) return false;
    var study_log_id = currRoomId = $(this).parent().attr('data-id');
    if($(this).hasClass('active')){
        socket.emit('join',{study_log_id:study_log_id,course_child_id:course_child_id});
    }else{
        window.location.href = (ports.study.domain === location.host ? ports.study.domain : "") + "/study-org#" + study_log_id;
    }
};

var changePage = function(){
    if($(this).hasClass('active')) return false;
    if($(this).hasClass('j-prev-page')){
        if(currentPage <= 0) return false;
        currentPage--;
    }else if($(this).hasClass('j-next-page')){
        if(currentPage >= (totalPage-1)) return false;
        currentPage++;
    }else{
        currentPage = parseInt($(this).attr('data-page'));
    }
    $('.j-list-con').empty();
    var appendStr = '',index;
    $(roomList[currentPage]).each(function(i,o){
        //o = JSON.parse(o);
        appendStr = '';
        index = 0;
        var j;
        var joined = false;
        if(o.users){
            $(o.users).each(function(i,u){
                if(u.user_id) index ++;
                if(u.user_id === userinfo.user_id) joined = true;
            });
            if(o.isStart === '1'){
                var have = false;
                $(o.users).each(function(i,u){
                    if(u.user_id === userinfo.user_id) have = true;
                });
                if(have){
                    appendStr = '<div class="j-list-one"><div class="j-list-title" data-id="'+o.study_log_id+'"><h4>'+o.orgtitle+'</h4><span data-num="'+(index?index:0)+'">('+(index?index:0)+'/'+o.most+')</span><button class="have">已开始</button></div><div class="j-list-body" data-id="'+o.study_log_id+'">';
                }else{
                    appendStr = '<div class="j-list-one"><div class="j-list-title" data-id="'+o.study_log_id+'"><h4>'+o.orgtitle+'</h4><span data-num="'+(index?index:0)+'">('+(index?index:0)+'/'+o.most+')</span><button class="">已开始</button></div><div class="j-list-body" data-id="'+o.study_log_id+'">';
                }
            }else{
                if(index === parseInt(o.most)){
                    appendStr = '<div class="j-list-one"><div class="j-list-title" data-id="'+o.study_log_id+'"><h4>'+o.orgtitle+'</h4><span data-num="'+(index?index:0)+'">('+(index?index:0)+'/'+o.most+')</span><button class="">满员</button></div><div class="j-list-body" data-id="'+o.study_log_id+'">';
                }else{
                    appendStr = '<div class="j-list-one"><div class="j-list-title" data-id="'+o.study_log_id+'"><h4>'+o.orgtitle+'</h4><span data-num="'+(index?index:0)+'">('+(index?index:0)+'/'+o.most+')</span>'+(joined?'':'<button class="active">加入</button>')+'</div><div class="j-list-body" data-id="'+o.study_log_id+'">';
                }
            }
            for(j in o.users){
                appendStr += '<div class="j-list-user" data-id="'+o.users[j].user_id+'" title="'+o.users[j].fullname+'"><img src="'+(o.users[j].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+o.users[j].headpngpath:'/img/default/touxiang.png')+'"/><p>'+o.users[j].fullname+'</p></div>';
            }
        }else{
            appendStr += '<div class="j-list-one"><div class="j-list-title" data-id="'+o.study_log_id+'"><h4>'+o.orgtitle+'</h4><span data-num="0">(0/'+o.most+')</span>'+(joined?'':'<button class="active">加入</button>')+'</div><div class="j-list-body" data-id="'+o.study_log_id+'"></div></div>';
        }
        appendStr += '</div></div>';
        $('.j-list-con').append(appendStr);
    });
    $('.j-page.active').removeClass('active');
    $('.j-page[data-page="'+currentPage+'"]').addClass('active');
};

var init = function(){
    getCourseInfo(function(){
        $('.j-title p').html(course_info.title);
        initInfos();
        initRoom(function(){
            bindEvents();
            $('.j-tab p[data-index="1"]').click();
        });
    });
};

$(function(){
    course_child_id = window.location.hash.split("#")[1];
    init();
});