var examData;

var appendQuestion = function(q,i){
    if(q.type == '1'){
        $('.j-body').append('<div data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.myquestion_id +'" class="j-course-list-c unpublished"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div></div>');
        $(q.options).each(function(j,op){
            if(examData.iscompleted === '1'){
                if(op.isselected == '1' && op.isanswer == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon checked">&#xe86c</i><p style="color:#00b38a">'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else if(op.isanswer == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">&#xe836</i><p style="color:#00b38a">'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else if(op.isselected == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon checked">&#xe86c</i><p style="color:red">'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else{
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">&#xe836</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }
            }else{
                if(op.isselected == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon checked">&#xe86c</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else{
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">&#xe836</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }
            }

        });
    }
    else if(q.type == '2'){
        $('.j-body').append('<div class="j-course-list-c unpublished" data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.myquestion_id +'"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div></div>');
        $(q.options).each(function(j,op){
            if(examData.iscompleted === '1'){
                if(op.isselected == '1' && op.isanswer == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="2" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon checked">&#xe834</i><p style="color:00b38a">'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else if(op.isanswer == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">&#xe835</i><p style="color:#00b38a">'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else if(op.isselected == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="1" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon checked">&#xe834</i><p style="color:red">'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else{
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="2" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">&#xe835</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }
            }else{
                if(op.isselected == '1'){
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="2" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon checked">&#xe834</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }else{
                    $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="2" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">&#xe835</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
                }
            }

        });
    }
    else if(q.type == '3'){
        $('.j-body').append('<div class="j-course-list-c unpublished" data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.myquestion_id +'"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div><span data-id="'+q.options[0].myoption_id+'" data-type="3" class="j-full-width"><textarea>'+(q.options[0].txt?q.options[0].txt:'')+'</textarea></span></div>');/*'+(q.options[0].answertxt?q.options[0].answertxt:'未编辑答案')+'*/
    }
    else{
        $('.j-body').append('<div class="j-course-list-c unpublished" data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.myquestion_id +'"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div></div>');
        $(q.options).each(function(j,op){
            $('.j-body>div[data-id="'+ q.myquestion_id+'"]').append('<span data-type="4" data-index="'+ j +'" data-id="'+op.myoption_id+'"><i class="j-icon">'+(j+1)+'.</i><span><input type="text" value="'+(op.txt?op.txt:'')+'"/></span></span>');
        });
    }
//    $('.j-danx-number').html(danx);$('.j-duox-number').html(duox);$('.j-tk-number').html(tk);$('.j-jd-number').html(jd);
//    $('.j-total-number').html(danx+duox+tk+jd);$('.j-total-score').html(totalScore);
};

var bindEvents = function(){
    $('.j-body>button').click(function(){
        var me = this;
        if($(me).hasClass('complete')) return false;
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/completedexam',{myexam_id : examData.myexam_id},function(data){
            if(data.code == 201){
                $.InfoBox('alert','success','成功','试卷提交成功！');
                $(me).addClass('complete');
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });

    $('.j-body').on('click','i',function(){
        var me = this;
        var type = $(this).parent('span').attr('data-type');
        var myoption_id = $(this).parent('span').attr('data-id');
        var myquestion_id = $(this).parent('span').parent('div').attr('data-id');
        if(type == '1'){
            if(!$(this).hasClass('checked')){
                sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/answerquestion',{myquestion_id:myquestion_id,myoption_id : myoption_id,type : type ,isselected : '1'},function(data){
                    if(data.code == 201){
                        $(me).parent('span').parent('div').find('i.checked').removeClass('checked').html('&#xe836');
                        $(me).addClass('checked').html('&#xe86c');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }else if(type == '2'){
            if($(this).hasClass('checked')){
                sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/answerquestion',{myquestion_id:myquestion_id,myoption_id : myoption_id,type : type ,isselected : '0'},function(data){
                    if(data.code == 201){
                        $(me).removeClass('checked');
                        $(me).html('&#xe835');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }else{
                sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/answerquestion',{myquestion_id:myquestion_id,myoption_id : myoption_id,type : type ,isselected : '1'},function(data){
                    if(data.code == 201){
                        $(me).addClass('checked');
                        $(me).html('&#xe834');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }
    }).on('change','input',function(){
        var txt = $(this).val();
        var myoption_id = $(this).parent('span').parent('span').attr('data-id');
        var myquestion_id = $(this).parent('span').parent('span').parent('div').attr('data-id');
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/answerquestion',{myquestion_id:myquestion_id,myoption_id : myoption_id,type : '4' ,txt : txt},function(data){
            if(data.code == 201){
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('change','textarea',function(){
        var txt = $(this).val();
        var myoption_id = $(this).parent('span').attr('data-id');
        var myquestion_id = $(this).parent('span').parent('div').attr('data-id');
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/answerquestion',{myquestion_id:myquestion_id,myoption_id : myoption_id,type : '3' ,txt : txt},function(data){
            if(data.code == 201){
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });
};

$(function(){
    var exam_id = window.location.hash.split("#")[1];
    sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/study/getmyexam',{myexam_id : exam_id},function(data){
        if(data.code == 201){
            examData = data.datas;
            $(examData.questions).each(function(i,q){
                appendQuestion(q,i);
            });
            $('.j-body').append(' <button class="'+(data.datas.iscompleted === '1'?'complete':'')+'">答题完成</button>');
            if(examData.iscompleted === '0'){
                bindEvents();
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
});