var course_id,course_info,course_child = [],studying_courses;

var infoArray = [
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

var getCourseInfo = function(callback){
    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getcourse',{course_id : course_id},function(data1){
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
        if(course_info.info[a.key]){
            $('.j-info[data-index="2"]').append('<div><h4><span class="j-icon">&#x'+ a.icon+'</span>'+ a.name+'</h4><p>'+course_info.info[a.key]+'</p></div>');
        }
    });
};

var initSituation = function(callback){
    var initCourse = function(){
        var index1= 0,index2 = 0;
        $(course_child).each(function(i,c){
            var have = false,study_log_id;
            $(studying_courses).each(function(j,s){
                if(s.course_child_id === c.course_child_id){
                    have = true;
                    study_log_id = s.study_log_id;
                }
            });
            if(c.type === '0'){
                $('.j-info[data-index="1"]>div[data-type="0"]').append('<span class="j-one-situation '+((index1++)%4===0?'no-margin':'')+'" data-id="'+ c.course_child_id+'"><div><img src="'+(c.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+c.pngpath:'/img/default/course.png')+'"/><h4>'+ c.title+'</h4><p>'+ c.period+'课时</p></div>'+(have?'<span>继续学习</span>':'<span>开始学习</span>')+'</span>');
                if(have){
                    $('.j-one-situation[data-id="'+c.course_child_id+'"] span').click(function(){
                        window.location.href = (ports.study.domain === location.host ? ports.study.domain : '') + '/study#' + study_log_id;
                    });
                }else{
                    $('.j-one-situation[data-id="'+c.course_child_id+'"] span').click(function(){
                        sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/single/beginlearining',{course_child_id : c.course_child_id},function(data){
                            if(data.code === 201){
                                window.location.href = (ports.study.domain === location.host ? ports.study.domain : '') + '/study#' + data.datas.study_log_id
                            }else if(data.code === 204){
                                $.InfoBox('alert','error','错误',data.err.toString());
                            }else{
                                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                            }
                        });
                    });
                }
            }else{
                $('.j-info[data-index="1"]>div[data-type="1"]').append('<span class="j-one-situation '+((index2++)%4 === 0?'no-margin':'')+'" data-id="'+ c.course_child_id+'"><div><img src="'+(c.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+c.pngpath:'/img/default/course.png')+'"/><h4>'+ c.title+'</h4><p>'+ c.period+'课时</p></div>'+(have?'<span>继续学习</span>':'<span>进入房间</span>')+'</span>');
                if(have){
                    $('.j-one-situation[data-id="'+c.course_child_id+'"] span').click(function(){
                        window.location.href = (ports.study.domain === location.host ? ports.study.domain : '') + '/study#' + study_log_id;
                    });
                }else{
                    $('.j-one-situation[data-id="'+c.course_child_id+'"] span').click(function(){
                        window.location.href = (ports.study.domain === location.host ? ports.study.domain : '') + '/org-course#' + c.course_child_id;
                    });
                }
            }
        });
    };

    var count = 0;
    sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/search/getstudycourses',{type : '0'},function(data){
        if(data.code === 201){
            studying_courses = data.datas;
            course_child = course_info.childs;
            initCourse();
            callback();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });

};

var bindEvents = function(){
    $('.j-tab').on('click','p',function(){
        $('.j-tab p.active').removeClass('active');

        var index = $(this).addClass('active').attr('data-index');
        $('.j-info').hide();
        $('.j-info[data-index="'+index+'"]').show();
    });

    $('.j-info li').click(function(){
        if($(this).hasClass('active')) return false;
        var type = $(this).attr('data-type');
        $('.j-info li').removeClass('active');
        $(this).addClass('active');
        $('.j-situation-con').hide();
        $('.j-situation-con[data-type="'+type+'"]').show();
    });
};

var init = function(){
    getCourseInfo(function(){
        $('.j-title p').html(course_info.info.coursename);
        initInfos();
        initSituation(function(){
            bindEvents();
            $('.j-tab p[data-index="1"]').click();
            $('li[data-type="0"]').click();
        });
    });
};

$(function(){
    course_id = window.location.hash.split("#")[1];
    init();
});