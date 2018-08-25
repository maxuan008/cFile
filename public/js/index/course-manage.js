var courseData = [],courseArray = [],totalPage,currentPage= 0,orgTree;

(function(container){
    container.empty().append('<div class="j-title"><div><input type="text"/><span class="j-search">搜索</span></div></div><div class="j-manage-main"><div class="j-page"><div><h4>课程类型：</h4><span class="active j-course-all">全部</span><span class="j-published-list">已发布</span><span class="j-unpublished-list">未发布</span></div><div class="j-page-switch"><i class="j-icon j-page-prev">&#xe314</i><p class="j-current-page">1</p><p>/</p><p class="j-total-page">25</p><i class="j-icon j-page-next">&#xe315</i></div></div><div class="j-course-list"></div></div>');
    sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getmycourses',{},function(data){
        if(data.code == 201){
            courseArray = data.datas;
            initPage(courseArray);
            bindEvents();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });

    var getOrgTree = function(next){
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/getdepttree',{},function(data){
            if(data.code == 201){
                orgTree = data.datas;
                next();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    };

    var bindEvents = function(){
        $('.j-course-all').click(function(){
            var me = this;
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getmycourses',{},function(data){
                if(data.code == 201){
                    courseArray = data.datas;
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    initPage(courseArray);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        $('.j-published-list').click(function(){
            var me = this;
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getmycourses',{},function(data){
                if(data.code == 201){
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    var courses = [];
                    $(data.datas).each(function(i,d){
                        if(d.belong.length){
                            courses.push(d);
                        }
                    });
                    initPage(courses);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        $('.j-unpublished-list').click(function(){
            var me = this;
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getmycourses',{},function(data){
                if(data.code == 201){
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    var courses = [];
                    $(data.datas).each(function(i,d){
                        if(!d.belong.length){
                            courses.push(d);
                        }
                    });
                    initPage(courses);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        $('.j-course-list').on('click','.j-course-one',function(){
            var course_id = $(this).attr('data-id');
            window.location.href = (ports.course.domain == location.host ? ports.course.domain : '')+'/create-course#'+course_id;
        }).on('click','.publish',function(){
            return false;
        }).on('click','.j-org-list p',function(){
            var dept_id,course_id,dept_ids=[],belong_id,this_ = this;
            if($(this).hasClass('active')){
                belong_id = $(this).attr('data-belong-id');
                dept_ids.push(dept_id);
                course_id = $(this).closest('.j-course-one').attr('data-id');
                sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/delcoursebelong',{belong_id:belong_id},function(data){
                    if(data.code == 201){
                        $(this_).removeClass('active');
                        $(this_).attr('data-belong-id','');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
                return false;
            }else{
                dept_id = $(this).attr('data-id');
                dept_ids.push(dept_id);
                $(this).addClass('active');
                course_id = $(this).closest('.j-course-one').attr('data-id');
                sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/coursebelong',{course_id:course_id,dept_ids:JSON.stringify(dept_ids)},function(data){
                    if(data.code == 201){
                        $(this_).attr('data-belong-id',data.datas[0].belong_id);
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
                return false;
            }
        });

        $('.j-title').on('input','input',function(){
            var txt = $(this).val();
            var datas = [];
            $(courseArray).each(function(i,c){
                if(c.coursename.indexOf(txt) > -1){
                    datas.push(c);
                }
            });
            initPage(datas);
        });

        $('.j-page').on('click','.j-page-prev.active',function(){
            changePage('-1');
        }).on('click','.j-page-next.active',function(){
            changePage('+1');
        });
    };

    var setPage = function(datas){
        courseData = [];
        $('.j-course-list').empty();
        if(!datas.length){
            $('.j-course-list').append('<p>_(:з」∠)_课程列表空空如也</p>');
        }
        totalPage = Math.ceil(datas.length/8);
        $('.j-total-page').html(totalPage);
        var j, i,tmpArr;
        for(i = 0;i < totalPage;i++){
            tmpArr = [];
            if(i<totalPage - 1){
                for(j=0;j<8;j++){
                    tmpArr.push(datas[i*8+j]);
                }
            }else{
                for(j=0;j<(datas.length-((totalPage-1)*8));j++){
                    tmpArr.push(datas[i*8+j]);
                }
            }
            courseData.push(tmpArr);
        }
    };

    var changePage = function(p){
        var addChild = function(c,pId,level){
            $(orgTree).each(function(i,o){
                if(o.father_id == pId){
                    c.append('<p data-level="'+level+'" data-id="'+o.dept_id+'">'+o.name+'</p>');
                    addChild(c, o.dept_id,level+1);
                }
            });
        };

        if(p === '-1'){
            changePage(currentPage-1);
        }else if(p === '+1'){
            changePage(currentPage+1);
        }else{
            $('.j-course-list').empty();
            $('.j-current-page').html(p+1);
            currentPage = p;
            $(courseData[p]).each(function(i,one){
                $('.j-course-list').append('<div class="j-course-one '+(i%4 === 0?'no-margin':'')+'" data-id="'+one.course_id+'"><img src="'+(one.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+one.pngpath:'/img/default/course.png')+'"/><h4>'+one.coursename+'</h4><span>'+one.period+'课时</span><div class="publish"><span><p>发布到</p><i class="j-icon">&#xe409</i><div class="j-org-list"></div></span></div></div>');
                var level = 1111,belongs = one.belong;
                $('.j-course-block[data-id="'+one.course_id+'"] .j-org-list').on('click','p',function(){
                    var dept_id,course_id,dept_ids=[],belong_id,this_ = this;
                    if($(this).hasClass('active')){
                        belong_id = $(this).attr('data-belong-id');
                        dept_ids.push(dept_id);
                        course_id = $(this).closest('.j-course-block').attr('data-id');
                        sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/delcoursebelong',{belong_id:belong_id},function(data){
                            if(data.code == 201){
                                $(this_).removeClass('active');
                                $(this_).attr('data-belong-id','');
                            }else if(data.code === 204){
                                $.InfoBox('alert','error','错误',data.err.toString());
                            }else{
                                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                            }
                        });
                        return false;
                    }else{
                        dept_id = $(this).attr('data-id');
                        dept_ids.push(dept_id);
                        $(this).addClass('active');
                        course_id = $(this).closest('.j-course-block').attr('data-id');
                        sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/coursebelong',{course_id:course_id,dept_ids:JSON.stringify(dept_ids)},function(data){
                            if(data.code == 201){
                                $(this_).attr('data-belong-id',data.datas[0].belong_id);
                            }else if(data.code === 204){
                                $.InfoBox('alert','error','错误',data.err.toString());
                            }else{
                                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                            }
                        });
                        return false;
                    }
                });
                $(orgTree).each(function(i,o){
                    if(o.level < level) level = o.level;
                });
                $(orgTree).each(function(i,o){
                    var have = false;
                    var belong_id;
                    if(o.level == level){
                        $(belongs).each(function(i,b){
                            if(b.dept_id == o.dept_id){
                                have = true;
                                belong_id = b.belong_id;
                            }
                        });
                        if(have){
                            $('div[data-id="'+one.course_id+'"] .j-org-list').append('<p class="active" data-level="0" data-belong-id="'+belong_id+'" data-id="'+o.dept_id+'">'+o.name+'</p>');
                            addChild($('div[data-id="'+one.course_id+'"] .j-org-list'),o.dept_id,1);
                        }else{
                            $('div[data-id="'+one.course_id+'"] .j-org-list').append('<p data-level="0" data-id="'+o.dept_id+'">'+o.name+'</p>');
                            addChild($('div[data-id="'+one.course_id+'"] .j-org-list'),o.dept_id,1);
                        }
                    }
                });

            });
            if((currentPage+1) == totalPage){
                $('.j-page-next').removeClass('active');
            }else{
                $('.j-page-next').addClass('active');
            }
            if(currentPage == 0){
                $('.j-page-prev').removeClass('active');
            }else{
                $('.j-page-prev').addClass('active');
            }
        }

    };

    var initPage = function(datas){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height});
        setPage(datas);
        if(!datas.length) return;
        getOrgTree(function(){
            changePage(currentPage);
        });
    };

})($('.j-main-content'));