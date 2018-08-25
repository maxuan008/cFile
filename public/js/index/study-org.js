var study_id,currentTask,viewType,fullBlockHeight,taskMap = {},onlyOffice,docTotal,socket,step_id,step_id2,current_task_id;

var onDownloadAs = function(event){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/downloadOfficeFile_dev?id='+ context.onlineEditData.key +'&url='+ escape(event.data),{id:context.onlineEditData.key,url:escape(event.data)},function(data){
        if(data.code === 201){
            $('.j-edit-pan').empty();
            onlyOfficing = false;
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        }
    });
};

var initSide = function(data,index){//e3a6
    var activities = data.course_child_info.activities;//ea80
    var isSingle = (data.course_child_info.type === '0');//ea7e
    var done = false;//e039
    $('.j-course-tree').empty();
    $('.j-tool-bar').empty();
    var initActivity = function(id,index){
        var activity = activities[id];
        if(done){
            // $('.j-course-tree').append('<p data-id="'+ activity.activity_id+'" class="j-activity-item">'+activity.title+'</p>');
            // $('.j-tool-bar').append('<i data-id="'+ activity.activity_id+'" class="j-icon j-activity-item" title="'+activity.title+'">&#xe3fa</p>');
        }else{
            $('.j-course-tree').append('<p data-id="'+ activity.activity_id+'" class="j-activity-item done">'+ index + ' '+activity.title+'<i class="j-icon"></i></p>');
        }
        for(var i in activity.steps){
            if(activity.steps.hasOwnProperty(i)){
                if(activity.steps[i].is_startstep === '1'){
                    initStep(i,activity.steps,0,index);
                }
            }
        }
        if(!(activity.next_step_id === '-1') && !done){
            initActivity(activity.next_step_id,index + 1);
        }
    };

    var initStep = function(id,steps,index,aIndex){
        var step = steps[id];

        $(step.tasks).each(function(i,t){
            if(t.task_id === data.task_info.task_id) {
                done = true;
            }
        });

        $(step.tasks).each(function(i,t){
            if(done){
                if(t.task_id === data.task_info.task_id){
                    $('.j-course-tree').append('<p data-id="'+ t.task_id+'" class="j-step-item this active">'+aIndex + '-'+ (index+1)+' '+t.title+'<i class="j-icon">&#xe3fa</i></p>');
                }
            }else{
                var have = false;
                $(currentTask.flow).each(function(i,f){
                    if(t.task_id === f.task_id) have = true;
                });
                if(have){
                    $('.j-course-tree').append('<p data-id="'+ t.task_id+'" class="j-step-item done">'+aIndex + '-'+ (index+1)+' '+t.title+'<i class="j-icon">&#xe86c</i></p>');
                }
            }
        });

        if(!(step.next_step_id === '-1')){
            initStep(step.next_step_id,steps,index+1,aIndex);
        }
    };

    for(var a in activities){
        if(activities.hasOwnProperty(a)){
            if(activities[a].is_startstep === '1'){
                initActivity(a,1);
            }
        }
    }
};

