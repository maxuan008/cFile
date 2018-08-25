var courseData = [],courses,courseArray = [],totalPage,currentPage=0,currentClass = '0',studycourses;

(function(container){
    container.empty().append('<div class="j-title"><div><input type="text"/><span class="j-search">搜索</span></div></div><div class="j-manage-main"><div class="j-page"><div><h4>课程类型：</h4><span class="j-single-list active">单人课程</span><span class="j-org-list">组织课程</span><span class="j-mooc-list">学科体系课程</span></div><div class="j-page-switch"><i class="j-icon j-page-prev">&#xe314</i><p class="j-current-page">1</p><p>/</p><p class="j-total-page">25</p><i class="j-icon j-page-next">&#xe315</i></div></div><div class="j-course-list"></div></div>');
    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/study/search/getstudycourses',{type:'0'},function(data){
        if(data.code === 201){
            studycourses = data.datas;
            sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getmysinglecourse',{},function(data1){
                if(data1.code === 201){
                    courseArray = data1.datas;
                    initPage(courseArray);
                    bindEvents();
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

    var bindEvents = function(){

        $('.j-mooc-list').click(function(){
            var me = this;
            if($(this).hasClass('active')) return false;
            sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getmysinglecourse',{},function(data){
                if(data.code === 201){
                    courses = data.datas;
                    currentClass = '2';
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    initPage(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        $('.j-single-list').click(function(){
            var me = this;
            if($(this).hasClass('active')) return false;
            sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getmysinglecourse',{},function(data){
                if(data.code === 201){
                    courses = data.datas;
                    currentClass = '0';
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    initPage(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        $('.j-org-list').click(function(){
            var me = this;
            sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getmysinglecourse',{},function(data){
                if(data.code === 201){
                    courses = data.datas;
                    currentClass = '1';
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    initPage(data.datas);
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
            window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/course#'+course_id;
        }).on('click','.j-course-one>button',function(){
            var open = $(this).attr('data-open');
            if(open === '0'){
                $(this).parent().children('div').slideDown(200);
                $(this).attr('data-open','1');
                $(this).html('收起学习情境');
            }else{
                $(this).parent().children('div').slideUp(200);
                $(this).attr('data-open','0');
                $(this).html('查看学习情境');
            }
            return false;
        }).on('click','.j-course-one>div>i',function(){
            var course_id = $(this).parents('.j-course-one').attr('data-id');
            window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/course#'+course_id;
            return false;
        }).on('click','.j-situation-one h4',function(){
            var course_child_id = $(this).parent().attr('data-id');
            if(currentClass === '0'){
                window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/course-child#'+course_child_id;
            }else{
                window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/org-course#'+course_child_id;
            }
            return false;
        }).on('click','.j-situation-one>button',function(){
            var course_child_id = $(this).parent().attr('data-id');
            var logId;
            if(currentClass === '0'){
                logId = $(this).attr('data-id');
                if(logId){
                    window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/study#'+logId;
                }else{
                    sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/study/single/beginlearining',{course_child_id : course_child_id},function(data){
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
            }else{
                window.location.href = (ports.course.domain === location.host ? ports.course.domain : '')+'/org-course#'+course_child_id;
            }
            return false;
        });

        $('.j-title').on('input','input',function(){
            var txt = $(this).val();
            var datas = [];
            $(courseArray).each(function(i,c){
                if(c.title.indexOf(txt) > -1){
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

    var setPage = function(data){
        var i,datas = [],tmpData = [],ids = [];
        for(i = 0;i<data.length;i++){
            if(ids.indexOf(data[i].course_id)== -1){
                ids.push(data[i].course_id);
                tmpData.push(data[i]);
            }
        }
        if(currentClass === '2'){
            for(i = 0;i<tmpData.length;i++){
                if((tmpData.type?tmpData.type:'0') === '1'){
                    datas.push(tmpData[i]);
                }
            }
        }else{
            for(i = 0;i<tmpData.length;i++){
                if((tmpData.type?tmpData.type:'0') !== '1'){
                    datas.push(tmpData[i]);
                }
            }
        }

        $('.j-course-list').empty();
        courseData = [];
        if(!datas.length){
            $('.j-course-list').append('<p>_(:з」∠)_课程列表空空如也</p>');
            return false;
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
        var index,logId,have=false;
        if(!courseData.length) return false;
        if(p === '-1'){
            changePage(currentPage-1);
        }else if(p === '+1'){
            changePage(currentPage+1);
        }else{
            $('.j-course-list').empty();
            $('.j-current-page').html(p+1);
            currentPage = p;
            $(courseData[p]).each(function(i,one){
                $('.j-course-list').append('<div class="j-course-one '+(i%4 === 0?'no-margin':'')+'" data-id="'+one.course_id+'"><img src="'+(one.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+one.pngpath:'/img/default/course.png')+'"/><h4>'+one.coursename+'</h4><span>'+one.period+'课时</span><button data-open="0">查看学习情境</button><div class="hide list" style="box-shadow:0 0 1px #bbb;position:absolute;z-index:1"></div></div>');/*<div><p>后端开发</p><p>JQuery</p></div>*/
                index = 0;
                $(one.childs).each(function(j,c){
                    have = false;
                    $(studycourses).each(function(k,s){
                        if(s.course_child_id === c.course_child_id){
                            have = true;
                            logId = s.study_log_id;
                        }
                    });
                    if(index < 5 && c.type === currentClass){
                        if(currentClass === '0'){
                            $('div[data-id="'+ one.course_id +'"]>div').append('<div data-level="'+(index%2)+'" class="j-situation-one" data-id="'+ c.course_child_id +'"><h4>' +c.title+ '</h4><button '+(have?('data-id="'+logId+'"'):'')+'>'+(have?'继续':'开始')+'</button></div>');
                        }else{
                            $('div[data-id="'+ one.course_id +'"]>div').append('<div data-level="'+(index%2)+'" class="j-situation-one" data-id="'+ c.course_child_id +'"><h4>' +c.title+ '</h4><button>进入</button></div>');
                        }
                        index ++;
                    }
                });
                if(index === 5){
                    $('div[data-id="'+ one.course_id +'"]>div').append('<i>更多></i>');
                }
            });
            if((currentPage+1) === totalPage){
                $('.j-page-next').removeClass('active');
            }else{
                $('.j-page-next').addClass('active');
            }
            if(currentPage === 0){
                $('.j-page-prev').removeClass('active');
            }else{
                $('.j-page-prev').addClass('active');
            }
        }

    };

    var initPage = function(datas){
        /*var removeMore = function(arr){
            var resArr = arr,j;
            $(arr).each(function(i,a1){
                for(j=i;j<arr.length;j++){
                    if(a1.course_id === arr[j].course_id){
                        resArr.splice(j,1);
                    }
                }
            });
            return resArr;
        };
        datas = removeMore(datas);*/
        var height = window.innerHeight - 80;
        container.css({'minHeight':height});
        setPage(datas);
        if(!datas.length) return;
        changePage(currentPage);
    };

})($('.j-main-content'));