var courseData = [],courseArray = [],totalPage,currentPage=0;

(function(container){
    container.empty().append('<div class="j-title"><div><input type="text"/><span class="j-search">搜索</span></div></div><div class="j-manage-main"><div class="j-page"><div></div><div class="j-page-switch"><i class="j-icon j-page-prev">&#xe314</i><p class="j-current-page">1</p><p>/</p><p class="j-total-page">25</p><i class="j-icon j-page-next">&#xe315</i></div></div><div class="j-course-list"></div></div>');
    sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/study/search/getstudycourses',{type:'1'},function(data){
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

    var bindEvents = function(){
        $('.j-course-all').click(function(){
            var me = this;
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/study/search/getstudycourses',{type:'1'},function(data){
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
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getmycourses_belong',{type : '1'},function(data){
                if(data.code == 201){
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

        $('.j-unpublished-list').click(function(){
            var me = this;
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getmycourses_belong',{type : '0'},function(data){
                if(data.code == 201){
                    totalPage = currentPage = 0;
                    $(me).parent('div').find('span.active').removeClass('active');
                    $(me).addClass('active');
                    initPage(data.datas);
                }else{
                }
            });
        });

        /*$('.j-course-list').on('click','h4',function(){
            var course_id = $(this).parent('div').attr('data-id');
            window.location.href = (ports.course.domain == location.host ? ports.course.domain : '')+'/study#'+course_id;
        });*/

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
        if(p === '-1'){
            changePage(currentPage-1);
        }else if(p === '+1'){
            changePage(currentPage+1);
        }else{
            $('.j-course-list').empty();
            $('.j-current-page').html(p+1);
            currentPage = p;
            $(courseData[p]).each(function(i,one){
                $('.j-course-list').append('<div data-id="'+one.study_log_id+'"  class="j-course-one '+(i%4 === 0?'no-margin':'')+'"><img src="'+(one.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+one.pngpath:'/img/default/course.png')+'"/><h4>'+one.title+'</h4><span>'+one.period+'课时</span></div>');
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
        setPage(datas);
        if(!datas.length) return;
        changePage(currentPage);
    };

})($('.j-main-content'));