var createOffice = function(data,mode,con){
    var officeConfig,documentType,url,key;
    if(data.filetype === 'doc' || data.filetype === 'docx'){
        documentType = 'text';
    }else if(data.filetype === 'xlsx' || data.filetype === 'xls'){
        documentType = 'spreadsheet';
    }else if(data.filetype === 'pptx' || data.filetype === 'ppt'){
        documentType = 'presentation';
    }else if(data.filetype === 'mp4' || data.filetype === 'MP4'){
        con.css({"padding":0,"background":"#222"}).append('<video style="width:100%;height:100%" src="'+(ports.course.domain === location.origin ? ports.course.domain : '')+'/course/develop/downtaskfile?id='+(mode=='read'?data.task_file_id:data.study_file_id)+'&type='+(mode=='read'?'dev':'study')+'" controls="controls"></video>');
        return;
    }else{
        return;
    }
    if(mode === 'cooperation'){
        url=(ports.course.domain?ports.course.domain:window.location.origin) + '/course/develop/downtaskfile?id='+data.study_step_file_id+'&type=step';
        key = data.study_step_file_id;
    }else{
        url=(ports.course.domain?ports.course.domain:window.location.origin) + '/course/develop/downtaskfile?id='+(mode=='read'?data.task_file_id:data.study_file_id)+'&type='+(mode=='read'?'dev':'study');
        key = (mode=='read'?data.task_file_id:data.study_file_id);
    }
    officeConfig = {
        "events" : {
            "onDownloadAs" : function(event){
                sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/downloadOfficeFile_dev?id='+ data.task_file_id +'&url='+ escape(event.data),{id:data.task_file_id ,url:escape(event.data)},function(data){
                    if(data.code === 201){
                        docTotal ++;
                        if(docTotal === window.docEditor.length){
                            window.docEditor = [];
                            socket.emit('learn_finished',{study_log_id:study_id,step_id:currentTask.study_step_info.step_id,study_task_id:currentTask.study_info.info.study_task_id,task_id:currentTask.task_info.task_id,study_step_id:currentTask.study_info.info.study_step_id});
                        }
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
                    }
                });
            }
        },
        "editorConfig" : {
            "user": {
                "id": userinfo.user_id,
                "name": userinfo.fullname?userinfo.fullname:userinfo.account
            }
        },
        "document": {
            "fileType": data.filetype,
            "key": key,
            "title": data.filename + '.'+ data.filetype,//context.officeName + '.' +$('.j-online-edit-pan span.active').attr('data-type'),
            "url" : url
        },
        "documentType" : documentType
    };
    if(mode === 'read'){
        officeConfig.editorConfig.mode = "view";
    }

    onlyOffice = uuid();
    con.css({'padding':0}).append('<div style="height:100%"><div id="'+onlyOffice+'"></div></div>');
    var doc;
    if(window.docEditor.length){
        doc = new DocsAPI.DocEditor(onlyOffice,officeConfig);
        if(mode != 'read'){
            doc.task_file_id = data.task_file_id;
            window.docEditor.push({doc:doc,id:data.task_file_id});
        }
    }else{
        pullInJavascript([ports.onlyOffice.domain+'/web-apps/apps/api/documents/api.js'],function(){
            doc = new DocsAPI.DocEditor(onlyOffice,officeConfig);
            if(mode != 'read'){
                doc.task_file_id = data.task_file_id;
                window.docEditor.push({doc:doc,id:data.task_file_id});
            }
        });
    }
};

