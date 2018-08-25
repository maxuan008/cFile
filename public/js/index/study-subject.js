var  course_id,courseData,open = true,lastTool = 'nemu',currentItem,studyData;

var courseArray = [
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

var areaArray = [
    {key:'des',name:'课程描述',icon:'e30d'},
    {key:'teacher_introduction',name:'教师介绍',icon:'e7fd'},
    {key:'workflow',name:'工作过程',icon:'e335'},
    {key:'target',name:'工作目标',icon:'e838'},
    {key:'tool',name:'工具',icon:'e869'},
    {key:'for_use_people',name:'适用人群',icon:'e8d3'},
    {key:'content',name:'课程内容',icon:'e02f'},
    {key:'jobreq',name:'工作需求',icon:'e153'},
    {key:'pqs',name:'职业资格标准',icon:'e8e7'},
    {key:'method',name:'工作方法与组织方式',icon:'e6dd'}
];

var listOneClick = function(){
    if($(this).hasClass('active')) return false;
    var me = this;
    $('.j-tab-list-one').removeClass('active');
    $('.j-course-name').removeClass('active');
    $(me).addClass('active');
    var level = $(me).attr('data-level');
    var course_data;
    if(level === '0'){
        var course_id = $(me).attr('data-id');
        var inited = $(me).next('div').attr('data-init');
        var index = parseInt($(me).attr('data-index'));
        if($(me).hasClass('open')){
            $(me).next('div').hide();
            $(me).removeClass('open');
            $(me).find('i').html('&#xe409');
        }else{
            if(inited === '0'){
                sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/searchsections',{course_child_id:course_id},function(data){
                    if(data.code === 201){
                        courseData.childs[index].sections = data.datas;
                        $(courseData.childs[index].sections).each(function(i,s){
                            $(me).next('div').append('<p data-index="'+i+'" class="j-tab-list-one" data-level="1" data-id="'+s.section_id+'">'+(index+1)+'-'+(i+1)+' '+s.title+'</p><div data-id="'+s.section_id+'"></div>');
                            $(s.childs).each(function(j,c){
                                $('div[data-id="'+s.section_id+'"]').append('<p data-index="'+j+'" class="j-tab-list-one" data-level="2" data-id="'+c.section_child_id+'">'+(index+1)+'-'+(i+1)+'-'+(j+1)+' '+c.title+'</p>');
                            });
                        });
                        $(me).next('div').attr('data-init','1');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
            $(me).next('div').show();
            $(me).addClass('open');
            $(me).find('i').html('&#xe313');
        }
        return false;
    }else{
        $('.j-tool-bar>span[data-name="note"]').show();
        $('.j-tool-bar>span[data-name="comment"]').show();
        if(level === '1'){
            course_data = courseData.childs[parseInt($(me).parent().prev().attr('data-index'))].sections[parseInt($(me).attr('data-index'))];
            currentItem = {type:'section',id:course_data.section_id};
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/studylogoperation',{type:'3',section_id:course_data.section_id},function(data){
                if(data.code === 201){
                    if(data.datas.length){
                        studyData = data.datas[data.datas.length - 1];
                        initSectionMain(course_data);
                    }else{
                        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/studylogoperation',{type:'1',section_id:course_data.section_id},function(data1){
                            if(data1.code === 201){
                                studyData = data.datas;
                                initSectionMain(course_data);
                            }else if(data1.code === 204){
                                $.InfoBox('alert','error','错误',data1.err.toString());
                            }else{
                                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                            }
                        });
                    }
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            course_data = courseData.childs[parseInt($(me).parent().parent().prev().attr('data-index'))].sections[parseInt($(me).parent().prev().attr('data-index'))].childs[parseInt($(me).attr('data-index'))];
            currentItem = {type:'section_child',id:course_data.section_child_id};
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/studylogoperation',{type:'3',section_child_id:course_data.section_child_id},function(data){
                if(data.code === 201){
                    if(data.datas.length){
                        studyData = data.datas[data.datas.length - 1];
                        initSectionMain(course_data);
                    }else{
                        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/studylogoperation',{type:'1',section_child_id:course_data.section_child_id},function(data1){
                            if(data1.code === 201){
                                studyData = data.datas;
                                initSectionMain(course_data);
                            }else if(data1.code === 204){
                                $.InfoBox('alert','error','错误',data1.err.toString());
                            }else{
                                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                            }
                        });
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

    var initSectionMain = function(course_data){
        $('.j-course-link>i').show();
        $('.j-course-link>p').show().html(course_data.title);
        $('.j-tab-switch>li').hide();
        $('.j-main>div').css({'background':'#fff'}).empty().hide();

        if(studyData.hasOwnProperty('myexam_id')?studyData.myexam_id:false){
            $('.j-main>div[data-type="exam"]').append('<iframe style="width: 100%;height: '+(window.innerHeight-137)+'px;border: 0;padding:0" src="'+(ports.exam.domain == location.host ? ports.exam.domain : '')+'/exam#'+studyData.myexam_id+'"/>');
            $('.j-tab-switch>li[data-type="exam"]').show().click();
        }

        if(course_data.video){
            $('.j-main>div[data-type="video"]').append('<div style="background:#222;text-align: center"><video style="width:100%;height: '+(window.innerHeight-137)+'px" src="'+(ports.course.domain === location.origin ? ports.course.domain : '')+'/course/subject/downloadvideo?path='+course_data.video+'" controls="controls"></video></div>');
            $('.j-tab-switch>li[data-type="video"]').show().click();
        }

        if(course_data.txt){
            $('.j-main>div[data-type="txt"]').append('<div style="padding: 10px;">'+course_data.txt+'</div>');
            $('.j-tab-switch>li[data-type="txt"]').show().click();
        }
    }
};

var showChild = function(){
    var me = this;
    var course_id = $(me).parent().attr('data-id');
    var inited = $(me).parent().next('div').attr('data-init');
    var index = parseInt($(me).parent().attr('data-index'));
    if($(me).parent().hasClass('open')){
        $(me).parent().next('div').hide();
        $(me).parent().removeClass('open');
        $(me).html('&#xe409');
    }else{
        if(inited === '0'){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/searchsections',{course_child_id:course_id},function(data){
                if(data.code === 201){
                    courseData.childs[index].sections = data.datas;
                    $(courseData.childs[index].sections).each(function(i,s){
                        $(me).parent().next('div').append('<p data-index="'+i+'" class="j-tab-list-one" data-level="1" data-id="'+s.section_id+'">'+(index+1)+'-'+(i+1)+' '+s.title+'</p><div data-id="'+s.section_id+'"></div>');
                        $(s.childs).each(function(j,c){
                            $('div[data-id="'+s.section_id+'"]').append('<p data-index="'+j+'" class="j-tab-list-one" data-level="2" data-id="'+c.section_child_id+'">'+(index+1)+'-'+(i+1)+'-'+(j+1)+' '+c.title+'</p>');
                        });
                    });
                    $(me).parent().next('div').attr('data-init','1');
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
        $(me).parent().next('div').show();
        $(me).parent().addClass('open');
        $(me).html('&#xe313');
    }
    return false;
};

var showCourseInfo = function(){
    if($(this).hasClass('active')) return false;
    currentItem = {type:'',id:''};
    $('.j-tool-bar>span[data-name="note"]').hide();
    $('.j-tool-bar>span[data-name="comment"]').hide();
    $('.j-course-link>i').hide();
    $('.j-course-link>p').hide();
    $('.j-tab-list-one').removeClass('active');
    $(this).addClass('active');
    $('.j-tab-switch>li').hide();
    $('.j-tab-switch>li[data-type="description"]').show().click();
    $('.j-main>div[data-type="description"]').empty();
    $(areaArray).each(function(i,a){
        if(courseData.info[a.key]){
            $('.j-main>div[data-type="description"]').append('<div class="j-course-info-one"><h4><span class="j-icon">&#x'+ a.icon+'</span>'+ a.name+'</h4><p>'+courseData.info[a.key]+'</p></div>');
        }
    });
};

var toolClick = function(){
    var tool = $(this).attr('data-name');
    $('.j-side-tab-con>div').hide();
    $('.j-tool-bar>span').removeClass('active');
    $(this).addClass('active');
    $('.j-side-tab-con>div[data-name="'+tool+'"]').show();
    if(open){
        if(tool === lastTool){
            $('.j-side-bar').animate({'right':'-280px'},200);
            $('.j-course-operation').animate({'paddingRight':'10px'},200);
            $('.j-main').animate({'paddingRight':'10px'},200);
            $(this).removeClass('active');
            open = false;
        }
    }else{
        $('.j-side-bar').animate({'right':'0'},200);
        $('.j-course-operation').animate({'paddingRight':'290px'},200);
        $('.j-main').animate({'paddingRight':'290px'},200);
        open = true;
    }
    if(tool === 'comment'){
        var level = $('.j-tab-list-one.active').attr('data-level');
        var id = $('.j-tab-list-one.active').attr('data-id');
        var sendData = {type : '3'};
        if(level === '1'){
            sendData.section_id = id;
        }else{
            sendData.section_child_id = id;
        }
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/commentsoperation',sendData,function(data){
            if(data.code === 201){
                $('.j-comment-list').empty();
                if(data.datas.length){
                    $(data.datas).each(function(i,c){
                        $('.j-comment-list').prepend('<div data-id="'+c.public_comments_id+'"><div class="j-comment-user"><img src="'+(c.headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+c.headpngpath:'/img/default/touxiang.png')+'"/><p>'+(c.fullname?c.fullname:c.account)+'</p></div><div class="j-comment-txt"><p>'+c.txt+'</p><i>'+new Date(c.create_time).Format('yyyy-MM-dd hh:mm:ss')+'</i>'+(c.account === userinfo.account?'<span class="j-comment-remove">删除</span>':'')+'</div></div>');
                    });
                }else{
                    $('.j-comment-list').append('<p>该章节目前还没有评论哦~</p>');
                }
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(tool === 'note'){
        $('.j-note-edit>textarea').val(studyData.txt?studyData.txt:'');
    }
    lastTool = tool;
};

var showTab = function(){
    //if($(this).hasClass('active')) return false;

    var type = $(this).attr('data-type');
    $('.j-tab-switch>li').removeClass('active');
    $(this).addClass('active');
    $('.j-main>div').hide();
    $('.j-main>div[data-type="'+type+'"]').show();
};

var submitNote = function(){
    var txt = $('.j-note-edit>textarea').val();
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/studylogoperation',{type:'2',txt:txt,study_log_id:studyData.study_log_id},function(data){
        if(data.code === 201){
            studyData.txt = txt;
            $.InfoBox('alert','success','保存成功','学习笔记保存成功！');
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var submitComment = function(){
    var txt = $('.j-comment-edit>textarea').val();
    if(txt){
        var sendData = {txt:txt,type:'1'};
        if(currentItem.type === 'section'){
            sendData.section_id = currentItem.id;
        }else if(currentItem.type === 'section_child'){
            sendData.section_child_id = currentItem.id;
        }else{
            return false;
        }
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/commentsoperation',sendData,function(data){
            if(data.code === 201){
                $('.j-comment-edit>textarea').val('');
                if($('.j-comment-list').find('div').length === 0){
                    $('.j-comment-list').empty();
                }
                $('.j-comment-list').prepend('<div data-id="'+data.datas.public_comments_id+'"><div class="j-comment-user"><img src="'+(userinfo.headpngpath?(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+userinfo.headpngpath:'/img/default/touxiang.png')+'"/><p>'+(userinfo.fullname?userinfo.fullname:userinfo.account)+'</p></div><div class="j-comment-txt"><p>'+txt+'</p><i>'+new Date().Format('yyyy-MM-dd hh:mm:ss')+'</i><span class="j-comment-remove">删除</span></div></div>');
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }
};

var deleteComment = function(){
    var me = this;
    $.InfoBox('confirm','info','是否删除','您是否确认删除该条评论？',function(){
        var id = $(me).parent().parent().attr('data-id');
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/commentsoperation',{type:'2',public_comments_id:id},function(data){
            if(data.code === 201){
                $(me).parent().parent().remove();
                if($('.j-comment-list').find('div').length === 0){
                    $('.j-comment-list').append('<p>该章节目前还没有评论哦~</p>');
                }
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });
};

var bindEvents = function(){
    $('.j-side-tab-con')
        .on('click','.j-course-name',showCourseInfo)
        .on('click','.j-tab-list-one>i',showChild)
        .on('click','.j-tab-list-one',listOneClick)
        .on('click','.j-comment-edit>span',submitComment)
        .on('click','.j-note-edit>span',submitNote)
        .on('click','.j-comment-remove',deleteComment)
    ;

    $('.j-tool-bar')
        .on('click','span',toolClick)
    ;

    $('.j-tab-switch').on('click','li',showTab)
    ;
};

var initSide = function(){
    $('.j-side-tab-con>div[data-name="menu"]').empty().append('<h4 class="j-course-name">'+courseData.info.coursename+'</h4>')
    $(courseData.childs).each(function(i,c){
        $('.j-side-tab-con>div[data-name="menu"]').append('<p data-index="'+i+'" class="j-tab-list-one" data-level="0" data-id="'+c.course_child_id+'">'+(i+1)+' '+c.title+'<i class="j-icon">&#xe409</i></p><div data-init="0" data-id="'+c.course_child_id+'"></div>');
    });
};

$(function(){
    course_id = window.location.hash.split("#")[1];
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/getcourse',{course_id:course_id},function(data){
        if(data.code === 201){
            courseData = data.datas;
            $('.j-course-link>h4').html(courseData.info.coursename);
            $('.j-main>div').css({'height':window.innerHeight - 137});
            bindEvents();
            initSide();
            $('.j-tool-bar>span[data-name="menu"]').click();
            $('.j-course-name').click();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
});