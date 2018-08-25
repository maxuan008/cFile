var sendData = {
        type : '',
        coursename : '',
        des : '',
        period : '',
        teacher_introduction : '',
        workflow : '',
        target : '',
        tool : '',
        for_use_people : '',
        content : '',
        jobreq : '',
        pqs : '',
        method : ''
    };
var areaId,rePage;

$(function(){
    if(window.location.hash){
        var hashstr = window.location.hash.split("#")[1];
        areaId = hashstr.split("/")[1];
        rePage = hashstr.split("/")[0];
    }

    if(areaId){
        sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/getcourse',{course_id : areaId},function(data){
            if(data.code == 201){
                sendData = data.datas.info;
                $('.j-title li').addClass('done');
                $('.j-title span').addClass('done');
                $('.j-list>li').addClass('done');
                $('.j-complete-step').addClass('active').html('&#xe5ca');
                //step 1
                $('.j-course-type>span[data-type="'+sendData.type+'"]').addClass('active');
                //step 2
                $('input[data-type="coursename"]').val(sendData.coursename);
                $('textarea[data-type="des"]').val(sendData.des);
                $('input[data-type="period"]').val(sendData.period);
                $('textarea[data-type="teacher_introduction"]').val(sendData.teacher_introduction);
                if(sendData.pngpath) $('.j-course-img').attr('src',(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+sendData.pngpath)
                //step 3
                $('textarea[data-type="workflow"]').val(sendData.workflow);
                $('textarea[data-type="target"]').val(sendData.target);
                $('textarea[data-type="tool"]').val(sendData.tool);
                $('textarea[data-type="for_use_people"]').val(sendData.for_use_people);
                $('textarea[data-type="content"]').val(sendData.content);
                $('textarea[data-type="jobreq"]').val(sendData.jobreq);
                $('textarea[data-type="pqs"]').val(sendData.pqs);
                $('textarea[data-type="method"]').val(sendData.method);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
        if(rePage){
            $('.j-list>a').show().click(function(){
                if(rePage == '0'){

                }else if(rePage == '2'){
                    window.location.href = (ports.course.domain?port.course.domain:'') + '/create-course#'+ areaId;
                }
            });
        }
    }
    //step1
    $('.j-list>li[data-id="1"]').click(function(){
        $('.j-title li').removeClass('doing');
        $('.j-title span').removeClass('doing');
        $('.j-title li[data-id="1"]').addClass('doing');
        $('.j-title span[data-id="1"]').addClass('doing');
        $('.j-list>li').removeClass('active');
        $(this).addClass('active');
        $('.j-operation>div').hide();
        $('.j-operation>div[data-id="1"]').show();
    });

    $('.j-title span[data-id="1"]').click(function(){
        $('.j-title li').removeClass('doing');
        $('.j-title span').removeClass('doing');
        $('.j-title li[data-id="1"]').addClass('doing');
        $('.j-title span[data-id="1"]').addClass('doing');
        $('.j-list>li').removeClass('active');
        $('.j-list>li[data-id="1"]').addClass('active');
        $('.j-operation>div').hide();
        $('.j-operation>div[data-id="1"]').show();
    });

    $('.j-course-type>span').click(function(){
        if(areaId){
            $.InfoBox('alert','error','无法修改','不能修改课程类型！');
            return;
        }
        sendData.type = $(this).attr('data-type');
        $('.j-title li[data-id="1"]').addClass('done');
        $('.j-title span[data-id="1"]').addClass('done');
        $('.j-list>li[data-id="1"]').addClass('done');
        $('.j-course-type>span').removeClass('active');
        $(this).addClass('active');
        $('.j-operation>div[data-id="1"]>span').addClass('active');
    });

    $('.j-operation>div[data-id="1"]').on('click','.j-complete-step.active',function(){
        if(areaId){
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/updatecourse',sendData,function(data){
                if(data.code === 201){

                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            $('.j-title li').removeClass('doing');
            $('.j-title span').removeClass('doing');
            $('.j-title li[data-id="2"]').addClass('doing');
            $('.j-title span[data-id="2"]').addClass('doing');
            $('.j-list>li').removeClass('active');
            $('.j-list>li[data-id="2"]').addClass('active');
            $('.j-operation>div[data-id="1"]').slideUp(400);
            $('.j-operation>div[data-id="2"]').show();
        }
    });

    //step2
    var uploadPng = function(callback){
        var me = this;

        var progressHandler = function(e){
            console.log(e);
        };

        var beforeSendHandler = function(){
        };

        var completeHandler = function(data){
            callback(data);
        };

        var errorHandler = function(){
            callback(false);
        };

        var formData = new FormData($('form')[0]);
        var url;
        if(areaId){
            url = (ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/uploadpng?course_id='+areaId;
        }else{
            url = (ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/uploadtmpfile'
        }
        $.ajax({
            url: url,
            type: 'POST',
            xhr: function() {  // custom xhr
                myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // check if upload property exists
                    myXhr.upload.addEventListener('progress',progressHandler, false); // for handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax事件
            beforeSend: beforeSendHandler,
            success: completeHandler,
            error: errorHandler,
            // Form数据
            data: formData,
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false,
            processData: false
        });
    };

    $('#j-img-upload').on('change',function(){
        var _this = this;
        if(!$('#j-img-upload').val()) return false;
        var filename = $('#j-img-upload').val().split('\\');
        var filetype = filename[filename.length-1].split('.')[filename[filename.length-1].split('.').length-1];
        if(filetype !== 'png' &&filetype !== 'jpg' &&filetype !== 'PNG' &&filetype !== 'JPG' ){
            $.InfoBox('alert','error','格式错误','上传的文件格式不对(.png或.jpg)！');
            return false;
        }else{
            var fileSize = (this.files[0].size).toFixed(2);
            if(fileSize > 1048576*2){
                $.InfoBox('alert','error','文件过大','上传的文件过大(文件不能大于2M)！');
                return false;
            }else{
                uploadPng(function(data){
                    if(data.code === 201){
                        $('.j-course-img').attr('src',(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+data.datas.path);
                        sendData.pngpath = data.datas.path;
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                    $(_this).val('');
                });
            }
        }
    });

    $('.j-list>li[data-id="2"]').click(function(){
        if(sendData.type){
            $('.j-title li').removeClass('doing');
            $('.j-title span').removeClass('doing');
            $('.j-title li[data-id="2"]').addClass('doing');
            $('.j-title span[data-id="2"]').addClass('doing');
            $('.j-list>li').removeClass('active');
            $(this).addClass('active');
            $('.j-operation>div').hide();
            $('.j-operation>div[data-id="2"]').show();
        }
    });

    $('.j-title span[data-id="2"]').click(function(){
        if(sendData.type){
            $('.j-title li').removeClass('doing');
            $('.j-title span').removeClass('doing');
            $('.j-title li[data-id="2"]').addClass('doing');
            $('.j-title span[data-id="2"]').addClass('doing');
            $('.j-list>li').removeClass('active');
            $('.j-list>li[data-id="2"]').addClass('active');
            $('.j-operation>div').hide();
            $('.j-operation>div[data-id="2"]').show();
        }
    });

    $('.j-operation>div[data-id="2"] input').on('change',function(){
        sendData[$(this).attr('data-type')] = $(this).val();
        if(sendData.coursename && sendData.des && sendData.period && sendData.teacher_introduction){
            $('.j-title li[data-id="2"]').addClass('done');
            $('.j-title span[data-id="2"]').addClass('done');
            $('.j-list>li[data-id="2"]').addClass('done');
            $('.j-operation>div[data-id="2"]>span').addClass('active');
        }
    });

    $('.j-operation>div[data-id="2"] textarea').on('change',function(){
        sendData[$(this).attr('data-type')] = $(this).val();
        if(sendData.coursename && sendData.des && sendData.period && sendData.teacher_introduction){
            $('.j-title li[data-id="2"]').addClass('done');
            $('.j-title span[data-id="2"]').addClass('done');
            $('.j-list>li[data-id="2"]').addClass('done');
            $('.j-operation>div[data-id="2"]>span').addClass('active');
        }
    });

    $('.j-operation>div[data-id="2"]').on('click','.j-complete-step.active',function(){
        if(areaId){
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/updatecourse',sendData,function(data){
                if(data.code === 201){

                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            $('.j-title li').removeClass('doing');
            $('.j-title span').removeClass('doing');
            $('.j-title li[data-id="3"]').addClass('doing').addClass('done');
            $('.j-title span[data-id="3"]').addClass('doing').addClass('done');
            $('.j-list>li').removeClass('active');
            $('.j-list>li[data-id="3"]').addClass('active').addClass('done');
            $('.j-operation>div[data-id="2"]').slideUp(400);
            $('.j-operation>div[data-id="3"]').show();
        }
    });

    //step3
    $('.j-list>li[data-id="3"]').click(function(){
        if(sendData.type && sendData.coursename && sendData.des && sendData.period && sendData.teacher_introduction){
            $('.j-title li').removeClass('doing');
            $('.j-title span').removeClass('doing');
            $('.j-title li[data-id="3"]').addClass('doing');
            $('.j-title span[data-id="3"]').addClass('doing');
            $('.j-list>li').removeClass('active');
            $(this).addClass('active');
            $('.j-operation>div').hide();
            $('.j-operation>div[data-id="3"]').show();
        }
    });

    $('.j-title span[data-id="3"]').click(function(){
        if(sendData.type && sendData.coursename && sendData.des && sendData.period && sendData.teacher_introduction){
            $('.j-title li').removeClass('doing');
            $('.j-title span').removeClass('doing');
            $('.j-title li[data-id="3"]').addClass('doing');
            $('.j-title span[data-id="3"]').addClass('doing');
            $('.j-list>li').removeClass('active');
            $('.j-list>li[data-id="3"]').addClass('active');
            $('.j-operation>div').hide();
            $('.j-operation>div[data-id="3"]').show();
        }
    });

    $('.j-operation>div[data-id="3"] textarea').on('change',function(){
        sendData[$(this).attr('data-type')] = $(this).val();
        $('.j-list>li[data-id="2"]').addClass('done');
    });

    $('.j-operation>div[data-id="3"]').on('click','.j-complete-step.active',function(){
        if(areaId){
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/updatecourse',sendData,function(data){
                if(data.code === 201){

                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            sendMessage('post',(ports.course.domain == location.host ? ports.course.domain : ''),'/course/develop/addcourse',sendData,function(data){
                if(data.code == 201){
                    $.InfoBox('alert','success','完成','创建成功！');
                    window.location.href = '/create-course#'+data.datas.course_id;
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    });

    $('.j-operation>div').hide().eq(0).show();
});