var initMain = function(data){
    var des = data.task_info.des;
    var theory = data.task_info.theory;
    var results = data.study_info.results;
    var exam_id = data.study_info.info.myexam_id;
    var step_info = data.study_step_info;
    taskMap.des = data.task_info.des;
    taskMap.theory = data.task_info.theory;
    taskMap.results = data.study_info.results;
    taskMap.exam_id = data.task_info.exam_id;

    var flag = false;
    var showTabTask = function(type,index){
        if(type === 'des'){
            $('.j-task-tab.des>p.active').removeClass('active');
            $('.j-task-tab.des>p[data-index="'+index+'"]').addClass('active');
            $('.j-task-block.des>div.active').removeClass('active');
            $('.j-task-block.des>div[data-index="'+index+'"]').addClass('active');
            if(!taskMap.des[index].inited){
                taskMap.des[index].inited = true;
                if(taskMap.des[index].type === 'text'){
                    $('.j-task-block.des>div.active').css({'padding':'15px','color':'#333','boxSizing':'border-box'}).html(taskMap.des[index].txt);
                }else{
                    createOffice(taskMap.des[index],'read',$('.j-task-block.des>div.active'));
                }
            }
        }else{
            var uuid1,editor;
            $('.j-task-tab.results>p.active').removeClass('active');
            $('.j-task-tab.results>p[data-index="'+index+'"]').addClass('active');
            $('.j-task-block.results>div.active').removeClass('active');
            $('.j-task-block.results>div[data-index="'+index+'"]').addClass('active');
            if(!taskMap.results[index].inited){
                taskMap.results[index].inited = true;
                if(taskMap.results[index].type === 'text'){
                    if(viewType === '2'){
                        $('.j-task-block.results>div.active').css({'padding':'15px','color':'#333','boxSizing':'border-box'}).html(taskMap.results[index].txt?taskMap.results[index].txt:'');
                    }else{
                        uuid1 = uuid();
                        $('.j-task-block.results>div.active').css({'color':'#333','boxSizing':'border-box'}).append('<div class="'+uuid1+'" style="height:'+(fullBlockHeight-46)+'px;box-sizing:border-box;color:#333;"></div>');
                        editor = new wangEditor($('.'+uuid1));
                        editor.onchange = function(){
                            sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/single/updatestudyresult',{study_result_id:taskMap.results[index].study_result_id,txt:editor.$txt.html()},function(data){
                                if(data.code === 201){
                                }else if(data.code === 204){
                                    $.InfoBox('alert','error','错误',data.err.toString());
                                }else{
                                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                                }
                            });
                        };
                        editor.create();
                        editor.$txt.html(taskMap.results[index].txt?taskMap.results[index].txt:'');
                    }
                }else if(taskMap.results[index].type === 'form'){
                    $('.j-task-block.results>div.active').css({'padding':'0px','color':'#333','boxSizing':'border-box'}).append('<iframe style="width: 100%;height: '+(fullBlockHeight-40)+'px;border: 0;padding:0" src="'+(ports.exam.domain == location.host ? ports.exam.domain : '')+'/form-study#'+taskMap.results[index].study_html_id+'"/>');
                }else{
                    if(viewType === '2'){
                        createOffice(taskMap.results[index].file,'read',$('.j-task-block.results>div.active'));
                    }else{
                        createOffice(taskMap.results[index].file,'edit',$('.j-task-block.results>div.active'));
                    }
                }
            }
        }
    };

    $('.j-main>div').css({'background':'#fff'}).empty();

    if(step_info){
        $('.j-main>div[data-type="cooperation"]').empty();
        if(step_info.files.length){
            $('.j-tab-switch>li[data-type="cooperation"]').show().unbind('click').click(function(){
                $('.j-main>div[data-type="cooperation"]').css({'height':fullBlockHeight + 8});
                $(step_info.files).each(function(i,d){
                    createOffice(d,'cooperation',$('.j-main>div[data-type="cooperation"]'));
                });
                $(this).unbind('click');
            });
        }else{
            $('.j-tab-switch>li[data-type="cooperation"]').hide();
        }
    }else{
        $('.j-tab-switch>li[data-type="cooperation"]').hide();
    }

    if(exam_id){
        $('.j-tab-switch>li[data-type="exam"]').show().unbind('click').click(function(){
            $('.j-main>div[data-type="exam"]').empty().append('<iframe style="width: 100%;height: '+(fullBlockHeight)+'px;border: 0;padding:0" src="'+(ports.exam.domain == location.host ? ports.exam.domain : '')+'/exam#'+exam_id+'"/>');
            $(this).unbind('click');
        });
    }else{
        $('.j-tab-switch>li[data-type="exam"]').hide();
    }

    var uuid1,editor;
    if(results){
        $('.j-main>div[data-type="results"]').empty();
        if(results.length){
            if(results.length>1){
                $('.j-main>div[data-type="results"]').css({'height':fullBlockHeight + 8,'padding':0});
                $('.j-tab-switch>li[data-type="results"]').show().unbind('click').click(function(){
                    $('.j-main>div[data-type="results"]').append('<div class="j-task-tab results"><span class="j-icon j-task-prev">&#xe408</span><span class="j-icon j-task-next">&#xe409</span></div><div class="j-task-block results"></div>');
                    $('.j-main>div[data-type="results"]').on('click','.j-task-prev',function(){
                        var lastIndex = parseInt($('.j-task-tab.results>p.active').attr('data-index'));
                        var currentIndex;
                        if(lastIndex === 0){
                            currentIndex = results.length - 1;
                            showTabTask('results',currentIndex);
                        }else{
                            currentIndex = lastIndex - 1;
                            showTabTask('results',currentIndex);
                        }
                    }).on('click','.j-task-next',function(){
                        var lastIndex = parseInt($('.j-task-tab.results>p.active').attr('data-index'));
                        if(lastIndex === (results.length - 1)){
                            currentIndex = 0;
                            showTabTask('results',currentIndex);
                        }else{
                            currentIndex = lastIndex + 1;
                            showTabTask('results',currentIndex);
                        }

                    });
                    $(results).each(function(i,d){
                        if(i === 0){
                            $('.j-task-tab.results').append('<p class="active first" data-index="'+i+'">学习任务'+(i+1)+'<span>（共'+des.length+'个）</span></p>');
                            $('.j-task-block.results').append('<div class="j-task-tab-block active first" data-index="'+i+'" style="height:'+(fullBlockHeight-36)+'px"></div>');

                        }else if(i === (results.length - 1)){
                            $('.j-task-tab.results').append('<p class="last" data-index="'+i+'">学习任务'+(i+1)+'<span>（共'+des.length+'个）</span></p>');
                            $('.j-task-block.results').append('<div class="j-task-tab-block last" data-index="'+i+'" style="height:'+(fullBlockHeight-36)+'px"></div>');
                        }else{
                            $('.j-task-tab.results').append('<p data-index="'+i+'">学习任务'+(i+1)+'<span>（共'+des.length+'个）</span></p>');
                            $('.j-task-block.results').append('<div class="j-task-tab-block" data-index="'+i+'" style="height:'+(fullBlockHeight-36)+'px"></div>');
                        }

                    });
                    $(this).unbind('click');
                    showTabTask('results',0);
                });
            }else{
                $('.j-tab-switch>li[data-type="results"]').show().unbind('click').click(function(){
                    $('.j-main>div[data-type="results"]').css({'height':fullBlockHeight + 8});
                    $(results).each(function(i,d){
                        if(d.type === 'text'){
                            if(viewType === '2'){
                                $('.j-main>div[data-type="results"]').css({'height':fullBlockHeight}).append('<div style="padding:15px;height:'+fullBlockHeight+'px;box-sizing:border-box;color:#333">'+ (d.txt?d.txt:'')+'</div>');
                            }else{
                                uuid1 = uuid();
                                $('.j-main>div[data-type="results"]').append('<div class="'+uuid1+'" style="height:'+(fullBlockHeight - 50)+'px;box-sizing:border-box;color:#333;"></div>');
                                editor = new wangEditor($('.'+uuid1));
                                editor.onchange = function(){
                                    sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/single/updatestudyresult',{study_result_id:d.study_result_id,txt:editor.$txt.html()},function(data){
                                        if(data.code === 201){
                                        }else if(data.code === 204){
                                            $.InfoBox('alert','error','错误',data.err.toString());
                                        }else{
                                            $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                                        }
                                    });
                                };
                                editor.create();
                                editor.$txt.html(d.txt?d.txt:'');
                            }
                        }else if(d.type === 'form'){
                            $('.j-main>div[data-type="results"]').css({'height':fullBlockHeight}).append('<iframe style="width: 100%;height: '+(fullBlockHeight)+'px;border: 0;padding:0" src="'+(ports.exam.domain == location.host ? ports.exam.domain : '')+'/form-study#'+d.study_html_id+'"/>');
                        }else{
                            if(viewType === '2'){
                                createOffice(d.file,'read',$('.j-main>div[data-type="results"]'));
                            }else{
                                createOffice(d.file,'edit',$('.j-main>div[data-type="results"]'));
                            }
                        }
                    });
                    $(this).unbind('click');
                });

            }
        }else{
            $('.j-tab-switch>li[data-type="results"]').hide();
        }
    }else{
        $('.j-tab-switch>li[data-type="results"]').hide();
    }

    if(theory){
        $('.j-main>div[data-type="theory"]').css({'height':fullBlockHeight + 8,'padding':10}).empty();
        if(theory.length){
            $('.j-tab-switch>li[data-type="theory"]').show().unbind('click').click(function(){
                $(theory).each(function(i,t){
                    $('.j-main>div[data-type="theory"]').append('<p class="j-theory-one" data-id="'+ t.task_file_id+'">'+ t.filename+'.'+ t.filetype+'</p>');
                });
                $(this).unbind('click');
            });
        }else{
            $('.j-tab-switch>li[data-type="theory"]').hide();
        }
    }else{
        $('.j-tab-switch>li[data-type="theory"]').hide();
    }

    if(des){
        $('.j-main>div[data-type="des"]').empty();
        if(des.length){
            if(des.length>1){
                $('.j-main>div[data-type="des"]').css({'height':fullBlockHeight + 8,'padding':0});
                $('.j-tab-switch>li[data-type="des"]').show().unbind('click').click(function(){
                    $('.j-main>div[data-type="des"]').append('<div class="j-task-tab des"><span class="j-task-prev"><i class="j-icon">&#xe408</i><p>上一个</p></span><span class="j-task-next"><i class="j-icon">&#xe409</i><p>下一个</p></span></div><div class="j-task-block des"></div>');
                    $('.j-main>div[data-type="des"]').on('click','.j-task-prev',function(){
                        var lastIndex = parseInt($('.j-task-tab.des>p.active').attr('data-index'));
                        var currentIndex;
                        if(lastIndex === 0){
                            currentIndex = des.length - 1;
                            showTabTask('des',currentIndex);
                        }else{
                            currentIndex = lastIndex - 1;
                            showTabTask('des',currentIndex);
                        }
                    }).on('click','.j-task-next',function(){
                        var lastIndex = parseInt($('.j-task-tab.des>p.active').attr('data-index'));
                        var currentIndex;
                        if(lastIndex === (des.length - 1)){
                            currentIndex = 0;
                            showTabTask('des',currentIndex);
                        }else{
                            currentIndex = lastIndex + 1;
                            showTabTask('des',currentIndex);
                        }
                    });
                    $(des).each(function(i,d){
                        if(i === 0){
                            $('.j-task-tab.des').append('<p class="active first" data-index="'+i+'">任务介绍'+(i+1)+'<span>（共'+des.length+'个）</span></p>');
                            $('.j-task-block.des').append('<div class="j-task-tab-block active first" data-index="'+i+'" style="height:'+(fullBlockHeight-36)+'px"></div>');
                        }else if(i === (des.length - 1)){
                            $('.j-task-tab.des').append('<p class="last" data-index="'+i+'">任务介绍'+(i+1)+'<span>（共'+des.length+'个）</span></p>');
                            $('.j-task-block.des').append('<div class="j-task-tab-block last" data-index="'+i+'" style="height:'+(fullBlockHeight-36)+'px"></div>');
                        }else{
                            $('.j-task-tab.des').append('<p data-index="'+i+'">任务介绍'+(i+1)+'<span>（共'+des.length+'个）</span></p>');
                            $('.j-task-block.des').append('<div class="j-task-tab-block" data-index="'+i+'" style="height:'+(fullBlockHeight-36)+'px"></div>');
                        }

                    });
                    $(this).unbind('click');
                });

            }else{
                $('.j-tab-switch>li[data-type="des"]').show().unbind('click').click(function(){
                    $('.j-main>div[data-type="des"]').css({'height':fullBlockHeight + 8});
                    $(des).each(function(i,d){
                        if(d.type === 'text'){
                            $('.j-main>div[data-type="des"]').css({'height':fullBlockHeight}).append('<div style="height:'+fullBlockHeight+'px;box-sizing:border-box;color:#333;padding:15px;">'+ (d.txt?d.txt:'')+'</div>');
                        }else{
                            createOffice(d,'read',$('.j-main>div[data-type="des"]'));
                        }
                    });
                    $(this).unbind('click');
                });

            }
            /*$('.j-main').append('<h4>任务介绍</h4>');
             $(des).each(function(i,d){
             if(d.type == 'text'){
             $('.j-main').append('<div>'+ d.txt+'</div>');
             }else{
             createOffice(d,'read');
             }
             });*/
            flag = false;
        }else{
            $('.j-tab-switch>li[data-type="des"]').hide();
        }
    }else{
        $('.j-tab-switch>li[data-type="des"]').hide();
    }

    if(des?des.length:des){
        $('.j-tab-switch>li[data-type="des"]').click();
        showTabTask('des',0);
        return false;
    }
    if(theory && theory.length){
        $('.j-tab-switch>li[data-type="theory"]').click();
        return false;
    }

    if(results?results.length:results){
        $('.j-tab-switch>li[data-type="results"]').click();
        return false;
    }

    if(exam_id){
        $('.j-tab-switch>li[data-type="exam"]').click();
        return false;
    }

    if(step_info){
        if(step_info.files.length){
            $('.j-tab-switch>li[data-type="exam"]').click();
            return false;
        }
    }
};

