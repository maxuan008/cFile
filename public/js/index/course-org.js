var courses,org,sendData = {number:1};

(function(container){
    container.empty().append('<div class="j-org"><p>要组织的课程</p><div style="z-index: 2"><p>-请选择-</p><i class="j-icon">&#xe313</i><span class="j-org-select" data-name="course">1234</span></div></div><div class="j-org"><p>这次组织的名称</p><input data-name="orgtitle" type="text"/></div><div class="j-org"><p>选择组织机构</p><div style="z-index: 1"><p>-请选择-</p><i class="j-icon">&#xe313</i><span class="j-org-select" data-name="org">1234</span></div></div><div class="j-org"><p>人数设置</p><input data-name="least" type="number"/><span>~</span><input data-name="most" type="number"/></div><div class="j-org"><p>组织数量</p><input data-name="number" type="number"/></div><button class="j-org-submit">确认</button>');
    $('input[data-name="number"]').val(1);
    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getmycourses',{},function(data){
        if(data.code === 201){
            courses = data.datas;
            sendMessage('get',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/org/getdepttree',{},function(data2){
                if(data2.code === 201){
                    org = data2.datas;
                    initPage();
                    bindEvents();
                }else if(data2.code === 204){
                    $.InfoBox('alert','error','错误',data2.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });

    var initPage = function(){
        var height = window.innerHeight - 80;
        var have;
        container.css({'minHeight':height});
        $('.j-org-select').empty();
        $(courses).each(function(i,c){
            have = false;
            $('.j-org-select[data-name="course"]').append('<p data-index="0" data-id="'+ c.course_id +'">'+ c.coursename +'</p>');
            $(c.childs).each(function(j,p){
                if(p.iscompleted === '1' && p.type === '1'){
                    have = true;
                    $('p[data-id="'+ c.course_id +'"').after('<p data-index="1" data-id="'+ p.course_child_id +'">'+ p.title +'</p>')
                }
            });
            if(!have){
                $('p[data-id="'+ c.course_id +'"').remove();
            }
        });
        if($('.j-org-select[data-name="course"] p').length === 0) $('.j-org-select[data-name="course"]').append('暂时没有已经发布过的多人课程');

        var minLevel = 111;
        have = false;
        $(org).each(function(i,o){
            if(o.level < minLevel) minLevel = o.level;
        });

        var initTree = function(index){
            var done = false;
            $(org).each(function(i,o){
                if(o.level === (minLevel+index) && index === 0){
                    $('.j-org-select[data-name="org"]').append('<p data-index="'+ index +'" data-id="'+ o.dept_id +'">'+ o.name +'</p>');
                    done = true;
                    have = true;
                }else if(o.level === (minLevel+index)){
                    $('p[data-id="'+ o.father_id +'"').after('<p data-index="'+ index +'" data-id="'+ o.dept_id +'">'+ o.name +'</p>');
                    done = true;
                }
            });
            if(done) initTree(index+1);
        };
        initTree(0);
        if(!have){
            $('.j-org-select[data-name="org"]').append('还没有加入组织');
        }
    };

    var bindEvents = function(){
        $('.j-org').on('input','input',function(){
            var name = $(this).attr('data-name');
            var val = $(this).val();
            sendData[name] = val;
        });

        $('.j-org-select').on('click','p',function(){
            var name = $(this).parent().attr('data-name');
            var index = $(this).attr('data-index');
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');
            if(name === 'course'){
                if(index === '0') return false;
                sendData.course_child_id = $(this).attr('data-id');
            }else if(name === 'org'){
                sendData.deptid = $(this).attr('data-id');
            }
            $(this).parent().parent().children('p').html($(this).html());
        });

        $('.j-org-submit').on('click',function(){
            var number = parseInt(sendData.number);
            var orgtitle = sendData.orgtitle;
            if(!sendData.course_child_id || !sendData.deptid || !sendData.orgtitle || !sendData.least || !sendData.most){
                $.InfoBox('alert','error','表单不完整','表单没有填写完整！');
                return false;
            }
            sendData.least = parseInt(sendData.least);
            sendData.most = parseInt(sendData.most);
            if(sendData.least > sendData.most){
                $.InfoBox('alert','error','表单填写有误','最小人数不能超过最大人数！');
            }
            if(number <= 0){
                $.InfoBox('alert','error','表单填写有误','数量不能小于1！');
            }else if(number === 1){
                sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/many/orgcourse_many',sendData,function(data){
                    if(data.code === 201){
                        $.InfoBox('alert','success','完成','组织课程成功！');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }else{
                var index = 0;
                for(var i=0;i<number;i++){
                    sendData.orgtitle = orgtitle+(i+1);
                    sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/many/orgcourse_many',sendData,function(data){
                        if(data.code === 201){
                            index++;
                            if(index === number){
                                $.InfoBox('alert','success','完成','组织课程成功！');
                            }
                        }else if(data.code === 204){
                            $.InfoBox('alert','error','错误',data.err.toString());
                        }else{
                            $.InfoBox('alert','error','用户信息错误','请重新登录！');
                            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                        }
                    });
                }
            }
        });
    }
})($('.j-main-content'));