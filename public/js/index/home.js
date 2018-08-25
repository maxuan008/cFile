var courses;

$(function(){
    $('.j-list').on('click','.j-list-course-one',function(){
        var course_id = $(this).attr('data-id');
        window.location.href = '/course#' + course_id;
    });

    $('.j-course-list').on('click','.j-course-name',function(){
        var course_id = $(this).parent().attr('data-id');
        window.location.href = '/course#' + course_id;
    });

    sendMessage('post',(ports.net.domain === location.origin ? ports.net.domain : ''),'/net/index/courselist',{},function(data){
        if(data.code === 201){
            $('.j-list').empty();
            if(data.datas.length){
                $(data.datas).each(function(i,o){
                    $('.j-list').append('<div><span><h2>'+o.name+'<i class="j-icon"></i></h2></span><div data-id="'+o.dept_id+'" class="j-list-child"></div></div>');
                    if(o.childs.length){
                        $(o.childs).each(function(j,c){
                            $('.j-list-child[data-id="'+o.dept_id+'"]').append('<div><p>'+c.name+'</p><div data-id="'+c.dept_id+'" class="j-list-course"></div></div>');
                            if(c.courselist.length){
                                $(c.courselist).each(function(k,s){
                                    $('.j-list-course[data-id="'+c.dept_id+'"]').append('<a data-id="'+s.course_id+'" class="j-list-course-one">'+s.coursename+'</a>');
                                });
                            }
                        });
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

    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getmysinglecourse',{},function(data){
        if(data.code === 201){
            courses = data.datas;
            $('.j-course-list').empty();
            var i,datas = [],ids = [];
            for(i = 0;i<courses.length;i++){
                if(ids.indexOf(courses[i].course_id)== -1){
                    ids.push(courses[i].course_id);
                    datas.push(courses[i]);
                }
            }
            $(datas).each(function(i,c){
                if(i<5){
                    $('.j-course-list').append('<div data-id="'+c.course_id+'"><h4 class="j-course-name">'+c.coursename+'</h4><span>'+c.des+'</span><div></div></div>');
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