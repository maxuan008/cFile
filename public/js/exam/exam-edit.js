var examData = {},exam_id;
var danx = 0,duox = 0,tk = 0,jd = 0,totalScore=0;
var editData = {},editType;

var appendQuestion = function(q,i){
    if(q.score)totalScore += parseInt(q.score);
    if(q.type == '1'){
        danx++;
        $('.j-body>p').after('<div data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.question_id +'" class="j-course-list-c unpublished"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div></div>');
        $(q.options).each(function(j,op){
            if(op.isanswer == '1'){
                $('.j-body>div[data-id="'+ q.question_id+'"]').append('<span data-index="'+ j +'" data-id="'+op.option_id+'"><i class="j-icon checked">&#xe86c</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
            }else{
                $('.j-body>div[data-id="'+ q.question_id+'"]').append('<span data-index="'+ j +'" data-id="'+op.option_id+'"><i class="j-icon">&#xe836</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
            }
        });
    }
    else if(q.type == '2'){
        duox++;
        $('.j-body>p').after('<div class="j-course-list-c unpublished" data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.question_id +'"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div></div>');
        $(q.options).each(function(j,op){
            if(op.isanswer == '1'){
                $('.j-body>div[data-id="'+ q.question_id+'"]').append('<span data-index="'+ j +'" data-id="'+op.option_id+'"><i class="j-icon checked">&#xe834</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
            }else{
                $('.j-body>div[data-id="'+ q.question_id+'"]').append('<span data-index="'+ j +'" data-id="'+op.option_id+'"><i class="j-icon">&#xe835</i><p>'+ (op.des?op.des:'未编辑选项') +'</p></span>');
            }
        });
    }
    else if(q.type == '3'){
        jd++;
        $('.j-body>p').after('<div class="j-course-list-c unpublished" data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.question_id +'"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div><span class="j-full-width"><textarea>'+q.options[0].answertxt+'</textarea></span></div>');/*'+(q.options[0].answertxt?q.options[0].answertxt:'未编辑答案')+'*/
    }
    else{
        tk++;
        $('.j-body>p').after('<div class="j-course-list-c unpublished" data-type="'+ q.type+'" data-index="'+ i +'" data-id="'+ q.question_id +'"><button class="j-icon">&#xe5cd</button><div>'+(i+1)+'、'+ (q.des?q.des:'未编辑题目') +'</div></div>');
        $(q.options).each(function(j,op){
            $('.j-body>div[data-id="'+ q.question_id+'"]').append('<span data-index="'+ j +'" data-id="'+op.option_id+'"><i class="j-icon">'+(j+1)+'.</i><span><input type="text" value="'+(op.answertxt?op.answertxt:'未编辑答案')+'"/></span></span>');
        });
    }
    $('.j-danx-number').html(danx);$('.j-duox-number').html(duox);$('.j-tk-number').html(tk);$('.j-jd-number').html(jd);
    $('.j-total-number').html(danx+duox+tk+jd);$('.j-total-score').html(totalScore);
};

var initPage = function(){
    danx = 0;duox = 0;tk = 0;jd = 0;totalScore=0;
    $('.j-exam-name').val(examData.info.title);
    $('.j-body').empty().append('<h4>试题预览</h4><p>点击试题进行编辑或点击右上角X删除试题</p>');
    $('.j-create-pan').hide();
    $(examData.questions).each(function(i,q){
        appendQuestion(q,i);
    });
};

var appendEditBlock = function(){
    var appendStr = '<h4>试题编辑</h4>';
    $('.j-create-pan').slideDown().empty();
    if(editData.type == '1'){
        appendStr += '<div data-type="1"><p>单选题——至少设置两个选项，其中有且只有一个为正确答案</p><div class="j-half"><p>分值：</p><span><input class="j-question-input" data-type="score" value="'+(editData.score?editData.score:'')+'" type="number"/></span></div><div class="j-half"><p>难度系数：</p><span><input class="j-question-input" data-type="degree" value="'+(editData.degree?editData.degree:'')+'" type="number"/></span></div><div><p>问题描述：</p><span><textarea class="j-question-textarea" data-type="des">'+(editData.des?editData.des:'')+'</textarea>';
        if(editData.parse){
            appendStr += '</span></div><div><p>题目解析：</p><span><textarea class="j-question-textarea" data-type="parse">'+(editData.parse?editData.parse:'')+'</textarea></span></div><div><p>选项设置：</p>';
            $(editData.options).each(function(i,op){
                appendStr += '<span data-id="'+op.option_id+'" data-index="'+i+'" class="j-option-con"><h4>1</h4><span><input value="'+(op.des?op.des:'')+'" class="j-option-input" type="text"/></span>'+(op.isanswer=='1'?'<i class="j-icon j-set-as-answer active">&#xe86c</i>':'<i class="j-icon j-set-as-answer">&#xe836</i>')+'<p>设为答案</p><i class="j-icon j-remove-option">&#xe9d6</i>';
                if(i==editData.options.length-1){
                    appendStr += '<a class="j-add-option">添加选项</a></span>';
                }else{
                    appendStr += '</span>';
                }
            });
            appendStr += '</div><button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }else{
            appendStr += '<a class="j-add-parse">添加题目解析</a></span></div><div><p>选项设置：</p>';
            $(editData.options).each(function(i,op){
                appendStr += '<span data-id="'+op.option_id+'" data-index="'+i+'" class="j-option-con"><h4>'+(i+1)+'</h4><span><input class="j-option-input" value="'+(op.des?op.des:'')+'" type="text"/></span>'+(op.isanswer=='1'?'<i class="j-icon j-set-as-answer active">&#xe86c</i>':'<i class="j-icon j-set-as-answer">&#xe836</i>')+'<p>设为答案</p><i class="j-icon j-remove-option">&#xe9d6</i>';
                if(i==editData.options.length-1){
                    appendStr += '<a class="j-add-option">添加选项</a></span>';
                }else{
                    appendStr += '</span>';
                }
            });
            appendStr += '</div><button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }
    }else if(editData.type == '2'){
        appendStr += '<div data-type="1"><p>多选题——至少设置两个选项，其中至少有一个为正确答案</p><div class="j-half"><p>分值：</p><span><input class="j-question-input" data-type="score" value="'+(editData.score?editData.score:'')+'" type="number"/></span></div><div class="j-half"><p>难度系数：</p><span><input class="j-question-input" data-type="degree" value="'+(editData.degree?editData.degree:'')+'" type="number"/></span></div><div><p>问题描述：</p><span><textarea class="j-question-textarea" data-type="des">'+(editData.des?editData.des:'')+'</textarea>';
        if(editData.parse){
            appendStr += '</span></div><div><p>题目解析：</p><span><textarea class="j-question-textarea" data-type="parse">'+(editData.parse?editData.parse:'')+'</textarea></span></div><div><p>选项设置：</p>';
            $(editData.options).each(function(i,op){
                appendStr += '<span data-id="'+op.option_id+'" data-index="'+i+'" class="j-option-con"><h4>1</h4><span><input value="'+(op.des?op.des:'')+'" class="j-option-input" type="text"/></span>'+(op.isanswer=='1'?'<i class="j-icon j-set-as-answer active">&#xe834</i>':'<i class="j-icon j-set-as-answer">&#xe835</i>')+'<p>设为答案</p><i class="j-icon j-remove-option">&#xe9d6</i>';
                if(i==editData.options.length-1){
                    appendStr += '<a class="j-add-option">添加选项</a></span>';
                }else{
                    appendStr += '</span>';
                }
            });
            appendStr += '</div><button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }else{
            appendStr += '<a class="j-add-parse">添加题目解析</a></span></div><div><p>选项设置：</p>';
            $(editData.options).each(function(i,op){
                appendStr += '<span data-id="'+op.option_id+'" data-index="'+i+'" class="j-option-con"><h4>1</h4><span><input value="'+(op.des?op.des:'')+'" class="j-option-input" type="text"/></span>'+(op.isanswer=='1'?'<i class="j-icon j-set-as-answer active">&#xe834</i>':'<i class="j-icon j-set-as-answer">&#xe835</i>')+'<p>设为答案</p><i class="j-icon j-remove-option">&#xe9d6</i>';
                if(i==editData.options.length-1){
                    appendStr += '<a class="j-add-option">添加选项</a></span>';
                }else{
                    appendStr += '</span>';
                }
            });
            appendStr += '</div><button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }
    }else if(editData.type == '3'){
        appendStr += '<div data-type="1"><p>简答题</p><div class="j-half"><p>分值：</p><span><input class="j-question-input" data-type="score" value="'+(editData.score?editData.score:'')+'" type="number"/></span></div><div class="j-half"><p>难度系数：</p><span><input class="j-question-input" data-type="degree" value="'+(editData.degree?editData.degree:'')+'" type="number"/></span></div><div><p>问题描述：</p><span><textarea class="j-question-textarea" data-type="des">'+(editData.des?editData.des:'')+'</textarea>';
        if(editData.parse){
            appendStr += '</span></div><div><p>题目解析：</p><span><textarea class="j-question-textarea" data-type="parse">'+(editData.parse?editData.parse:'')+'</textarea></span></div>';
            $(editData.options).each(function(i,op){
                appendStr += '<div data-index="'+i+'" data-id="'+op.option_id+'" class="j-option-con"><p>参考答案：</p><span><textarea class="j-option-textarea" data-type="answer">'+(op.answertxt?op.answertxt:'')+'</textarea></span></div>';
            });
            appendStr += '<button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }else{
            appendStr += '<a class="j-add-parse">添加题目解析</a></span></div>';
            $(editData.options).each(function(i,op){
                appendStr += '<div data-index="'+i+'" data-id="'+op.option_id+'" class="j-option-con"><p>参考答案：</p><span><textarea class="j-option-textarea" data-type="answer">'+(op.answertxt?op.answertxt:'')+'</textarea></span></div>';
            });
            appendStr += '<button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }
    }else{
        appendStr += '<div data-type="1"><p>填空题——先设置试题描述，以下划线_表示需要完成的填空，再编辑答案</p><div class="j-half"><p>分值：</p><span><input class="j-question-input" data-type="score" value="'+(editData.score?editData.score:'')+'" type="number"/></span></div><div class="j-half"><p>难度系数：</p><span><input class="j-question-input" data-type="degree" value="'+(editData.degree?editData.degree:'')+'" type="number"/></span></div><div><p>问题描述：</p><span><textarea class="j-question-textarea" data-type="des">'+(editData.des?editData.des:'')+'</textarea>';
        if(editData.parse){
            appendStr += '</span></div><div><p>题目解析：</p><span><textarea class="j-question-textarea" data-type="parse">'+(editData.parse?editData.parse:'')+'</textarea></span></div><div><p>选项设置：</p>';
            $(editData.options).each(function(i,op){
                appendStr += '<span data-id="'+op.option_id+'" data-index="'+i+'" class="j-option-con"><h4>1</h4><span><input class="j-option-input" value="'+(op.answertxt?op.answertxt:'')+'" type="text"/></span></span>';
            });
            appendStr += '</div><button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }else{
            appendStr += '<a class="j-add-parse">添加题目解析</a></span></div><div class="j-option-contain"><p>填空设置：</p>';
            $(editData.options).each(function(i,op){
                appendStr += '<span data-id="'+op.option_id+'" data-index="'+i+'" class="j-option-con"><h4>1</h4><span><input value="'+(op.answertxt?op.answertxt:'')+'" class="j-option-input" type="text"/></span></span>';
            });
            appendStr += '</div><button class="j-complete-edit">完成编辑</button><button class="j-cancel-edit">删除</button></div>';
        }
    }
    $('.j-create-pan').append(appendStr);
};

var bandEvents = function(){
    if(examData.info.iscompleted == '1') return;
    $('.j-exam-complete').click(function(){
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/publishexam',{exam_id : exam_id},function(data){
            if(data.code == 201){
                location.reload();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });

    $('.j-create-question').click(function(){
        var type = $(this).attr('data-type');
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/addquestion',{exam_id : exam_id,type : type},function(data){
            if(data.code == 201){
                editData = data.datas;
                editData.type = type;
                examData.questions.push(editData);
                editData.index = examData.questions.length - 1;
                appendEditBlock();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });

    //试题编辑
    $('.j-exam-name').on('change',function(){
        var title = $(this).val();
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/updateexam',{exam_id : exam_id,title:title},function(data){
            if(data.code == 201){

            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });

    $('.j-create-pan').on('click','.j-complete-edit',function(){
        if(!($('.j-set-as-answer.active').length) && (editData.type == '1' || editData.type == '2')){
            $.InfoBox('alert','error','无正确答案','请至少设置一个正确答案!');
        }else{
            appendQuestion(editData,examData.questions.length-1);
            $('.j-create-pan').slideUp();
            initPage();
        }
    }).on('click','.j-cancel-edit',function(){
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/delquestion',{question_id : editData.question_id},function(data){
            if(data.code == 201){
                examData.questions.splice(editData.index,1);
                initPage();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
        $('.j-create-pan').slideUp();
    }).on('click','.j-set-as-answer',function(){
        var me = this;
        var option_id = $(me).parent('span').attr('data-id');
        var index = $(me).parent('span').attr('data-index');
        var question_id = editData.question_id;
        var type = editData.type;
        if(type == '1'){
            if(!$(me).hasClass('active')){
                sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/setanswer',{question_id : question_id,option_id : option_id,isanswer : '1',type : type},function(data){
                    if(data.code == 201){
                        $('.j-create-pan i.active').removeClass('active').html('&#xe836');
                        $(me).addClass('active').html('&#xe86c');
                        examData.questions[editData.index].options[parseInt($('.j-create-pan .j-set-as-answer.active').parent('span').attr('data-index'))].isanswer = editData.options[parseInt($('.j-create-pan i.active').parent('span').attr('data-index'))].isanswer = '0';
                        examData.questions[editData.index].options[index].isanswer = editData.options[index].isanswer = '1';
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }else if(type == '2'){
            if($(me).hasClass('active')){
                sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/setanswer',{question_id : question_id,option_id : option_id,isanswer : '0',type : type},function(data){
                    if(data.code == 201){
                        examData.questions[editData.index].options[index].isanswer = editData.options[index].isanswer = '0';
                        $(me).removeClass('active').html('&#xe835');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }else{
                sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/setanswer',{question_id : question_id,option_id : option_id,isanswer : '1',type : type},function(data){
                    if(data.code == 201){
                        $(me).addClass('active').html('&#xe834');
                        examData.questions[editData.index].options[index].isanswer = editData.options[index].isanswer = '1';
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }
    }).on('change','.j-question-input',function(){
        var me = this;
        var question_id = editData.question_id;
        var sendData = {question_id : question_id};
        sendData[$(me).attr('data-type')] = $(me).val();
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/updatequestion',sendData,function(data){
            if(data.code == 201){
                examData.questions[editData.index][[$(me).attr('data-type')]] = editData[[$(me).attr('data-type')]] = $(me).val();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('change','.j-question-textarea',function(){
        var me = this;
        var question_id = editData.question_id;
        var sendData = {question_id : question_id};
        var text = $(me).val();
        if(editData.type == '4' && $(me).attr('data-type')=='des'){
            while(text.indexOf('__') >= 0){
                text.replace('__','_');
            }
            $(me).val(text);
        }
        sendData[$(me).attr('data-type')] = text;

        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/updatequestion',sendData,function(data){
            if(data.code == 201){
                examData.questions[editData.index][[$(me).attr('data-type')]] = editData[[$(me).attr('data-type')]] = $(me).val();
                if(!editData.options){
                    editData.options = [];
                    examData.questions[editData.index].options = [];
                }
                if(editData.type == '4'&& $(me).attr('data-type')=='des'){
                    var optionLength = text.split('_').length - 1, i,thisOptionId;
                    if(optionLength > editData.options.length){
                        for(i=0;i<(optionLength-editData.options.length);i++){
                            sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/addoption',{exam_id:exam_id,question_id:editData.question_id},function(data){
                                if(data.code == 201){
                                    $('.j-option-contain').append('<span data-id="'+data.datas.option_id+'" data-index="'+editData.options.length+'" class="j-option-con"><h4>1</h4><span><input value="" class="j-option-input" type="text"/></span></span>');
                                    examData.questions[editData.index].options.push({option_id:data.datas.option_id});
                                    //editData.options.push({option_id:data.datas.option_id});
                                }else if(data.code === 204){
                                    $.InfoBox('alert','error','错误',data.err.toString());
                                }else{
                                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                                }
                            });
                        }
                    }else if(optionLength < editData.options.length){
                        var delArray = [];
                        for(i=0;i<(editData.options.length-optionLength);i++){
                            thisOptionId = editData.options[editData.options.length-1].option_id;
                            delArray.push({option_id:thisOptionId});
                        }
                        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/deloption_blank',{option_ids:JSON.stringify(delArray)},function(data){
                            if(data.code == 201){
                                $(delArray).each(function(k,a){
                                    $('.j-option-con[data-id="'+ a.option_id+'"]').remove();
                                    examData.questions[editData.index].options.pop();
                                    editData.options.pop();
                                });
                            }else if(data.code === 204){
                                $.InfoBox('alert','error','错误',data.err.toString());
                            }else{
                                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                            }
                        });
                    }
                }
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('change','.j-option-input',function(){
        var me = this;
        var sendData = {
            option_id : $(me).parent('span').parent('span').attr('data-id'),
            type : editData.type,
            num : $(me).parent('span').parent('span').attr('data-index'),
            answer : $(me).val()
        };
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/updateoption',sendData,function(data){
            if(data.code == 201){
                examData.questions[editData.index].options[parseInt($(me).parent('span').parent('span').attr('data-index'))].des =examData.questions[editData.index].options[parseInt($(me).parent('span').parent('span').attr('data-index'))].answertxt = sendData.answer;
                examData.questions[editData.index].options[parseInt($(me).parent('span').parent('span').attr('data-index'))].num = sendData.num;
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('change','.j-option-textarea',function(){
        var me = this;
        var sendData = {
            option_id : $(me).parent('span').parent('div').attr('data-id'),
            type : editData.type,
            num : $(me).parent('span').parent('div').attr('data-index'),
            answer : $(me).val()
        };
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/updateoption',sendData,function(data){
            if(data.code == 201){
                examData.questions[editData.index].options[parseInt($(me).parent('span').parent('span').attr('data-index'))].des =examData.questions[editData.index].options[parseInt($(me).parent('span').parent('span').attr('data-index'))].answertxt = sendData.answer;
                examData.questions[editData.index].options[parseInt($(me).parent('span').parent('span').attr('data-index'))].num = sendData.num;
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('click','.j-remove-option',function(){
        var me = this;
        var option_id = $(me).parent('span').attr('data-id');
        var index = parseInt($(me).parent('span').attr('data-index'));
        if(examData.questions[editData.index].options.length <3){
            $.InfoBox('alert','error','选项过少','至少需要2个选项！');
            return;
        }
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/deloption',{option_id : option_id},function(data){
            if(data.code == 201){
                examData.questions[editData.index].options.splice(index, 1);
                $(me).parent('span').remove();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('click','.j-add-option',function(){
        var me = this;
        var index = $('.j-option-con').length;
        var option_id;
        var type = editData.type;
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/addoption',{exam_id:exam_id,question_id : editData.question_id},function(data){
            if(data.code == 201){
                option_id = data.datas.option_id;
                examData.questions[editData.index].options.push({option_id:option_id});
                editData.options.push({option_id:option_id});
                if(type == '1'){
                    $(me).parent('span').after('<span data-index="'+index+'" data-id="'+option_id+'"><h4>'+(index+1)+'</h4><span><input type="text"/></span><i class="j-icon j-set-as-answer">&#xe836</i><p>设为答案</p><i class="j-icon j-remove-option">&#xe9d6</i><a class="j-add-option">添加选项</a></span>');
                }else{
                    $(me).parent('span').after('<span data-index="'+index+'" data-id="'+option_id+'"><h4>'+(index+1)+'</h4><span><input type="text"/></span><i class="j-icon j-set-as-answer">&#xe835</i><p>设为答案</p><i class="j-icon j-remove-option">&#xe9d6</i><a class="j-add-option">添加选项</a></span>');
                }
                $(me).remove();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }).on('click','.j-add-parse',function(){
        var me = this;
        $(me).parent('span').parent('div').after('<div><p>题目解析：</p><span><textarea class="j-question-textarea" data-type="parse"></textarea></span></div>');
        $(me).remove();
    });

    $('.j-body').on('click','.j-course-list-c',function(){
        var index = parseInt($(this).attr('data-index'));
        var type = $(this).attr('data-type');
        editData = examData.questions[index];
        editData.index = index;
        appendEditBlock();
    }).on('click','button',function(){
        var me = this;
        var index = parseInt($(this).parent('div').attr('data-index'));
        var type = $(this).parent('div').attr('data-type');
        var question_id = $(this).parent('div').attr('data-id');
        sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/delquestion',{question_id : question_id},function(data){
            if(data.code == 201){
                examData.questions.splice(index,1);
                initPage();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
        return false;
    });
};

$(function(){
    exam_id = window.location.hash.split("#")[1];
    sendMessage('post',(ports.exam.domain == location.host ? ports.exam.domain : ''),'/question/develop/getexam',{exam_id : exam_id},function(data){
        if(data.code == 201){
            examData = data.datas;
            initPage();
            bandEvents();
            if(examData.info.iscompleted == '1'){
                //$('.j-course-list-c>button').remove();
                $('.j-course-list-c').removeClass('unpublished');
                $('.j-create-question').addClass('published');
                $('.j-exam-complete').remove();
                $('.j-exam-name').css({'paddingRight':'10px'});
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
});