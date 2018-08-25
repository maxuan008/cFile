var course_id,course_info,course_child = [],studying_courses,logId;

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
    sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/search/getstudycourses',{type : '0'},function(data){
        if(data.code === 201){
            studying_courses = data.datas;
            sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getcourse_child',{course_child_id : course_id},function(data1){
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
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
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
            $('.j-info').append('<div><h4><span class="j-icon">&#x'+ a.icon+'</span>'+ a.name+'</h4><p>'+course_info[a.key]+'</p></div>');
        }
    });
};

var bindEvents = function(){
    $('.j-start-course').click(function(){
        if(logId){
            window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/study#'+logId;
        }else{
            sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/single/beginlearining',{course_child_id : course_id},function(data){
                if(data.code === 201){
                    window.location.href = (ports.study.domain === location.host ? ports.study.domain : '') + '/study#' + data.datas.study_log_id
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    });
};

var init = function(){
    getCourseInfo(function(){
        var have = false;
        $('.j-title p').html(course_info.title);
        $(studying_courses).each(function(i,s){
            if(s.course_child_id === course_id){
                have = true;
                logId = s.study_log_id;
            }
        });
        if(have){
            $('.j-start-course').html('继续课程');
        }else{
            $('.j-start-course').html('开始课程');
        }
        initInfos();
        bindEvents();
    });
};

$(function(){
    course_id = window.location.hash.split("#")[1];
    init();
});