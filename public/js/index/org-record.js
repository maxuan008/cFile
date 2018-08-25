var courses,org,sendData = {},userArray,recordArray  = [],currentPage = 0,course_child_data,courseMap,selected_user;

(function(container){
    container.empty().append('<div class="j-record-c"><div class="j-record"><p>课程</p><div style="z-index: 2"><p>-请选择-</p><i class="j-icon">&#xe313</i><span class="j-org-select" data-name="course">1234</span></div></div><div class="j-record"><p>组织机构</p><div style="z-index: 1"><p>-请选择-</p><i class="j-icon">&#xe313</i><span class="j-org-select" data-name="org">1234</span></div></div><button>搜索</button></div><div class="j-record-header"><span >组织名</span><span>用户</span><span>学习状态</span><span>最后学习时间</span><span>操作</span></div><div class="j-record-body"></div><div class="j-record-footer"><div></div></div>');

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
        $('.j-org-select').append('<p data-index="0">-请选择-</p>');
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

        $('body').on('click','.j-edit-title>span',function(){
            $('.j-edit-block').remove();
            $('.j-nav-back').remove();
        }).on('click','.j-nav-back',function(){
            $('.j-edit-block').remove();
            $('.j-nav-back').remove();
        });

        $('.j-record-detail').click();

        $('.j-record-body').on('click','button.show-detail',function(){
            var open = $(this).attr('data-open');
            if(open === '0'){
                $(this).parent().parent().parent().find('.j-record-list').removeClass('active');
                $(this).parent().parent().parent().find('.j-record-list').find('.j-record-detail').hide();
                $(this).parent().parent().parent().find('.j-record-list').find('.show-detail').html('详情').attr('data-open','0');
                $(this).parent().parent().addClass('active');
                $(this).parent().parent().children('div.j-record-detail').show();
                $(this).html('收起').attr('data-open','1');
            }else{
                $(this).parent().parent().children('div.j-record-detail').hide();
                $(this).parent().parent().removeClass('active');
                $(this).html('详情').attr('data-open','0');
            }
            return false;
        }).on('mouseover','.j-task-ele',function(){
            var me = this;
            var init = $(this).children('div').attr('data-init');
            if(init === '0'){
                var study_log_id = $(this).parents('.j-record-list').attr('data-id');
                var step_id = $(this).parent().attr('data-id');
                $(me).children('div').attr('data-init','1');
                sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/many/gettaskhistory_v2',{study_log_id:study_log_id,step_id:step_id,user_id:selected_user},function(data){
                    if(data.code === 201){
                        var exam_id = data.datas.study_info.info.myexam_id;
                        var results = data.datas.study_info.results;
                        var click_p;
                        $(me).children('div').append('<h4>'+data.datas.task_info.title+'</h4>');
                        if(results?results.length:false){
                            $(results).each(function(i,r){
                                if(r.type === 'text'){
                                    click_p = document.createElement('p');click_p.innerHTML = click_p.title = '富文本文件';
                                    click_p.onclick = function(){
                                        $('body').append('<div class="j-nav-back"></div><div class="j-edit-block"><div class="j-edit-title"><p>富文本文件</p><span class="j-icon">&#xe5cd</span></div><div class="j-edit-pan" style="padding: 15px">'+(r.txt?r.txt:'')+'</div></div>');
                                        $('.j-nav-back').show();
                                        $('.j-edit-block').show().css({height:window.innerHeight - 100});
                                        return false;
                                    };
                                    $(me).children('div').append(click_p);
                                }else{
                                    click_p = document.createElement('p');click_p.innerHTML = click_p.title = r.file.filename + '.' + r.file.filetype;
                                    click_p.onclick = function(){
                                        var id = uuid();
                                        $('body').append('<div class="j-nav-back"></div><div class="j-edit-block"><div class="j-edit-title"><p>'+(r.file.filename + '.' + r.file.filetype)+'</p><span class="j-icon">&#xe5cd</span></div><div class="j-edit-pan"></div></div>');
                                        $('.j-nav-back').show();
                                        $('.j-edit-block').show().css({height:window.innerHeight - 100});
                                        $('.j-edit-pan').css({height:window.innerHeight - 140});
                                        $('.j-edit-pan').append('<div id="'+id+'"></div>');
                                        var officeConfig,documentType;
                                        if(r.file.filetype === 'doc' || r.file.filetype === 'docx'){
                                            documentType = 'text';
                                        }else if(r.file.filetype === 'xlsx' || r.file.filetype === 'xls'){
                                            documentType = 'spreadsheet';
                                        }else if(r.file.filetype === 'pptx' || r.file.filetype === 'ppt'){
                                            documentType = 'presentation';
                                        }else{
                                            return;
                                        }
                                        officeConfig = {
                                            "document": {
                                                "fileType": r.file.filetype,
                                                "key": r.file.task_file_id,
                                                "title": r.file.filename + '.'+ r.file.filetype,//context.officeName + '.' +$('.j-online-edit-pan span.active').attr('data-type'),
                                                "url":(ports.course.domain?ports.course.domain:window.location.origin) + '/course/develop/downtaskfile?id='+r.file.study_file_id+'&type=study'
                                            },
                                            "documentType" : documentType,
                                            "editorConfig" : {mode:'view'}
                                        };
                                        var doc;
                                        if(window.docEditor?window.docEditor.length:false){
                                            doc = new DocsAPI.DocEditor(id,officeConfig);
                                        }else{
                                            pullInJavascript([ports.onlyOffice.domain+'/web-apps/apps/api/documents/api.js'],function(){
                                                doc = new DocsAPI.DocEditor(id,officeConfig);
                                                window.docEditor = [1];
                                            });
                                        }
                                        return false;
                                    };
                                    $(me).children('div').append(click_p);
                                }
                            });
                        }

                        if(exam_id){
                            click_p = document.createElement('p');click_p.innerHTML = click_p.title = '试题';
                            click_p.onclick = function(){
                                $('body').append('<div class="j-nav-back"></div><div class="j-edit-block"><div class="j-edit-title"><p>试题</p><span class="j-icon">&#xe5cd</span></div><div class="j-edit-pan"></div></div>');
                                $('.j-nav-back').show();
                                $('.j-edit-block').show().css({height:window.innerHeight - 100});
                                $('.j-edit-pan').css({height:window.innerHeight - 140});
                                $('.j-edit-pan').append('<iframe style="width: 100%;height: '+(window.innerHeight - 140)+'px;border: 0;padding:0" src="'+(ports.exam.domain == location.host ? ports.exam.domain : '')+'/exam#'+exam_id+'"/>');
                                return false;
                            };
                            $(me).children('div').append(click_p);
                        }
                        $(me).attr('data-init','1');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
            return false;
        }).on('click','.j-record-list',function(){
            var open = $(this).find('button.show-detail').attr('data-open');
            if(open === '0'){
                $(this).parent().find('.j-record-list').removeClass('active');
                $(this).parent().find('.j-record-list').find('.j-record-detail').hide();
                $(this).parent().find('.j-record-list').find('.show-detail').html('详情').attr('data-open','0');
                $(this).addClass('active');
                $(this).find('.j-record-detail').show();
                $(this).find('button.show-detail').html('收起').attr('data-open','1');
            }else{
                $(this).find('.j-record-detail').hide();
                $(this).removeClass('active');
                $(this).find('button.show-detail').html('详情').attr('data-open','0');
            }
            return false;
        }).on('click','.j-record-detail',function(){
            return false;
        }).on('click','.j-user-select>div>p',function(){
            selected_user = $(this).attr('data-id');
            $(this).parent().find('p').removeClass('active');
            $(this).addClass('active');
            $(this).parent().parent().children('p').html($(this).html());
            $('.j-task-ele').children('div').attr('data-init','0');
        }).on('click','.j-task-ele',function(){
            return false;
        }).on('click','.j-course-map',function(){
            return false;
        });

        $('.j-record-footer').on('click','p',function(){
            recordChangePage($(this).attr('data-name'));
        });

        $('.j-org-select').on('click','p',function(){
            var name = $(this).parent().attr('data-name');
            var index = $(this).attr('data-index');
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');
            if(name === 'course'){
                if(index === '0'){
                    if(!$(this).attr('data-id')){
                        sendData.course_child_id = undefined;
                        $(this).parent().parent().children('p').html($(this).html());
                    }
                    return false;
                }
                sendData.course_child_id = $(this).attr('data-id');
                sendData.coursename = $(this).html();
            }else if(name === 'org'){
                sendData.deptid = $(this).attr('data-id');
            }
            $(this).parent().parent().children('p').html($(this).html());
        });

        $('.j-record-c').on('click','button',function(){
            var course_child_id = sendData.course_child_id;
            var dept_id = sendData.deptid;

            if(!dept_id){
                $.InfoBox('alert','error','搜索条件不全','请选择一个组织机构！');
                return false;
            }

            if(!course_child_id){
                $.InfoBox('alert','error','搜索条件不全','请选择一个课程！');
                return false;
            }

            sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/search/getdeptusershistory',sendData,function(data){
                if(data.code === 201){
                    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getcourse_child',sendData,function(data1){
                        if(data1.code === 201){
                            userArray = data.datas;
                            createCourseMap(data1.datas);
                            initPageSearch();
                        }else if(data1.code === 204){
                            $.InfoBox('alert','error','错误',data1.err.toString());
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
        });
    };

    var recordChangePage = function(index){
        if(index === 'prev'){
            if(currentPage<=0) return false;
            recordChangePage(currentPage-1);
        }else if(index === 'next'){
            if(currentPage>=(recordArray.length-1)) return false;
            recordChangePage(currentPage+1);
        }else{
            index = parseInt(index);
            currentPage = index;
            $('.j-record-body').empty();
            var userSelect,userSelectP,userSelectI,userSelectDiv,userOne;
            $(recordArray[index]).each(function(i,r){
                userSelect = document.createElement('div');userSelect.className = 'j-user-select';
                userSelectP = document.createElement('p');userSelect.appendChild(userSelectP);
                userSelectI = document.createElement('i');userSelectI.className = 'j-icon';userSelectI.innerHTML = '&#xe313';userSelect.appendChild(userSelectI);
                userSelectDiv = document.createElement('div');userSelect.appendChild(userSelectDiv);
                $('.j-record-body').append('<div data-id="'+r.teams[0].study_log_id+'" class="j-record-list"><span>'+r.teaminfo.orgtitle+'</span><div class="users" data-id="'+r.teams[0].study_log_id+'"></div><span>'+(r.teaminfo.over_time?'已学完':'学习中')+'</span><span class="time">'+(r.teaminfo.over_time?new Date(r.teaminfo.over_time).Format('yyyy-MM-dd hh:mm:ss'):'-')+'</span><span><button class="show-detail" data-open="0">详情</button><button class="comment">评价</button></span><div class="j-record-detail" data-id="'+r.teams[0].study_log_id+'"></div></div>');
                //$('div[data-id="'+r.teams[0].study_log_id+'"]').css({'height':40*r.teams.length});
                $('div[data-id="'+r.teams[0].study_log_id+'"]>span').css({'height':40*r.teams.length,'lineHeight':40*r.teams.length+'px'});

                $(r.teams).each(function(j,t){
                    if(j === 0){
                        selected_user = t.user_id;
                        userSelectP.innerHTML = t.fullname?t.fullname:t.account;
                        userOne = document.createElement('p');userOne.innerHTML = t.fullname?t.fullname:t.account;userOne.className = 'active';$(userOne).attr('data-id',t.user_id);
                    }else{
                        userOne = document.createElement('p');userOne.innerHTML = t.fullname?t.fullname:t.account;$(userOne).attr('data-id',t.user_id);
                    }
                    userSelectDiv.appendChild(userOne);
                    $('div.users[data-id="'+t.study_log_id+'"]').append('<span>'+(t.fullname?t.fullname:t.account)+'</span>')
                });
                $('.j-record-detail').append(userSelect);
            });
            $('.j-record-detail').append(courseMap);
            $('.j-record-footer>div>p').removeClass('active');
            $('.j-record-footer>div>p[data-name="'+currentPage+'"]').addClass('active');
        }
    };

    var initPageSearch = function(){
        var recordSetPage = function(){
            $(userArray.teams).each(function(i,r){
                var page,index;
                page = Math.floor(i/5);
                index = i%5;
                if(index === 0){
                    recordArray[page] = [];
                }
                recordArray[page][index] = r;
            });
            $('.j-record-footer>div').empty();
            $('.j-record-footer>div').append('<p data-name="prev">上一页</p>');
            $(recordArray).each(function(i,r){
                $('.j-record-footer>div').append('<p data-name="'+i+'">'+(i+1)+'</p>');
            });
            $('.j-record-footer>div').append('<p data-name="next">下一页</p>');
        };

        if(!userArray.teams.length){
            $('.j-record-body').empty().append('<p>未搜索到学习记录</p>');
            $('.j-record-footer>div').empty();
        }
        else{
            recordSetPage();
            recordChangePage(0);
        }
    };

    var createCourseMap = function(courseData){
        var addActivity = function(activity,index,total){
            var addStep = function(step,index,total,con){

                var stepCon = document.createElement('div');$(stepCon).attr('data-id',step.step_id);stepCon.className = 'j-step-ele';
                var title = document.createElement('p');title.innerHTML = '步骤'+(index+1);$(stepCon).append(title);

                var task_con,div;
                $(step.tasks).each(function(i,task){
                    task_con = document.createElement('span');$(task_con).attr('data-id',task.task_id);task_con.className = 'j-icon j-task-ele';task_con.innerHTML = '&#xe5ca';
                    div = document.createElement('div');$(div).attr('data-id',task.task_id).attr('data-init','0');div.className = 'j-record-task-detail';$(task_con).append(div);
                    $(stepCon).append(task_con);
                });
                $(con).append(stepCon);
                if(index < (total-1)){
                    var director = document.createElement('i');director.className = 'j-icon j-map-director org';director.innerHTML = '&#xea66';
                    $(con).append(director);
                    addStep(activity.steps[step.next_step_id],index+1,total,con);
                }

            };

            var first_step_id,step_total = 0;
            var con = document.createElement('div');$(con).attr('data-id',activity.activity_id);
            var title = document.createElement('p');title.innerHTML = activity.title;$(con).append(title);
            for(var s in activity.steps){
                if(activity.steps[s].is_startstep === '1'){
                    first_step_id = s;
                }
                step_total ++;
            }
            addStep(activity.steps[first_step_id],0,step_total,con);
            $(courseMap).append(con);
            if(index < (total-1)){
                var director = document.createElement('span');director.className = 'j-icon j-map-director';director.innerHTML = '&#xea68';
                $(courseMap).append(director);
                addActivity(courseData.activities[activity.next_step_id],index+1,total);
            }
        };

        courseMap = document.createElement('div');courseMap.className = 'j-course-map';
        var activity_total = 0,first_activity_id;
        for(var a in courseData.activities){
            if(courseData.activities[a].is_startstep === '1'){
                first_activity_id = a;
            }
            activity_total ++;
        }
        addActivity(courseData.activities[first_activity_id],0,activity_total);
    };

})($('.j-main-content'));