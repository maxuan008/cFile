var chatInit = false;var personInit = false;var personAll,chatIsOpen = false;
var initChat = function(socket,id,datas){
    if(chatInit) return;
    var onInput = false;

    var newline = function(t){
        var replace_em = function(str){
            str = str.replace(/\</g,'&lt;');
            str = str.replace(/\>/g,'&gt;');
            str = str.replace(/\n/g,'<br/>');
            str = str.replace(/\[em_([0-9]*)\]/g,'<img src="../../../img/face/$1.gif" border="0" />');
            return str;
        };
        var arr = replace_em(t).split(' \n');
        var res = '';
        $(arr).each(function(i,a){
            res += a;
            if((i+1) !== arr.length)
            res += '<br/>';
        });
        return res;

    };

    var bindEvent = function(){
        document.onkeydown = function(e){
            var ev = document.all ? window.event : e;
            if (ev.ctrlKey && ev.keyCode == 13) {
                $('.j-chat-input').val($('.j-chat-input').val()+'\ \n');
                return false;
            }

            if(ev.keyCode===13) {
                if(onInput){
                    socket.emit('talking_sendinfo',{study_log_id:id , txt:$('.j-chat-input').val()});
                }else{
                    return false;
                }
            }

        };

        $('.j-chat-click').click(function(){
            $('.j-chat-communication').show();
            chatIsOpen = true;
            $('.j-chat-click>i').html('0').hide();
            $('.j-chat-room').scrollTop(100000000000000000);
            $('.j-icon.j-chat-emoji').qqFace({assign:'saytext',path:'../../../img/face/'});
        });

        $('.j-chat-input').focus(function(){
            onInput = true;
        }).blur(function(){
            onInput = false;
        });

        $('.j-chat-communication-close').click(function(){
            $('.j-chat-communication').hide();
            chatIsOpen = false;
        });

        $('.j-send-message').click(function(){
            socket.emit('talking_sendinfo',{study_log_id:id , txt:$('.j-chat-input').val()})
        });

        $('.j-chat-room').on('click','.j-message-record',function(){
            var endTime;
            if($('.j-chat-room>.j-time-tag').length){
                endTime = parseInt($('.j-chat-room>.j-time-tag').eq(0).attr('data-time')) - 1000;
            }else{
                endTime = moment().format('YYYY-MM-DD HH:mm:ss').getTime();
            }

            var startTime = new Date(endTime - 86400000).Format('yyyy-MM-dd hh:mm:ss');
            endTime = new Date(endTime).Format('yyyy-MM-dd hh:mm:ss');
            sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/many/getTalkingHistory',{starttime:startTime,endtime:endTime,study_log_id:id},function(data){
                if(data.code === 201){
                    if(data.datas.length){
                        var lastTime = moment().format('YYYY-MM-DD HH:mm:ss').getTime();
                        for(var i=data.datas.length-1;i>=0;i--){
                            if(data.datas[i].user_id === userinfo.user_id){
                                $('.j-message-record').after('<div class="me"><span><img src="'+(data.datas[i].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+data.datas[i].headpngpath:'/img/default/touxiang.png')+'"/><p>'+data.datas[i].fullname+'</p></span><p>'+newline(data.datas[i].txt)+'</p></div>');
                            }else{
                                $('.j-message-record').after('<div class="other"><span><img src="'+(data.datas[i].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+data.datas[i].headpngpath:'/img/default/touxiang.png')+'"/><p>'+data.datas[i].fullname+'</p></span><p>'+newline(data.datas[i].txt)+'</p></div>');
                            }
                            if((lastTime - new Date(data.datas[i].sendTime).getTime()) > 180000 || i === 0){
                                $('.j-message-record').after('<span class="j-time-tag" data-time="'+new Date(data.datas[i].sendTime).getTime()+'">'+new Date(data.datas[i].sendTime).Format("MM-dd hh:mm:ss")+'</span>');
                            }
                            lastTime = new Date(data.datas[i].sendTime).getTime();
                        }
                    }else{
                        $('.j-message-record').addClass('none').html('—已无更多记录—');
                    }
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        /*$('.j-chat-room').bind('mousewheel',function(e){
            var direct = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
            if($('.j-chat-room').scrollTop() === 0){
                if($('.j-chat-room>.j-scroll-top').length){
                    var endTime = parseInt($('.j-chat-room>.j-time-tag').eq(0).attr('data-time'));
                    var startTime = new Date(endTime - 86400000).Format('yyyy-MM-dd hh:mm:ss');
                    endTime = new Date(endTime).Format('yyyy-MM-dd hh:mm:ss');
                    sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/many/getTalkingHistory',{starttime:startTime,endtime:endTime,study_log_id:id},function(data){
                        if(data.code === 201){
                            console.log(data);
                        }else{
                            console.log('getTalkingHistory err!');
                        }
                    });
                }else{
                    $('.j-chat-room').prepend('<span class=".j-scroll-top">向上滚动获取</span>')
                }
            }
        });*/
    };

    socket.emit('talking_join',{study_log_id:id});

    socket.on('join_talking_result',function(data){
        var lastTime = 0;
        $('.j-chat-room').append('<span class="j-message-record">查看更多聊天记录</span>');
        $(data.datas).each(function(i,o){
            if((new Date(o.sendTime).getTime() - lastTime) > 180000){
                $('.j-chat-room').append('<span class="j-time-tag" data-time="'+new Date(o.sendTime).getTime()+'">'+new Date(o.sendTime).Format("hh:mm:ss")+'</span>');
            }
            if(o.user_id === userinfo.user_id){
                $('.j-chat-room').append('<div class="me"><span><img src="'+(personAll[o.user_id].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+personAll[o.user_id].headpngpath:'/img/default/touxiang.png')+'"/><p>'+o.fullname+'</p></span><p>'+newline(o.txt)+'</p></div>');
            }else{
                $('.j-chat-room').append('<div class="other"><span><img src="'+(personAll[o.user_id].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+personAll[o.user_id].headpngpath:'/img/default/touxiang.png')+'"/><p>'+o.fullname+'</p></span><p>'+newline(o.txt)+'</p></div>');
            }
            lastTime = new Date(o.sendTime).getTime();
        });
    }).on('talking_sendinfo_result',function(data){

    }).on('talking_broadcast',function(data){
        if(data.datas.user_id === userinfo.user_id){
            $('.j-chat-input').val('');
            $('.j-chat-room').append('<div class="me"><span><img src="'+(personAll[data.datas.user_id].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+personAll[data.datas.user_id].headpngpath:'/img/default/touxiang.png')+'"/><p>'+data.datas.fullname+'</p></span><p>'+newline(data.datas.txt)+'</p></div>');
        }else{
            if(!chatIsOpen){
                if($('.j-chat-click>i').html() === '0'){
                    $('.j-chat-click>i').show().html('1');
                }else{
                    if(parseInt($('.j-chat-click>i').html()) >= 9) return;
                    $('.j-chat-click>i').html(parseInt($('.j-chat-click>i').html())+1);
                }
            }
            $('.j-chat-room').append('<div class="other"><span><img src="'+(personAll[data.datas.user_id].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+personAll[data.datas.user_id].headpngpath:'/img/default/touxiang.png')+'"/><p>'+data.datas.fullname+'</p></span><p>'+newline(data.datas.txt)+'</p></div>');
        }
        $('.j-chat-room').scrollTop(100000000000000000);
    });
    
    $('body').append('<div class="j-chat-click"><span class="j-icon">&#xe997</span><i>0</i><p>聊天</p></div>'+
        '<div class="j-chat-communication">' +
        '            <div class="j-chat-communication-title">' +
        '                <img src="'+(datas.course_child_info.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+datas.course_child_info.pngpath:'/img/default/course.png')+'"/>' +
        '                <div>' +
        '                    <h4>'+datas.course_child_info.title+'</h4>' +
        '                    <p>'+datas.course_child_info.des+'</p>' +
        '                </div>' +
        '                <ul>' +
        '                    <li class="j-icon j-chat-communication-close">&#xe5cd</li>' +
        '                </ul>' +
        '            </div>' +
        '            <div class="j-chat-communication-left">' +
        '                <div class="j-chat-room">' +
        '                </div>' +
        '                <div class="j-chat-tool">' +
        '                    <ul>' +
        '                        <li class="j-icon j-chat-emoji">&#xea0b</li>' +
        /*'                        <li class="j-icon j-chat-picture">&#xe90d</li>' +
        '                        <li class="j-icon j-chat-file">&#xe934</li>' +*/
        '                    </ul>' +
        '                </div>' +
        '                <textarea class="j-chat-input" type="text" id="saytext"></textarea>' +
        '                <div class="j-chat-send">' +
        '                    <p>提示：Enter发送，Ctrl+Enter换行</p>' +
        '                    <div class="j-send-message">发送</div>' +
        '                </div>' +
        '            </div>' +
        '            <div class="j-chat-communication-right">' +
        '                <div class="j-chat-group-member">' +
        '                    <p>成员</p>' +
        '                    <ul class="j-chat-person-list">' +
        '                    </ul>' +
        '                </div>' +
        '            </div>' +
        '        </div>');

    bindEvent();
    chatInit = true;
};

var addPerson = function(person){
    if(personInit) return;
    personAll = person;
    $('.j-chat-person-list').empty();
    for(var id in person){
        $('.j-chat-person-list').append('<li data-id="'+id+'"><img src="'+(person[id].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+person[id].headpngpath:'/img/default/touxiang.png')+'"/><p>'+person[id].fullname+'</p></li>');
    }
    $(person).each(function(i,u){

    });
};