var bindEvents = function(){
    $('.j-main').on('click','.j-theory-one',function(){
        var task_file_id = $(this).attr('data-id');
        var fileName = $(this).html().split('.')[0];
        var fileType = $(this).html().split('.')[1];

        $(".j-edit-block").show();
        $('.j-edit-pan').empty().append('<div style="height:'+ (window.innerHeight-150) +'px"></div>');

        createOffice({
            task_file_id : task_file_id,
            filename : fileName,
            filetype : fileType
        },'read',$('.j-edit-pan>div'));
    });

    $(".j-edit-block").on('click','.j-edit-title>span',function(){
        $('.j-edit-pan').empty();
        $(".j-edit-block").hide();
    });

    $('.j-course-tree').on('click','.j-step-item',function(){
        if(!$(this).hasClass('done') && !$(this).hasClass('active') || $(this).hasClass('this')) return false;
        var task_id = $(this).attr('data-id');
        $('.this').removeClass('this');
        $('i.j-step-item[data-id="'+task_id+'"]').addClass('this');
        $(this).addClass('this');
        if($(this).hasClass('active')){
            sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/many/getlearning_many',{study_log_id:study_id},function(data) {
                if (data.code === 201) {
                    if (data.datas.is_over === '1') {
                        $.InfoBox('alert', 'info', '完成学习', '课程已学完,点击确定返回首页！', function () {
                            window.location = '/control';
                        });
                        //window.location = '/';
                        return;
                    }
                    if (data.datas.flag === '2') {
                        currentTask = data.datas.info;
                        viewType = '1';
                        window.docEditor = [];
                        initMain(currentTask);
                        $('.j-role-choose').hide();
                        $('.j-role-back').hide();
                    } else {
                        step_id = data.datas.step_id;
                        socket.emit('getroles', {study_log_id: study_id, step_id: step_id});
                    }
                } else if (data.code === 204) {
                    $.InfoBox('alert', 'error', '错误', data.err.toString());
                } else {
                    $.InfoBox('alert', 'error', '用户信息错误', '请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
                }
            });
        }else{
            sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/many/gettaskhistory',{study_log_id:study_id,task_id:task_id},function(data){
                if(data.code === 201){
                    lastTask = data.datas;
                    viewType = '2';
                    initMain(lastTask);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    });

    $('.j-msg-box>span').on('click',function(){
        var open = $(this).attr('data-open');
        if(open === '1'){
            $(this).html('详情').attr('data-open','0');
            $('.j-msg-box>.body').slideUp(150);
        }else{
            $(this).html('收起').attr('data-open','1');
            $('.j-msg-box>.body').slideDown(150);
        }
    });

    $('.j-side-switch').click(function(){
        var open = $(this).attr('data-open');
        if(open === '1'){
            $('.j-side-bar').animate({'left':'-180px'},200);
            $('.j-main').animate({'paddingLeft':'70px'},200);
            $('.j-course-operation').animate({'paddingLeft':'70px'},200);
            $(this).html('&#xe315');
            $(this).attr('data-open','0');
        }else{
            $('.j-side-bar').animate({'left':'0'},200);
            $('.j-main').animate({'paddingLeft':'250px'},200);
            $('.j-course-operation').animate({'paddingLeft':'250px'},200);
            $(this).html('&#xe314');
            $(this).attr('data-open','1');
        }
    });

    $('.j-course-operation').on('click','span',function(){
        docTotal = 0;
        if(window.docEditor.length){
            $(window.docEditor).each(function(i,d){
                d.doc.downloadAs();
            });
        }else{
            socket.emit('learn_finished',{study_log_id:study_id,step_id:currentTask.study_step_info.step_id,study_task_id:currentTask.study_info.info.study_task_id,task_id:currentTask.task_info.task_id,study_step_id:currentTask.study_info.info.study_step_id});
        }
    });

    $('.j-tab-switch').on('click','li',function(){
        $('.j-tab-switch>li.active').removeClass('active');
        var type = $(this).addClass('active').attr('data-type');
        $('.j-main>div').hide();
        $('.j-main>div[data-type="'+type+'"]').show();
    });

    $('.j-role-choose').on('click','.j-role-con',function(){
        if($(this).hasClass('chosen')) return false;
        var task_id = $(this).attr('data-id');
        socket.emit('choose_role',{study_log_id:study_id,step_id:step_id,task_id:task_id});
    }).on('click','.j-role-user-one>span',function(){
        var task_id = $(this).parents('.j-role-con').attr('data-id');
        socket.emit('cancel_role',{study_log_id:study_id,step_id:step_id,task_id:task_id});
        return false;
    })
};

var initSocket = function(){
    socket = io.connect(ports.socket.domain?ports.socket.domain:location.origin);

    socket.on('getroles_result',function(data){
        if(data.code === 201){
            var roleLength = 0;
            $('.j-role-choose').empty().append('<h4>请选择角色</h4><p>角色</p><span>用户</span>');
            for(var r in data.datas.roles){
                roleLength++;
                $('.j-role-choose').append('<div class="j-role-con" data-id="'+ r +'"><p>'+ data.datas.roles[r].rolename +'</p><span></span></div>');
            }
            for(var u in data.datas.users){
                if(!data.datas.users[u]){

                }else{
                    if(data.datas.users[u].socketid){
                        if(data.datas.users[u].task_id){
                            $('.j-role-con[data-id="'+data.datas.users[u].task_id+'"]>span').append('<div class="j-role-user-one" data-id="'+u+'"><img src="'+(data.datas.users[u].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+data.datas.users[u].headpngpath:'/img/default/touxiang.png')+'"/><p>'+(data.datas.users[u].fullname?data.datas.users[u].fullname:data.datas.users[u].account)+'</p></div>')
                            if(u === userinfo.user_id){
                                $('.j-role-user-one[data-id="'+u+'"]').append('<span>取消</span>');
                            }
                        }else{

                        }
                    }else{

                    }
                }
            }
            $('.j-role-choose').show();
            $('.j-role-back').show();
            $('.j-msg-box').hide();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        }
    }).on('choose_role_result',function(data){
        if(data.code !== 201){
            $.InfoBox('alert','error','错误',data.err);
        }
    }).on('roles_broadcast',function(data){
        $('.j-role-choose').empty().append('<h4>请选择角色</h4><p>角色</p><span>用户</span>');
        var roleLength = 0;
        for(var r in data.datas.roles){
            $('.j-role-choose').append('<div class="j-role-con" data-id="'+ r +'"><p>'+ data.datas.roles[r].rolename +'</p><span></span></div>');
            roleLength++;
        }
        for(var u in data.datas.users){
            if(!data.datas.users[u]){

            }else{
                if(data.datas.users[u].socketid){
                    if(data.datas.users[u].task_id){
                        $('.j-role-con[data-id="'+data.datas.users[u].task_id+'"]>span').append('<div class="j-role-user-one" data-id="'+u+'"><img src="'+(data.datas.users[u].headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+data.datas.users[u].headpngpath:'/img/default/touxiang.png')+'"/><p>'+data.datas.users[u].fullname+'</p></div>')
                        if(u === userinfo.user_id){
                            $('.j-role-user-one[data-id="'+u+'"]').append('<span>取消</span>');
                        }
                    }else{

                    }
                }else{

                }
            }
        }
        $('.j-role-choose').show();
        $('.j-role-back').show();
    }).on('roles_over',function(data){
        if(data.code === 201){
            getlearning_many();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        }
    }).on('cancel_role_result',function(data){
        if(data.code !== 201){
            $.InfoBox('alert','error','错误',data.err);
        }
    }).on('learn_finished_result',function(data){
        if(data.code !== 201){
            $.InfoBox('alert','error','错误',data.err);
        }
    }).on('learn_broadcast',function(data){
        addPerson(data.users);
        var done = true,total = 0,unfinish = 0;
        $('.j-msg-box>.body').empty();
        for(var u in data.users){
            total++;
            if(data.users[u].status === '0'){
                done = false;
                unfinish ++;
                $('.j-msg-box>.body').append('<p>'+data.users[u].fullname+'</p><span>学习中</span>');
            }else{
                $('.j-msg-box>.body').append('<p>'+data.users[u].fullname+'</p><span>已学完</span>');
            }
        }
        if(done){
            $('.j-msg-box').hide();
            $.InfoBox('alert','info','任务完成','点击进入下一步！',function(){
                getlearning_many();
            },function(){
                getlearning_many();
            });

        }else{
            $('.j-msg-box').show();
            $('.j-msg-box>.title').empty().append('<p>还有'+unfinish+'个同学正在学习，请稍后~</p>');
        }
    }).on('next_broadcast',function(data){
        if(data.code === 201){
            if(data.datas.is_over === '1'){
                $.InfoBox('alert','info','完成学习','课程已学完,点击确定返回首页！',function(){
                    window.location = '/control';
                });
                //window.location = '/';
                return;
            }
            if(data.datas.flag === '2'){
                getlearning_many();
            }else{
                step_id = data1.datas.step_id;
                socket.emit('getroles',{study_log_id:study_id,step_id:step_id});
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        }
    });


};

var init = function(){

};

$(function(){
    study_id = window.location.hash.split("#")[1];
    fullBlockHeight = window.innerHeight - 160;
    bindEvents();
    window.docEditor = [];
    initSocket();
    getlearning_many(function(currentTask){
        initChat(socket,study_id,currentTask);
    });

});

var getlearning_many = function(next){
    sendMessage('post',(ports.study.domain === location.origin ? ports.study.domain : ''),'/study/many/getlearning_many',{study_log_id:study_id},function(data){
        if(data.code === 201){
            if(data.datas.is_over === '1'){
                $.InfoBox('alert','info','完成学习','课程已学完,点击确定返回首页！',function(){
                    window.location = '/control';
                });
                //window.location = '/';
                return;
            }
            if(data.datas.flag === '2'){/*
                console.log('任务ID：'+data.datas.info.task_info.task_id)*/
                if(step_id2 === data.datas.step_id){
                    return;
                }else{
                    step_id2 = step_id = data.datas.step_id;
                    socket.emit('learn_join',{study_log_id:study_id,step_id:step_id});
                    currentTask = data.datas.info;
                    viewType = '1';
                    $('.j-course-operation>div>div').html('<h4>'+currentTask.course_child_info.title + '</h4><i class="j-icon"> &#xe315</i><p>'+currentTask.task_info.title+'</p>');
                    window.docEditor = [];
                    initSide(currentTask);
                    initMain(currentTask);
                    $('.j-role-choose').hide();
                    $('.j-role-back').hide();
                    $('.j-msg-box').show();
                    if(next) next(currentTask);
                }
            }else{
                step_id = data.datas.step_id;
                socket.emit('getroles',{study_log_id:study_id,step_id:step_id});
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        }
    });
};