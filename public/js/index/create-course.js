//存储全局需要用的变量定义
var areaInfo,
    situationInfo = [],
    maxNum = 0,
    type;
var editOne,
    onCreate = false,
    context = {},
    taskData;
var view,
    database,
    windowHeight,
    windowWidth,
    mainDiv = $('.j-file-main'),
    onlyOfficing = false,
    publish = false;
//请求（AJAX）集中写在这
var sendPublish = function(id,callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/completedcoursechild',{course_child_id:id},function(data){
        if(data.code === 201){
            callback();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var delExam = function(callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/updatetask',{task_id : context.task_id,exam_id : ''},function(data){
        if(data.code === 201){
            callback();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var submitExam = function(callback){
    sendMessage('post',(ports.exam.domain === location.origin ? ports.exam.domain : ''),'/question/develop/addexam',{title : context.examData.name},function(data){
        if(data.code === 201){
            if(areaInfo.info.type === '1'){
                var sendData;
                if(context.section_id){
                    sendData = {
                        section_id : context.section_id,
                        exam_id : data.datas.exam_id,
                        type : '2'
                    };
                    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionoperation',sendData,function(data2){
                        if(data2.code === 201){
                            callback(data.datas);
                        }else if(data2.code === 204){
                            $.InfoBox('alert','error','错误',data2.err.toString());
                        }else{
                            $.InfoBox('alert','error','用户信息错误','请重新登录！');
                            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                        }
                    });
                }else{
                    sendData = {
                        section_child_id : context.section_child_id,
                        exam_id : data.datas.exam_id,
                        type : '2'
                    };
                    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionchildoperation',sendData,function(data2){
                        if(data2.code === 201){
                            callback(data.datas);
                        }else if(data2.code === 204){
                            $.InfoBox('alert','error','错误',data2.err.toString());
                        }else{
                            $.InfoBox('alert','error','用户信息错误','请重新登录！');
                            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                        }
                    });
                }

            }else{
                sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/updatetask',{task_id : context.task_id,exam_id : data.datas.exam_id},function(data2){
                    if(data2.code === 201){
                        callback(data.datas);
                    }else if(data2.code === 204){
                        $.InfoBox('alert','error','错误',data2.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
            $('.j-edit-block').hide();
            $('.j-nav-back').hide();
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var updateTxt = function(data,callback){
    if(areaInfo.info.type === '1'){
        data.type = '2';
        if(data.section_id){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionoperation',data,function(data){
                if(data.code === 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionchildoperation',data,function(data){
                if(data.code === 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    }else{
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/updatetaskele',data,function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }
};

var removeTaskEle = function(id,callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/deltaskele',{task_ele_id : id},function(data){
        if(data.code === 201){
            callback();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var onDownloadAs = function(event){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/downloadOfficeFile_dev?id='+ context.onlineEditData.key +'&url='+ escape(event.data),{id:context.onlineEditData.key,url:escape(event.data)},function(data){
        if(data.code === 201){
            $('.j-edit-pan').empty();
            onlyOfficing = false;
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var addOnlyTask = function(callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addtaskele?'+(context.task_id?('task_id='+context.task_id):('step_id='+context.step_id))+'&type=office&ele='+ context.ele +'&belong='+ context.belong+'&filename='+ context.onlineEditData.filename+'&filetype='+ context.onlineEditData.filetype,{},function(data){
        if(data.code === 201){
            callback(data.datas);
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var saveTxt = function(sendData,callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addtaskele?task_id='+ sendData.task_id +'&type=text&ele='+ sendData.ele +'&belong='+ sendData.belong,{txt:sendData.txt},function(data){
        if(data.code === 201){
            callback(data.datas);
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var sendForm = function(callback){
    if(context.editType === 'create'){
        if(context.level === 'situation'){
            context.num = maxNum +1;
            maxNum = maxNum + 1;
            context.course_id = areaInfo.info.course_id;
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addcoursechild',context,function(data){
                if(data.code === 201){
                    context.course_child_id = data.datas.course_child_id;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'activity'){
            context.course_id = areaInfo.info.course_id;
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addactivity',context,function(data){
                if(data.code === 201){
                    context.activity_id = data.datas.activity_id;
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'step'){
            context.course_id = areaInfo.info.course_id;
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addstep',context,function(data){
                if(data.code === 201){
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'task'){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addtask',context,function(data){
                if(data.code === 201){
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'section'){
            context.type = '1';
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionoperation',context,function(data){
                if(data.code === 201){
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'section_child'){
            context.type = '1';
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionchildoperation',context,function(data){
                if(data.code === 201){
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    }else if(context.editType === 'edit'){
        if(context.level === 'situation'){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/updatecoursechild',context,function(data){
                if(data.code === 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'activity'){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/updateactivity',context,function(data){
                if(data.code === 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'step'){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addcoursechild',context,function(data){
                if(data.code === 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'task'){
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/updatetask',context,function(data){
                if(data.code === 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'section'){
            context.type = '2';
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionoperation',context,function(data){
                if(data.code === 201){
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(context.level === 'section_child'){
            context.type = '2';
            sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionchildoperation',context,function(data){
                if(data.code === 201){
                    callback(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    }
};

var moveEles = function(id,type,direction,callback){
    if(type === 'situation'){

    }else if(type === 'activity'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/exchangeactivity',{activity_id : id,type : direction},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(type === 'step'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/exchangestep',{step_id : id,type : direction},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }
};

var removeEles = function(id,type,callback){
    if(type === 'situation'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/delcoursechild',{course_child_id : id},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(type === 'activity'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/delactivity',{activity_id : id},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(type === 'step'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/delstep',{step_id : id},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(type === 'task'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/deltask',{task_id : id},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(type === 'section'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionoperation',{section_id : id,type:'3'},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }else if(type === 'section_child'){
        sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/subject/sectionchildoperation',{section_child_id : id,type:'3'},function(data){
            if(data.code === 201){
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    }
};

var getAreaInfo = function(course_id,callback){
    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getcourse',{course_id : course_id},function(data){
        if(data.code === 201){
            areaInfo = data.datas;
            type = data.datas.info.type;
            callback();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var getSituation = function(id,callback){
    sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/develop/getcourse_child',{course_child_id : id},function(data){
        if(data.code === 201){
            if(areaInfo.info.type === '1'){
                sendMessage('post',(ports.course.domain === location.host ? ports.course.domain : ''),'/course/subject/searchsections',{course_child_id : id},function(data2){
                    if(data2.code === 201){
                        data.datas.sectionData = data2.datas;
                        situationInfo.push(data.datas);
                        callback();
                    }else if(data2.code === 204){
                        $.InfoBox('alert','error','错误',data2.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }else{
                situationInfo.push(data.datas);
                callback();
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var getStepInfo = function(callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/getstep',{step_id : context.step_id},function(data){
        if(data.code === 201){
            var id = context.step_id;
            context = data.datas.eles;
            context.step_id = id;
            context.ele = 'task_result';
            callback(data.datas);
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var getTaskInfo = function(id,callback){
    sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/gettask',{task_id : id},function(data){
        if(data.code === 201){
            callback(data.datas);
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};
//view
var refrashTree = function(){
    getAreaInfo(window.location.hash.split("#")[1],function(){
        //情景树
        var k = 0;
        situationInfo = [];
        $(areaInfo.childs).each(function(i,c){
            getSituation(c.course_child_id,function(data){
                k++;
                if(k === areaInfo.childs.length){
                    createTree();
                }
            });
        });
    });
};

var setSize = function(){
    var width = window.innerWidth,
        height = window.innerHeight;

    $('.j-list').css({'height':height - 330});
    $('.j-form').css({'height':height - 300});
    $('.j-right').css({'height':height - 260});
};

var createTree = function(){
    var initActivities = function(activeId,activities,type,content,index,publish){
        var contain;
        if(areaInfo.info.type === '1'){
            $(content).append('<div data-index="'+ index +'" class="j-list-one" data-level="1" data-id="'+ activeId +'"><i data-open="0" class="j-icon j-toggle">&#xe409</i><p title="'+ activities[activeId].title +'">'+ activities[activeId].title +'</p>'+(publish?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span>':'')+'</div>');
        }else{
            $(content).append('<div data-index="'+ index +'" class="j-list-one" data-level="1" data-id="'+ activeId +'"><i data-open="0" class="j-icon j-toggle">&#xe409</i><p title="'+ activities[activeId].title +'">活动'+ (index + 1) + ' ' + activities[activeId].title +'</p>'+(publish?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span>':'')+'</div>');
        }

        contain = document.createElement('div');$(contain).attr('data-cid',activeId).css({'display':'none'});
        $(content).append(contain);
        if(activities[activeId].next_step_id !== '-1' && activities[activeId].next_step_id!==activeId){
            initActivities(activities[activeId].next_step_id,activities,type,content,index + 1,publish);
        }
        for(var stepId in activities[activeId].steps){
            if(activities[activeId].steps.hasOwnProperty(stepId)){
                if(activities[activeId].steps[stepId].is_startstep === '1'){
                    initSteps(stepId,activities[activeId].steps,type,activeId,0,contain,0,publish);
                }
            }
        }
    };

    var initSteps = function(stepId,steps,type,activeId,j,content,index,publish){
        if(type === '0'){
            $(steps[stepId].tasks).each(function(i,task){
                $(content).append('<div data-index="'+ index +'" class="j-list-one" data-level="2" data-step-id="'+ steps[stepId].step_id +'" data-id="'+ task.task_id +'"><p title="'+ (task.title?task.title:'未命名任务') +'">'+ (task.title?task.title:'未命名任务') +'</p>'+(publish?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span>':'')+'</div>')
            });
        }else{
            $(content).append('<div data-index="'+ index +'" class="j-list-one" data-level="2" data-id="'+ steps[stepId].step_id +'"><i data-open="0" class="j-icon j-toggle">&#xe409</i><p title="步骤' + (j+1) +'">步骤'+ (j+1) +'</p>'+(publish?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span>':'')+'</div>');
            var contain = document.createElement('div');$(contain).attr('data-cid',steps[stepId].step_id).css({'display':'none'});
            $(content).append(contain);
            $(steps[stepId].tasks).each(function(i,task){
                $(contain).append('<div data-index="'+ i +'" class="j-list-one" data-level="3" data-id="'+ task.task_id +'"><p title="'+ (task.title?task.title:'未命名任务') +'">'+ (task.title?task.title:'未命名任务') +'</p>'+(publish?'<span class="j-icon j-remove">&#xe9d6</span>':'')+'</div>');
            });
        }
        if(steps[stepId].next_step_id !== '-1' && steps[stepId].next_step_id!==stepId){
            initSteps(steps[stepId].next_step_id,steps,type,activeId,j+1,content,index+1,publish);
        }
    };

    //情景按num排序
    var i, j,tmp;
    if(situationInfo.length>1){
        for(i = 0;i<situationInfo.length;i++){
            if(maxNum < parseInt(situationInfo[i].num)){
                maxNum = parseInt(situationInfo[i].num);
            }
            for(j = (i+1);j<situationInfo.length;j++){
                if(parseInt(situationInfo[i].num) > parseInt(situationInfo[j].num)){
                    tmp = situationInfo[i];
                    situationInfo[i] = situationInfo[j];
                    situationInfo[j] = tmp;
                }
            }
        }
    }

    $('.j-list').empty();
    var contain;
    $(situationInfo).each(function(i,s){
        contain = document.createElement('div');
        if(areaInfo.info.type === '1'){
            $('.j-list').append('<div class="j-list-one" data-level="0" data-index="'+ i +'" data-id="'+ s.course_child_id +'"><span data-open="0" class="j-icon j-toggle">&#xe409</span><h4>第'+ (i+1) +'章</h4><p title="'+ s.title +'">'+ s.title +'</p>'+(s.iscompleted === '0'?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span>':'')+'</div>')
                .append(contain);$(contain).attr('data-cid',s.course_child_id).css({'display':'none'});
        }else{
            $('.j-list').append('<div class="j-list-one" data-level="0" data-index="'+ i +'" data-id="'+ s.course_child_id +'"><span data-open="0" class="j-icon j-toggle">&#xe409</span><h4>情境'+ (i+1) +'</h4><p title="'+ s.title +'">'+ s.title +'('+ (s.type==='0'?'单人课程':'多人课程')+ ')' +'</p><button class="j-publish" data-publish="'+s.iscompleted+'">'+ (s.iscompleted === '0'?'发布':'已发布') +'</button>'+(s.iscompleted === '0'?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span>':'')+'</div>')
                .append(contain);$(contain).attr('data-cid',s.course_child_id).css({'display':'none'});
        }
        if(areaInfo.info.type === '1'){
            $(s.sectionData).each(function(j,se){
                var con;
                $(contain).append('<div data-index="'+ j +'" class="j-list-one" data-level="1" data-id="'+ se.section_id +'"><i data-open="0" class="j-icon j-toggle">&#xe409</i><p title="第'+(j+1)+'节">第'+ (j+1)+'节 '+(se.title?se.title:'未命名节')+'</p>'+(s.iscompleted === '0'?'<span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span>':'')+'</div>');
                con = document.createElement('div');$(con).attr('data-cid',se.section_id).css({'display':'none'});
                $(contain).append(con);
                $(se.childs).each(function(k,sc){
                    var child_con;
                    $(con).append('<div data-index="'+ k +'" class="j-list-one" data-level="2" data-id="'+ sc.section_child_id +'"><p title="第'+(k+1)+'小节">第'+ (k+1)+'小节 '+(sc.title?sc.title:'未命名小节')+'</p>'+(s.iscompleted === '0'?'<span class="j-icon j-remove">&#xe9d6</span>':'')+'</div>');
                    child_con = document.createElement('div');$(child_con).attr('data-cid',se.section_child_id).css({'display':'none'});
                    $(con).append(child_con);
                });
            });
        }else{
            for(var activeId in s.activities){
                if(s.activities.hasOwnProperty(activeId)){
                    if(s.activities[activeId].is_startstep === '1'){
                        initActivities(activeId,s.activities,s.type,contain,0,s.iscompleted === '0');
                    }
                }
            }
        }

    });
};

var setType = function(id){
    if(id){
        $(situationInfo).each(function(i,s){
            if(s.course_child_id === id){
                type = s.type;
            }
        });
    }else{
        type = '0';
    }
};

var createOnlyOffice = function(data){
    var documentType;
    if(data.filetype === 'doc' || data.filetype === 'docx'){
        documentType = 'text';
    }else if(data.filetype === 'xls' || data.filetype === 'xlsx'){
        documentType = 'spreadsheet';
    }else if(data.filetype === 'ppt' || data.filetype === 'pptx'){
        documentType = 'presentation';
    }
    var officeConfig = {
        height : window.innerHeight - 150,
        width : '100%',
        "document": {
            "fileType": data.filetype,
            "key": data.key,
            "title": data.filename + '.' + data.filetype,
            "url":(ports.course.domain?ports.course.domain:window.location.origin) + '/course/develop/downtaskfile?id='+data.key+'&type=dev'
        },
        events : {
            onDownloadAs : onDownloadAs
        },
        "documentType": documentType
    };
    if(publish){
        officeConfig.editorConfig = {mode:'view'};
    }
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div id="onlyOffice'+data.key+'"></div>');
    if(window.docEditor){
        window.docEditor = new DocsAPI.DocEditor("onlyOffice"+data.key,officeConfig);
    }else{
        pullInJavascript([ports.onlyOffice.domain+'/web-apps/apps/api/documents/api.js'],function(){
            window.docEditor = new DocsAPI.DocEditor("onlyOffice"+data.key,officeConfig);
        });
    }
    onlyOfficing = true;
};

var insertForm = function(level,courseData,course_child_id){console.log(courseData)
    $('.j-right>span').show();
    publish = false;
    if(course_child_id){
        $(situationInfo).each(function(i,e){
            if(e.course_child_id === course_child_id){
                if(e.iscompleted === '1') publish = true;
            }
        });
    }
    if(publish) $('.j-right>span').html('*已经发布的内容无法再进行编辑！');
    $('.j-form').show();
    $('.j-form').empty();
    context = courseData?courseData:{};
    context.level = level;
    context.editType = courseData?'edit':'create';
    var uls,
        input,
        resStr,
        isSingle,
        preView;
    setType(course_child_id);
    if(publish){
        preView = '预览';
    }else{
        preView = '编辑';
    }
    var getTaskInStr = function(ele,data,i){
        if(data.type === 'text'){
            return '<div class="j-ele-list-one" data-index="' + i + '" data-ele="'+ ele +'" data-type="text" data-id="' + data.task_ele_id + '"><h4>文本文件</h4><p>文本</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-preview">'+ preView +'</span></div>';
        }else if(data.type === 'upload'){
            return '<div class="j-ele-list-one" data-index="' + i + '" data-ele="'+ ele +'" data-type="upload" data-id="' + data.task_ele_id + '"><h4>'+ data.filename + '.' + data.filetype +'</h4><p>上传</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-preview">'+ preView +'</span></div>';
        }else if(data.type === 'office'){
            return '<div class="j-ele-list-one" data-index="' + i + '" data-ele="'+ ele +'" data-type="office" data-id="' + data.task_ele_id + '"><h4>'+ data.filename + '.' + data.filetype +'</h4><p>在线编辑</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-preview">'+ preView +'</span></div>';
        }else if(data.type === 'cloud_file'){
            return '<div class="j-ele-list-one" data-index="' + i + '" data-ele="'+ ele +'" data-type="cloud_file" data-id="' + data.task_ele_id + '"><h4>'+ data.filename + '.' + data.filetype +'</h4><p>云文件</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-preview">'+ preView +'</span></div>';
        }
    };
    if(courseData){
        if(level === 'situation'){
            context.id = courseData.course_child_id;
            if(areaInfo.info.type === '1'){
                $('.j-form').show().append('<h4>以下为必填项，每项都需填写完整</h4><div>'+
                    '<p>名称</p><input data-name="title" value="'+courseData.title+'" type="text"/></div>'+
                    '<div><p>课时数</p><input data-name="period" value="'+courseData.period+'" type="number"/></div>');
            }else{
                $('.j-form').show().append('<h4>以下为必填项，每项都需填写完整</h4><div>'+
                    '<p>名称</p><input data-name="title" value="'+courseData.title+'" type="text"/></div>'+
                    '<div><p>课程图片</p><div class="img"><img class="j-course-img" src="'+(courseData.pngpath?(ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/downloadpng?path='+courseData.pngpath:'/img/default/course.png')+'"/><p>更换图片(400*300)</p><form id="img-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-img-upload" type="file" name="file"></form></div></div>'+
                    '<div><p>课时数</p><input data-name="period" value="'+courseData.period+'" type="number"/></div>'+
                    '<div><p>描述</p><textarea data-name="des">'+courseData.des+'</textarea></div>'+
                    '<div><p>工作任务</p><textarea data-name="task">'+courseData.task+'</textarea></div>'+
                    '<h4>以下非必填项，选择其中一项或多项填写</h4>'+
                    '<div><ul><li data-name="workflow">工作过程</li><li data-name="target">目标</li><li data-name="content">内容</li><li data-name="keynote">重难点</li><li data-name="for_use_people">适用人群</li></ul>'+
                    '<textarea data-name="workflow">'+(courseData.workflow?courseData.workflow:'')+'</textarea><textarea data-name="target">'+(courseData.target?courseData.target:'')+'</textarea><textarea data-name="content">'+(courseData.content?courseData.content:'')+'</textarea><textarea data-name="keynote">'+(courseData.keynote?courseData.keynote:'')+'</textarea><textarea data-name="for_use_people">'+(courseData.for_use_people?courseData.for_use_people:'')+'</textarea></div>'+
                    '<div><ul><li data-name="teacher_introduction">教师介绍</li><li data-name="tool">工具</li><li data-name="method">工作方法与组织方式</li><li data-name="jobreq">工作需求</li><li data-name="pqs">职业资格标准</li></ul>'+
                    '<textarea data-name="teacher_introduction">'+(courseData.teacher_introduction?courseData.teacher_introduction:'')+'</textarea><textarea data-name="tool">'+(courseData.tool?courseData.tool:'')+'</textarea><textarea data-name="method">'+(courseData.method?courseData.method:'')+'</textarea><textarea data-name="jobreq">'+(courseData.jobreq?courseData.jobreq:'')+'</textarea><textarea data-name="pqs">'+(courseData.pqs?courseData.pqs:'')+'</textarea></div>');
            }
            uls = $('.j-form ul');
            uls.eq(0).find('li').eq(0).click();
            uls.eq(1).find('li').eq(0).click();
            input = $('.j-form input');
            input.eq(0).focus();
            putCursorEnd(input);
        }else if(level === 'activity'){
            context.id = courseData.course_child_id;
            $('.j-form').show().append('<h4>以下为必填项，每项都需填写完整</h4><div>'
                +'<p>名称</p><input data-name="title" value="'+courseData.title+'" type="text"/></div>'+
                '<div><p>课时数</p><input data-name="period" value="'+courseData.period+'" type="number"/></div>'+
                '<div><p>描述</p><textarea data-name="des">'+courseData.des+'</textarea></div>');
            input = $('.j-form input');
            input.eq(0).focus();
            putCursorEnd(input);
        }else if(level === 'step'){
            getStepInfo(function(data){
                resStr = '<div class="j-edit-select"><p>添加合作文件</p><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input class="j-task-upload step" title="点击选择文件" type="file" name="myfile"></form></span><p class="j-task-edit-online step">在线编辑</p><p class="j-task-cloud step">选择云文件</p></div></span></div><div class="j-edit-list">';
                if(data.eles.task_result.length){
                    $(data.eles.task_result).each(function(i,des){
                        resStr += getTaskInStr('task_result',des,i);
                    });
                }
                resStr += '</div>';
                $('.j-form').show().append(resStr);
            });
        }else if(level === 'task'){
            getTaskInfo(editOne.attr('data-id'),function(taskdata) {
                context = taskdata;
                context.level = level;
                context.editType = courseData?'edit':'create';
                context.id = editOne.attr('data-id');
                resStr = '<h4>必填项目</h4><div><p>标题</p><input class="j-task-title" data-id="' + courseData.task_id + '" data-name="title" value="' + (taskdata.title ? taskdata.title : '') + '" type="text"/></div>';
                if(type === '1') resStr += '<div><p>角色</p><input class="j-task-rolename" data-id="' + taskdata.task_id + '" data-name="rolename" value="' + (taskdata.rolename ? taskdata.rolename : '') + '" type="text"/></div><div><p>是否协作学习</p><select class="j-task-iscooperation" data-name="iscooperation">' + (taskdata.iscooperation === "0" ? '<option value="0" checked>不参与协作学习</option><option value="1">参与协作学习</option>' : '<option value="1" checked>参与协作学习</option><option value="0">不参与协作学习</option>') + '</select></div>';
                resStr += '<h4 class="active">描述&资料</h4>' +
                    '<div><div class="j-edit-tab-title"><p data-level="des">任务描述</p><p data-level="theory">理论知识点</p></div>' +
                    '<div class="j-edit-tab-body" data-level="des">' +
                    '<div class="j-edit-select"><p>添加一个描述：</p><span class="j-task-html">富文本</span><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input title="点击选择文件" class="j-task-upload" type="file" name="myfile"></form></span><p class="j-task-edit-online">在线编辑</p><p class="j-task-cloud">选择云文件</p></div></span></div>' +
                    '<div class="j-edit-list">';
                if (taskdata.des) {
                    $(taskdata.des).each(function (i, des) {
                        resStr += getTaskInStr('des',des,i);
                    });
                }
                resStr += '</div></div><div class="j-edit-tab-body" data-level="theory"><div class="j-edit-select"><p>添加一个知识点：</p><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input title="点击选择文件" class="j-task-upload" type="file" name="myfile"></form></span><p class="j-task-cloud">选择云文件</p></div></span></div><div class="j-edit-list">';
                if (taskdata.theory) {
                    $(taskdata.theory).each(function (i, theory) {
                        resStr += getTaskInStr('theory',theory,i);
                    });
                }
                resStr += '</div></div></div><h4 class="active">任务&试题</h4><div><div class="j-edit-tab-title"><p data-level="task_result">输出</p><p data-level="exam">试题</p></div>' +
                    '<div class="j-edit-tab-body" data-level="task_result"><div class="j-edit-select"><p>添加一个任务模板：</p><span class="j-task-html">富文本</span><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input class="j-task-upload" title="点击选择文件" type="file" name="myfile"></form></span><p class="j-task-edit-online">在线编辑</p><p class="j-task-cloud">选择云文件</p></div></span></div><div class="j-edit-list">';
                if (taskdata.task_result) {
                    $(taskdata.task_result).each(function (i, task_result) {
                        resStr += getTaskInStr('task_result',task_result,i);
                    });
                }
                resStr += '</div></div><div class="j-edit-tab-body" data-level="exam"><div class="j-edit-select"><p>添加一个试题：</p><span class="j-task-create-exam">创建</span></div><div class="j-edit-list">';
                if (taskdata.exam_id) {
                    /* $(courseData.exam).each(function(i,exam){*/
                    resStr += '<div class="j-ele-list-one" data-ele="exam" data-id="' + taskdata.exam_id + '"><h4>'+ taskdata.exam_title +'</h4><p>试题</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-preview">'+ preView +'</span></div>';
                    /*});*/
                }
                resStr += '</div></div></div>';
                $('.j-form').show().append(resStr);
                uls = $('.j-edit-tab-title');
                uls.eq(0).find('p').eq(0).click();
                uls.eq(1).find('p').eq(0).click();
                input = $('.j-form input');
                input.eq(0).focus();
                putCursorEnd(input);
            });
        }else if(level === 'section'){
            $('.j-form').show().append('<h4>填写以下项目来完成您的编辑</h4><div><p>标题</p><input data-name="title" type="text" value="'+(context.title?context.title:'')+'"/></div>'+
            '<div><p>文本资料</p>'+(context.txt?'<button class="j-section-edit-txt">编辑</button><button class="j-section-remove-txt">删除</button>':'<button class="j-section-add-txt">添加</button>')+'</div>'+
            '<div><p>视频资料</p>'+(context.videoname?'<span class="j-section-video">'+context.videoname+'</span><button class="j-section-remove-video">删除</button>':'<span class="j-video-upload"><button>上传</button><form id="video-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-video-upload" type="file" name="file"></form></span>')+'</div>'+
            '<div><p>试题</p>'+(context.exam_id?'<button class="j-section-edit-exam">编辑</button><button class="j-section-remove-exam">删除</button>':'<button class="j-section-add-exam">添加</button>')+'</div>');
        }else if(level === 'section_child'){
            $('.j-form').show().append('<h4>填写以下项目来完成您的编辑</h4><div><p>标题</p><input data-name="title" type="text" value="'+(context.title?context.title:'')+'"/></div>'+
                '<div><p>文本资料</p>'+(context.txt?'<button class="j-section-edit-txt">编辑</button><button class="j-section-remove-txt">删除</button>':'<button class="j-section-add-txt">添加</button>')+'</div>'+
                '<div><p>视频资料</p>'+(context.videoname?'<span class="j-section-video">'+context.videoname+'</span><button class="j-section-remove-video">删除</button>':'<span class="j-video-upload"><button>上传</button><form id="video-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-video-upload" type="file" name="file"></form></span>')+'</div>'+
                '<div><p>试题</p>'+(context.exam_id?'<button class="j-section-edit-exam">编辑</button><button class="j-section-remove-exam">删除</button>':'<button class="j-section-add-exam">添加</button>')+'</div>');
        }
    }else{
        if(level === 'situation'){
            if(areaInfo.info.type === '1'){
                $('.j-form').show().append('<h4>以下为必填项，每项都需填写完整。其中“课程类型”设置了后无法修改，请谨慎选择</h4><div>'+
                    '<p>名称</p><input data-name="title" type="text"/></div>'+
                    '<div><p>课时数</p><input data-name="period" type="number"/></div>');
            }else{
                $('.j-form').show().append('<h4>以下为必填项，每项都需填写完整。其中“课程类型”设置了后无法修改，请谨慎选择</h4><div>'+
                    '<p>名称</p><input data-name="title" type="text"/></div>'+
                    '<div><p>课程图片</p><div class="img"><img class="j-course-img" src="/img/default/course.png"/><p>更换图片(400*300)</p><form id="img-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-img-upload" type="file" name="file"></form></div></div>'+
                    '<div><p>课时数</p><input data-name="period" type="number"/></div>'+
                    '<div><p>描述</p><textarea data-name="des"></textarea></div>'+
                    '<div><p>工作任务</p><textarea data-name="task"></textarea></div>'+
                    '<div><p>课程类型</p><select data-name="type"><option value="0">单人课程</option><option value="1">多人课程</option> </select></div>'+
                    '<h4>以下非必填项，选择其中一项或多项填写</h4>'+
                    '<div><ul><li data-name="workflow">工作过程</li><li data-name="target">目标</li><li data-name="content">内容</li><li data-name="keynote">重难点</li><li data-name="for_use_people">适用人群</li></ul>'+
                    '<textarea data-name="workflow"></textarea><textarea data-name="target"></textarea><textarea data-name="content"></textarea><textarea data-name="keynote"></textarea><textarea data-name="for_use_people"></textarea></div>'+
                    '<div><ul><li data-name="teacher_introduction">教师介绍</li><li data-name="tool">工具</li><li data-name="method">工作方法与组织方式</li><li data-name="jobreq">工作需求</li><li data-name="pqs">职业资格标准</li></ul>'+
                    '<textarea data-name="teacher_introduction"></textarea><textarea data-name="tool"></textarea><textarea data-name="method"></textarea><textarea data-name="jobreq"></textarea><textarea data-name="pqs"></textarea></div>');
            }

            uls = $('.j-form ul');
            uls.eq(0).find('li').eq(0).click();
            uls.eq(1).find('li').eq(0).click();
            input = $('.j-form input');
            input.eq(0).focus();
            putCursorEnd(input);
            context.type = '0';
        }else if(level === 'activity'){
            context.course_child_id = course_child_id;
            $('.j-form').show().append('<h4>以下为必填项，每项都需填写完整</h4><div>'+
                '<p>名称</p><input data-name="title" type="text"/></div>'+
                '<div><p>课时数</p><input data-name="period" type="number"/></div>'+
                '<div><p>描述</p><textarea data-name="des"></textarea></div>');
            input = $('.j-form input');
            input.eq(0).focus();
            putCursorEnd(input);
        }else if(level === 'step'){

        }else if(level === 'task'){
            getTaskInfo(editOne.attr('data-id'),function(taskdata){
                context = taskdata;
                context = taskdata;
                context.level = level;
                context.editType = courseData?'edit':'create';
                context.id = editOne.attr('data-id');
                resStr = '<h4>必填项目</h4><div><p>标题</p><input class="j-task-title" data-id="' + courseData.task_id + '" data-name="title" value="' + (taskdata.title ? taskdata.title : '') + '" type="text"/></div>';
                if(type === '1') resStr += '<div><p>角色</p><input class="j-task-rolename" data-id="' + taskdata.task_id + '" data-name="rolename" value="' + (taskdata.rolename ? taskdata.rolename : '') + '" type="text"/></div><div><p>是否协作学习</p><select class="j-task-iscooperation" data-name="iscooperation">' + (taskdata.iscooperation === "0" ? '<option value="0" checked>不参与协作学习</option><option value="1">参与协作学习</option>' : '<option value="1" checked>参与协作学习</option><option value="0">不参与协作学习</option>') + '</select></div>';
                resStr += '<h4 class="active">描述&资料</h4>' +
                    '<div><div class="j-edit-tab-title"><p data-level="des">任务描述</p><p data-level="theory">理论知识点</p></div>' +
                    '<div class="j-edit-tab-body" data-level="des">' +
                    '<div class="j-edit-select"><p>添加一个描述：</p><span class="j-task-html">富文本</span><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input title="点击选择文件" class="j-task-upload" type="file" name="myfile"></form></span><p class="j-task-edit-online">在线编辑</p><p class="j-task-cloud">选择云文件</p></div></span></div>' +
                    '<div class="j-edit-list">';
                if (taskdata.des) {
                    $(taskdata.des).each(function (i, des) {
                        resStr += getTaskInStr('des',des,i);
                    });
                }
                resStr += '</div></div><div class="j-edit-tab-body" data-level="theory"><div class="j-edit-select"><p>添加一个知识点：</p><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input title="点击选择文件" class="j-task-upload" type="file" name="myfile"></form></span><p class="j-task-cloud">选择云文件</p></div></span></div><div class="j-edit-list">';
                if (taskdata.theory) {
                    $(taskdata.theory).each(function (i, theory) {
                        resStr += getTaskInStr('theory',theory,i);
                    });
                }
                resStr += '</div></div></div><h4 class="active">任务&试题</h4><div><div class="j-edit-tab-title"><p data-level="task_result">输出</p><p data-level="exam">试题</p></div>' +
                    '<div class="j-edit-tab-body" data-level="task_result"><div class="j-edit-select"><p>添加一个任务模板：</p><span class="j-task-html">富文本</span><span class="drop">文件<i class="j-icon">&#xe5c5</i><div><span class="j-upload-btn">上传文件<form id="file-form" enctype="multipart/form-data"><input class="j-task-upload" title="点击选择文件" type="file" name="myfile"></form></span><p class="j-task-edit-online">在线编辑</p><p class="j-task-cloud">选择云文件</p></div></span></div><div class="j-edit-list">';
                if (taskdata.task_result) {
                    $(taskdata.task_result).each(function (i, task_result) {
                        resStr += getTaskInStr('task_result',task_result,i);
                    });
                }
                resStr += '</div></div><div class="j-edit-tab-body" data-level="exam"><div class="j-edit-select"><p>添加一个试题：</p><span class="j-task-create-exam">创建</span></div><div class="j-edit-list">';
                if(taskdata.exam_id){
                    /* $(courseData.exam).each(function(i,exam){*/
                    resStr += '<div class="j-ele-list-one" data-ele="exam" data-id="'+courseData.exam_id+'"><h4>试题</h4><p>试题</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-preview">'+ preView +'</span></div>';
                    /*});*/
                }
                resStr += '</div></div></div>';
                $('.j-form').show().append(resStr);
                uls = $('.j-edit-tab-title');
                uls.eq(0).find('p').eq(0).click();
                uls.eq(1).find('p').eq(0).click();
                input = $('.j-form input');
                input.eq(0).focus();
                putCursorEnd(input);
            });
        }else if(level === 'section'){
            $('.j-form').show().append('<h4>填写以下项目来完成您的编辑</h4><div><p>标题</p><input data-name="title" type="text"/></div>'+
            '<div><p>课程图片</p><div class="img"><img class="j-course-img" src="/img/default/course.png"/><p>更换图片(400*300)</p><form id="img-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-img-upload" type="file" name="file"></form></div></div>'+
            '<div><p>课时数</p><input data-name="period" type="number"/></div>'+
            '<div><p>描述</p><textarea data-name="des"></textarea></div>');
        }else if(level === 'section_child'){
            $('.j-form').show().append('<h4>填写以下项目来完成您的编辑</h4><div><p>标题</p><input data-name="title" type="text"/></div>'+
            '<div><p>课程图片</p><div class="img"><img class="j-course-img" src="/img/default/course.png"/><p>更换图片(400*300)</p><form id="img-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-img-upload" type="file" name="file"></form></div></div>'+
            '<div><p>课时数</p><input data-name="period" type="number"/></div>'+
            '<div><p>描述</p><textarea data-name="des"></textarea></div>');
        }
    }
};
//event
var bindEvent = function(){
    //新建学习情境
    $('.j-new-situation').on('click',newSituation);
    $('.j-back-first').on('click',backToArea);
    //课程树列表
    $('.j-list')
        .on('click','.j-toggle',toggleList)
        .on('click','.j-remove',removeList)
        .on('click','.j-up',upList)
        .on('click','.j-down',downList)
        .on('click','.j-add',addList)
        .on('click','.j-list-one',editList)
        .on('click','.j-publish',publishCourse)
    ;
    //表单窗口
    $('.j-form')
        .on('click','li',infoSwitch)
        .on('blur','input',inputData)
        .on('blur','textarea',inputData)
        .on('change','select',inputData)
        .on('click','.j-edit-tab-title>p',changeEditTab)
        .on('click','.j-task-html',addTxt)
        .on('change','.j-task-upload',uploadFile)
        .on('click','.j-task-edit-online',onlineFile)
        .on('click','.j-task-cloud',cloudFile)
        .on('click','.j-ele-list-one .j-remove',removeEle)
        .on('click','.j-ele-list-one .j-preview',viewTaskEle)
        .on('click','.j-task-create-exam',createExam)
        .on('click','.j-section-add-exam',sectionCreateExam)
        .on('click','.j-section-edit-exam',sectionEditExam)
        .on('click','.j-section-remove-exam',sectionRemoveExam)
        .on('click','.j-section-add-txt',addTxtSection)
        .on('click','.j-section-edit-txt',addTxtSection)
        .on('click','.j-section-remove-txt',removeTxtSection)
        .on('change','#j-video-upload',uploadVideo)
        .on('click','.j-section-remove-video',removeVideo)
    ;
    //弹出窗
    $('.j-edit-pan')
        .on('click','.j-html-save',submitTxt)
        .on('click','.j-html-section-save',submitSectionTxt)
        .on('click','.j-edit-file-type>span',chooseFileType)
        .on('input','.j-file-name-online',addFileName)
        .on('click','.j-submit-online',submitOnlineFile)
        .on('input','.j-exam-edit-pan input',addExamName)
        .on('click','.j-exam-edit-pan button',addExam)
    ;
    $('.j-edit-title>span').on('click',closeEditPan);
    $('.j-nav-back').on('click',closeEditPan);

    //课程图片
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
        if(context.editType === 'edit'){
            url = (ports.course.domain == location.host ? ports.course.domain : '')+'/course/develop/uploadpngchild?course_id='+context.course_id+'&course_child_id='+context.course_child_id;
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

    $('.j-form').on('change','#j-img-upload',function(){
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
                        context.pngpath = data.datas.path;
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
};
//事件的方法全都堆在这了
var sectionRemoveExam = function(){
    var sendData = {
        section_id : context.section_id?context.section_id:'',
        section_child_id : context.section_child_id?context.section_child_id:'',
        exam_id : ''
    };
    updateTxt(sendData,function(){
        context.exam_id = '';
        $('.j-section-remove-exam').after('<button class="j-section-add-exam">添加</button>');
        $('.j-section-remove-exam').remove();
        $('.j-section-edit-exam').remove();
    });
};

var sectionEditExam = function(){
    var id = context.exam_id;
    var height = window.innerHeight - 210;
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div class="j-exam-edit-pan" style="width: 100%;height: '+height+'px;"></div>');
    $('.j-exam-edit-pan').empty().append('<iframe style="width:100%;height:100%;border:none" src="'+window.location.origin+'/exam-edit#'+ id +'"></iframe>');
};

var sectionCreateExam = function(){
    if(publish) return false;
    var height = window.innerHeight - 210;
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div class="j-exam-edit-pan" style="width: 100%;height: '+height+'px;"><h4>输入试卷名称</h4><div><input type="text"/></div><button class="section">确定</button></div>');
};

var removeVideo = function(){
    var sendData = {
        section_id : context.section_id?context.section_id:'',
        section_child_id : context.section_child_id?context.section_child_id:'',
        video : '',
        videoname : '',
        vtype : ''
    };
    updateTxt(sendData,function(){
        context.video = '';
        context.videoname = '';
        context.vtype = '';
        $('.j-section-video').after('<span class="j-video-upload"><button>上传</button><form id="video-upload" enctype="multipart/form-data"><input title="点击选择文件" id="j-video-upload" type="file" name="file"></form></span>');
        $('.j-section-video').remove();
    });
};

var uploadVideo = function(){
    var me = this;
    var filename = $(this).val().split('\\');
    var filetype = filename[filename.length-1].split('.')[filename[filename.length-1].split('.').length-1];
    if(filetype !== 'mp4' &&filetype !== 'MP4'){
        $.InfoBox('alert','error','格式错误','上传的文件格式不对(.mp4)！');
        return false;
    }
    var progressHandler = function(e){
        console.log(e);
    };

    var beforeSendHandler = function(){
    };

    var completeHandler = function(data){
        $(me).val('');

        if(data.code === 201){
            var sendData = {
                section_id : context.section_id?context.section_id:'',
                section_child_id : context.section_child_id?context.section_child_id:'',
                video : data.datas.path,
                videoname : data.datas.videoname,
                vtype : data.datas.vtype
            };
            updateTxt(sendData,function(){
                context.video = sendData.video;
                context.videoname = sendData.videoname;
                context.vtype = sendData.vtype;
                $('.j-video-upload').after('<span class="j-section-video">'+context.videoname+'</span><button class="j-section-remove-video">删除</button>');
                $('.j-video-upload').remove();
            });
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    };

    var errorHandler = function(){
        callback(false);
    };

    var formData = new FormData($('form')[0]);
    var url = (ports.course.domain == location.host ? ports.course.domain : '')+'/course/subject/uploadvideo';

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

var submitSectionTxt = function(){
    var sendData;
    if(context.section_id){
        sendData = {
            section_id : context.section_id,
            txt : context.editor.$txt.html()
        };
    }else{
        sendData = {
            section_child_id : context.section_child_id,
            txt : context.editor.$txt.html()
        };
    }
    updateTxt(sendData,function(){
        context.editType = 'edit';
        context.txt = context.editor.$txt.html();
        $('.j-edit-block').hide();
        $('.j-nav-back').hide();
        $('.j-section-add-txt').after('<button class="j-section-edit-txt">编辑</button><button class="j-section-remove-txt">删除</button>');
        $('.j-section-add-txt').remove();
    });
};

var removeTxtSection = function(){
    var sendData;
    if(context.section_id){
        sendData = {
            section_id : context.section_id,
            txt : ''
        };
    }else{
        sendData = {
            section_child_id : context.section_child_id,
            txt : ''
        };
    }
    updateTxt(sendData,function(){
        context.txt = '';
        $('.j-edit-block').hide();
        $('.j-nav-back').hide();
        $('.j-section-remove-txt').after('<button class="j-section-add-txt">添加</button>');
        $('.j-section-edit-txt').remove();
        $('.j-section-remove-txt').remove();
    });
};

var addTxtSection = function(){
    if(publish) return false;
    context.editType = 'create';
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div style="width: 100%;height: 400px;"></div><button class="j-html-section-save">保存</button>');
    var editor = new wangEditor($('.j-edit-pan>div'));
    editor.create();
    editor.$txt.html(context.txt);
    context.editor = editor;
};

var backToArea = function(){
    window.location.href = (ports.course.domain?port.course.domain:'') + 'create-area#'+'2/'+areaInfo.info.course_id;
};

var publishCourse = function(){
    var publish = $(this).attr('data-publish');
    var id = $(this).parent('div').attr('data-id');
    var me = this;
    if(publish === '1' || !id) return false;
    $.InfoBox('confirm','info','是否发布','发布后就不能对该课程进行修改，是否确认发布？',function(){
        sendPublish(id,function(){
            $(situationInfo).each(function(i,e){
                if(e.course_child_id === id){
                    e.iscompleted = '1';
                }
            });
            $(me).attr('data-publish','1').html('已发布');
            var con = $(me).parent('div').parent('div').next('div');
            con.find('.j-remove').remove();
            con.find('.j-add').remove();
            con.find('.j-up').remove();
            con.find('.j-down').remove();
            $(me).parent('div').parent('div').find('.j-remove').remove();
            $(me).parent('div').parent('div').find('.j-add').remove();
        });
    });
    return false;
};

var addExam = function(){
    submitExam(function(data){
        if(areaInfo.info.type === '1'){
            context.exam_id = data.exam_id;
            $('.j-section-add-exam').after('<button class="j-section-edit-exam">编辑</button><button class="j-section-remove-exam">删除</button>');
            $('.j-section-add-exam').remove();
            $('.j-exam-edit-pan').empty().append('<iframe style="width:100%;height:100%;border:none" src="'+window.location.origin+'/exam-edit#'+data.exam_id+'"></iframe>');
        }else{
            context.exam_id = data.exam_id;
            var listCon = $('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list');
            listCon.append('<div class="j-ele-list-one" data-index="'+ (listCon.children('.j-ele-list-one').length?listCon.children('.j-ele-list-one').length:0) +'" data-ele="'+ context.ele +'" data-type="exam" data-id="'+ data.exam_id +'"><h4>'+ context.examData.name +'</h4><p>试题</p><span class="j-icon j-remove"></span><span class="j-preview">编辑</span> </div>');
            $('.j-exam-edit-pan').empty().append('<iframe style="width:100%;height:100%;border:none" src="'+window.location.origin+'/exam-edit#'+data.exam_id+'"></iframe>');
        }
    });
};

var addExamName = function(){
    context.examData = {};
    context.examData.name = $(this).val();
    if(context.examData.name){
        $('.j-exam-edit-pan button').addClass('active');
    }else{
        $('.j-exam-edit-pan button').removeClass('active');
    }
};

var createExam = function(){
    if(publish) return false;
    if(context.exam_id){
        $.InfoBox('alert','error','重复添加','已经添加了试卷，不能重复添加！');
        return false;
    }
    context.ele = $(this).parents('.j-edit-tab-body').attr('data-level');
    var height = window.innerHeight - 210;
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div class="j-exam-edit-pan" style="width: 100%;height: '+height+'px;"><h4>输入试卷名称</h4><div><input type="text"/></div><button>确定</button></div>');
};

var viewTaskEle = function(){
    var type = $(this).parent().attr('data-type');
    var task_ele_id = $(this).parent().attr('data-id');
    var ele = context.ele = $(this).parent().attr('data-ele');
    $(this).parent().parent().children('.active').removeClass('active');
    $(this).parent().addClass('active');
    if(ele === 'exam'){
        var id = $(this).parent().attr('data-id');
        var height = window.innerHeight - 210;
        $('.j-edit-block').show();
        $('.j-nav-back').show();
        $('.j-edit-pan').empty().append('<div class="j-exam-edit-pan" style="width: 100%;height: '+height+'px;"></div>');
        $('.j-exam-edit-pan').empty().append('<iframe style="width:100%;height:100%;border:none" src="'+window.location.origin+'/exam-edit#'+ id +'"></iframe>');
        return false;
    }
    if(type === 'text'){
        var txt;
        $(context[ele]).each(function(i,e){
            if(e.type === type) txt = e.txt;
        });
        context.editType = 'edit';
        $('.j-edit-block').show();
        $('.j-nav-back').show();
        $('.j-edit-pan').empty().append('<div style="width: 100%;height: 400px;"></div>'+(publish?'':'<button class="j-html-save">保存</button>'));
        var editor = new wangEditor($('.j-edit-pan>div'));
        editor.create();
        editor.$txt.html(txt);
        context.editor = editor;
    }else{
        context.onlineEditData = {};
        $(context[ele]).each(function(i,e){
            if(e.type === type){
                context.onlineEditData.key = e.task_file_id;
            }
        });
        context.onlineEditData.filename = $(this).parent().find('h4').html().split('.')[0];
        context.onlineEditData.filetype = $(this).parent().find('h4').html().split('.')[$(this).parent().find('h4').html().split('.').length - 1];
        createOnlyOffice(context.onlineEditData);
    }
};

var removeEle = function(){
    var id = $(this).parent().attr('data-id'),
        me = this,
        ele = $(this).parent().attr('data-ele'),
        type = $(this).parent().attr('data-type');
    if(ele === 'exam'){
        delExam(function(){
            $(me).parent().remove();
            context.exam_id = '';
        });
        return false;
    }
    removeTaskEle(id,function(){
        $(me).parent().remove();
        $(context[ele]).each(function(i,e){
            if(e.type === type){
                context[ele].splice(i,1);
            }
        });
    });
    return false;
};

var chooseFileType = function(){
    $('.j-edit-file-type>span.active').removeClass('active');
    $(this).addClass('active');
    context.onlineEditData.filetype = $(this).attr('data-type');
    if(context.onlineEditData.filetype && context.onlineEditData.filename){
        $('.j-submit-online').addClass('active');
    }else{
        $('.j-submit-online').removeClass('active');
    }
};

var addFileName = function(){
    context.onlineEditData.filename = $(this).val();
    if(context.onlineEditData.filetype && context.onlineEditData.filename){
        $('.j-submit-online').addClass('active');
    }else{
        $('.j-submit-online').removeClass('active');
    }
};

var submitOnlineFile = function(){
    if(!$(this).hasClass('active')) return false;
    var id = uuid();
    addOnlyTask(function(data){
        context[context.ele].push({
            type : 'office',
            task_file_id : data.task_file_id,
            task_ele_id : data.task_ele_id
        });
        var listCon = $('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list').length?$('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list'):$('.j-edit-list');
        listCon.append('<div class="j-ele-list-one" data-index="'+ (listCon.children('.j-ele-list-one').length?listCon.children('.j-ele-list-one').length:0) +'" data-ele="'+ context.ele +'" data-type="office" data-id="'+ data.task_ele_id +'"><h4>'+ context.onlineEditData.filename + '.' + context.onlineEditData.filetype +'</h4><p>在线编辑</p><span class="j-icon j-remove"></span><span class="j-preview">编辑</span></div>');
        context.onlineEditData.key = data.task_file_id;
        createOnlyOffice(context.onlineEditData);
    });
};

var closeEditPan = function(){
    $('.j-edit-block').hide();
    $('.j-nav-back').hide();
    if(onlyOfficing){
        window.docEditor.downloadAs();
    }else{
        $('.j-edit-pan').empty();
    }
};

var submitTxt = function(){
    var sendData;
    if(context.editType === 'create'){
        sendData = {
            task_id : context.task_id,
            type : 'text',
            ele : context.ele,
            belong : 'task',
            txt : context.editor.$txt.html()
        };
        saveTxt(sendData,function(data){
            context.editType = 'edit';
            sendData.task_ele_id = data.task_ele_id;
            context[context.ele].push(sendData);
            var listCon = $('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list');
            listCon.append('<div class="j-ele-list-one" data-index="'+ (listCon.children('.j-ele-list-one').length?listCon.children('.j-ele-list-one').length:0) +'" data-ele="'+ context.ele +'" data-type="text" data-id="'+ data.task_ele_id +'"><h4>文本文件</h4><p>文本</p><span class="j-icon j-remove"></span><span class="j-preview">编辑</span></div>');
            closeEditPan();
        });
    }else if(context.editType === 'edit'){
        var index = 0;
        $(context[context.ele]).each(function(i,e){
            if(e.type === 'text') index = i;
        });
        sendData = {
            task_ele_id : context[context.ele][index].task_ele_id,
            txt : context.editor.$txt.html()
        };
        updateTxt(sendData,function(){
            context[context.ele][index].txt = context.editor.$txt.html();
            closeEditPan();
        });
    }
};

var addTxt = function(){
    if(publish) return false;
    context.ele = $(this).parents('.j-edit-tab-body').attr('data-level');
    var have = false;
    $(context[context.ele]).each(function(i,e){
        if(e.type === 'text'){
            have = true;
        }
    });
    if(have){
        $.InfoBox('alert','error','重复添加','已经添加了富文本，不能重复添加！');
        return false;
    }
    context.editType = 'create';
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div style="width: 100%;height: 400px;"></div><button class="j-html-save">保存</button>');
    var editor = new wangEditor($('.j-edit-pan>div'));
    editor.create();
    context.editor = editor;
};

var uploadFile = function(){
    if(publish) return false;
    context.ele = $(this).parents('.j-edit-tab-body').attr('data-level');
    var have = false;
    $(context[context.ele]).each(function(i,e){
        if(e.type === 'upload') have = true;
    });
    if(have) {
        $.InfoBox('alert','error','重复添加','已经添加了上传文件，不能重复添加！');
        return false;
    }
    var me = this;
    var belong,fileName = $(this).val().split('\\')[$(this).val().split('\\').length - 1];
    if($(me).hasClass('step')){
        if(context.task_result.length){
            $.InfoBox('alert','error','重复添加','已经添加了协作文件，不能重复添加！');
            return false;
        }
        belong = 'step';
        context.ele = 'task_result';
    }else{
        belong = 'task';
    }
    var progressHandler = function(e){
    };

    var beforeSendHandler = function(){
    };

    var completeHandler = function(data){
        if(data.code === 201){
            $(me).val('');
            context[context.ele].push({
                type : 'upload',
                task_ele_id : data.datas.task_ele_id,
                task_file_id : data.datas.task_file_id
            });
            var listCon = $('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list').length?$('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list'):$('.j-edit-list');
            listCon.append('<div class="j-ele-list-one" data-index="'+ (listCon.children('.j-ele-list-one').length?listCon.children('.j-ele-list-one').length:0) +'" data-ele="'+ context.ele +'" data-type="upload" data-id="'+ data.datas.task_ele_id +'"><h4>'+ fileName +'</h4><p>上传</p><span class="j-icon j-remove"></span><span class="j-preview">编辑</span></div>');
        }else{

        }
    };

    var errorHandler = function(){
        $(me).val('');
    };

    var formData = new FormData($(this).parents('form')[0]);
    $.ajax({
        url: (ports.course.domain === location.origin ? ports.course.domain : '')+'/course/develop/addtaskele?ele='+(belong==='step'?'task_result':context.ele)+'&type=upload&'+(belong==='step'?'step_id':'task_id')+'='+(belong==='step'?context.step_id:context.task_id)+'&belong='+belong,  //server script to process data
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

var onlineFile = function(){
    if(publish) return false;
    context.onlineEditData = {};
    context.ele = $(this).parents('.j-edit-tab-body').attr('data-level');
    var have = false;
    $(context[context.ele]).each(function(i,e){
        if(e.type === 'office') have = true;
    });
    if(have){
        $.InfoBox('alert','error','重复添加','已经添加了在线编辑文件，不能重复添加！');
        return false;
    }
    var height = window.innerHeight - 110;
    var belong;
    if($(this).hasClass('step')){
        if(context.task_result.length){
            $.InfoBox('alert','error','重复添加','已经添加了协作文件，不能重复添加！');
            return false;
        }
        belong = 'step';
        context.ele = 'task_result';
    }else{
        belong = 'task';
    }
    context.belong = belong;
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div class="j-online-edit-pan" style="width: 100%;height: '+height+'px;"><h4>选择文档类型</h4><div class="j-edit-file-type"><span data-type="docx"><i class="j-icon">&#xe94c</i><p>Word文档</p></span><span data-type="xlsx"><i class="j-icon">&#xe228</i><p>Excel表格</p></span><span data-type="pptx"><i class="j-icon">&#xe938</i><p>PPT幻灯片</p></span></div><h4>输入文件名</h4><div><input class="j-file-name-online" type="text"/></div><button class="j-submit-online">确定</button></div>');
};

var cloudFile = function(){
    if(publish) return false;
    context.ele = $(this).parents('.j-edit-tab-body').attr('data-level');
    var have = false;
    $(context[context.ele]).each(function(i,e){
        if(e.type === 'cloud_file') have = true;
    });
    if(have){
        $.InfoBox('alert','error','重复添加','已经添加了云文件，不能重复添加！');
        return false;
    }
    var height = window.innerHeight - 110;
    var belong,listCon;
    if($(this).hasClass('step')){
        if(context.task_result.length){
            $.InfoBox('alert','error','重复添加','已经添加了协作文件，不能重复添加！');
            return false;
        }
        belong = 'step';
        context.ele = 'task_result';
        listCon = $('.j-edit-list');
    }else{
       listCon = $('.j-edit-tab-body[data-level="'+ context.ele +'"').find('.j-edit-list');
        belong = 'task';
    }
    context.belong = belong;
    $('.j-edit-block').show();
    $('.j-nav-back').show();
    $('.j-edit-pan').empty().append('<div class="j-file-main"><div class="j-tool-bar"><span class="j-choose-file"><span class="j-icon">&#xe95e</span><p>选择</p></span><span class="j-icon j-file-show-type">&#xe8ef</span><div class="j-file-search"><input type="text" placeholder="搜索您的文件"/><span class="j-icon">&#xe8b6</span></div></div><div class="j-file-menu"><ul><li class="j-return-prev"><span>返回上一级</span></li><li class="j-path-roads"><span>全部文件</span><i class="j-icon">&#xe315</i><p>新建文件夹</p></li></ul><span class="j-totle-number"></span></div><div class="j-file-select-all"><ul><li class="j-title-file-name"><input type="checkbox"/><p>文件名</p></li><li class="j-title-file-size"><p>大小</p></li><li class="j-title-file-date"><p>更新日期</p></li></ul></div><div class="j-file-content"></div></div></div>');
    database = new Database(listCon,'',belong,function(database){
        view = new View(database);
    });
};

var changeEditTab = function(){
    var level = $(this).attr('data-level');
    $(this).parent().find('.active').removeClass('active');
    $(this).addClass('active');
    $(this).parent().parent().find('.j-edit-tab-body').hide();
    $('.j-edit-tab-body[data-level="'+ level +'"]').show();
};

var submitForm = function(){
    if(publish) return;
    if(context.level === 'situation'){
        if(areaInfo.info.type === '1'){
            if(!(context.title && context.period)){
                //alert('必填项目不能为空！')
                return;
            }
            context.task = '1';
            context.des = '1';
            sendForm(function(){
                $(editOne).children('p').html((context.title?context.title:'未命名章')).attr('title',(context.title?context.title:'未命名章'));
                if(context.editType === 'create'){
                    $(editOne).after('<div data-cid="'+ context.course_child_id +'"></div>');
                    $(editOne).attr('data-id',context.course_child_id);
                    context.activities = {};
                    situationInfo.push(context);
                    context.editType = 'edit';
                }else{
                    situationInfo[parseInt($(editOne).attr('data-index'))] = context;
                }
            });
        }else{
            if(!(context.title && context.period && context.task && context.des && context.level)){
                //alert('必填项目不能为空！')
                return;
            }
            sendForm(function(){
                $(editOne).children('p').html((context.title?context.title:'未命名学习情境') + ((context.type==='0')?'(单人课程)':'(多人课程)')).attr('title',context.title);
                if(context.editType === 'create'){
                    $(editOne).after('<div data-cid="'+ context.course_child_id +'"></div>');
                    $(editOne).attr('data-id',context.course_child_id);
                    context.activities = {};
                    situationInfo.push(context);
                    context.editType = 'edit';
                }else{
                    situationInfo[parseInt($(editOne).attr('data-index'))] = context;
                }
            });
        }
    }else if(context.level === 'activity'){
        context.isasync = '1';
        if(!(context.title && context.period && context.des && context.isasync)){
            //alert('必填项目不能为空！');
            return;
        }
        sendForm(function(data){
            $(editOne).find('p').html((context.title?context.title:'未命名活动')).attr('title',context.title);
            situationInfo[parseInt($(editOne).parent().prev('.j-list-one').attr('data-index'))].activities[context.activity_id] = context;
            if(context.editType === 'create'){
                situationInfo[parseInt($(editOne).parent().prev('.j-list-one').attr('data-index'))].activities[context.activity_id].steps = {};
                situationInfo[parseInt($(editOne).parent().prev('.j-list-one').attr('data-index'))].activities[context.activity_id].steps[data.step_id] = {
                    course_child_id : context.course_child_id,
                    activity_id : context.activity_id,
                    step_id : data.step_id,
                    tasks : [{
                        course_child_id : context.course_child_id,
                        activity_id : context.activity_id,
                        step_id : data.step_id,
                        task_id : data.task_id
                    }]
                };
                $(editOne).attr('data-id',context.activity_id);
                if(type === '0'){
                    $(editOne).after('<div data-cid="'+ context.activity_id +'"><div data-index="0" class="j-list-one" data-level="2" data-step-id="'+ data.step_id +'" data-id="'+ data.task_id +'"><p title="未命名任务">未命名任务</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span></div></div>');
                }else{
                    $(editOne).after('<div data-cid="'+ context.activity_id +'"><div data-index="0" class="j-list-one" data-level="2" data-id="'+ data.step_id +'"><i data-open="1" class="j-icon j-toggle">&#xe5cf</i><p title="步骤1">步骤1</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span></div><div data-cid="'+ data.step_id +'"><div data-index="0" class="j-list-one" data-level="3" data-id="'+ data.task_id +'"><p title="未命名任务">未命名任务</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span></div></div></div>');
                }
                context.editType = 'edit';
            }
        });
    }else if(context.level === 'step'){
        sendForm(function(){
            $(editOne).find('p').html((context.title?context.title:'未命名步骤')).attr('title',context.title);
            situationInfo[parseInt($(editOne).attr('data-index'))].activities[context.activity_id].steps[context.step_id] = context;
        });
    }else if(context.level === 'task'){
        sendForm(function(){
            $(editOne).find('p').html((context.title?context.title:'未命名任务')).attr('title',context.title);
            //situationInfo[parseInt(editOne.attr('data-index'))].activities[context.activity_id].steps[context.step_id].tasks[editOne.attr('data-index')] = context;
        });
    }else if(context.level === 'section'){
        sendForm(function(){
            var index = parseInt($(editOne).attr('data-index'))+1;
            $(editOne).find('p').html('第'+index+'节 '+(context.title?context.title:'未命名节')).attr('title',context.title);
            //situationInfo[parseInt(editOne.attr('data-index'))].activities[context.activity_id].steps[context.step_id].tasks[editOne.attr('data-index')] = context;
        });
    }else if(context.level === 'section_child'){
        sendForm(function(){
            var index = parseInt($(editOne).attr('data-index'))+1;
            $(editOne).find('p').html('第'+index+'小节 '+(context.title?context.title:'未命名小节')).attr('title',context.title);
            //situationInfo[parseInt(editOne.attr('data-index'))].activities[context.activity_id].steps[context.step_id].tasks[editOne.attr('data-index')] = context;
        });
    }
};

var inputData = function(){
    var name = $(this).attr('data-name');
    context[name] = $(this).val();
    submitForm();
};

var infoSwitch = function(){
    var name = $(this).attr('data-name');
    var contain = $(this).parent().parent();
    var thisTextArea = $('textarea[data-name="'+ name +'"');
    contain.find('textarea').hide();
    thisTextArea.show().focus();
    putCursorEnd(thisTextArea);
    contain.children('ul').children('li.active').removeClass('active');
    $(this).addClass('active');
};

var newSituation = function(){
    if(context.editType === 'create'){
        $.InfoBox('confirm','info','新建尚未完成','新建没有完成，是否取消之前的开始新的新建任务？',function(){
            $(editOne).remove();
            context = {};
            context.editType = 'create';
            context.level = 'situation';
            context.course_id = areaInfo.info.course_id;
            title = '新建学习情境';
            course_child_id = $(this).parent().attr('data-id');
            editOne = document.createElement('div');
            $('.j-right>span').html('*编辑后自动保存。新建时把必填项填写完成后会自动新建。');
            var j_list = $('.j-list');
            j_list.children('p').remove();
            $('.j-list-one.active').removeClass('active');
            if(areaInfo.info.type === '1'){
                $(editOne)
                    .addClass('active').addClass('j-list-one').addClass('open')
                    .attr('data-level','0').attr('data-index',j_list.children('.j-list-one').length)
                    .append('<i data-open="1" class="j-icon j-toggle">&#xe5cf</i><h4>第'+ (j_list.children('.j-list-one').length+1) +'章</h4><p title="新建的章">新建的章</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span></div>');

            }else{
                $(editOne)
                    .addClass('active').addClass('j-list-one').addClass('open')
                    .attr('data-level','0').attr('data-index',j_list.children('.j-list-one').length)
                    .append('<i data-open="1" class="j-icon j-toggle">&#xe5cf</i><h4>情境'+ (j_list.children('.j-list-one').length+1) +'</h4><p title="新建的学习情境">新建的学习情境</p><button class="j-publish" data-publish="0">发布</button><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span></div>');
            }

            j_list.append(editOne);
            insertForm('situation','','');
        },function(){
            return false;
        });
    }else{
        context = {};
        context.editType = 'create';
        context.level = 'situation';
        context.course_id = areaInfo.info.course_id;
        title = '新建学习情境';
        course_child_id = $(this).parent().attr('data-id');
        editOne = document.createElement('div');
        $('.j-right>span').html('*编辑后自动保存。新建时把必填项填写完成后会自动新建。');
        var j_list = $('.j-list');
        j_list.children('p').remove();
        $('.j-list-one.active').removeClass('active');
        if(areaInfo.info.type === '1'){
            $(editOne)
                .addClass('active').addClass('j-list-one').addClass('open')
                .attr('data-level','0').attr('data-index',j_list.children('.j-list-one').length)
                .append('<i data-open="1" class="j-icon j-toggle">&#xe5cf</i><h4>第'+ (j_list.children('.j-list-one').length+1) +'章</h4><p title="新建的章">新建的章</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span></div>');

        }else{
            $(editOne)
                .addClass('active').addClass('j-list-one').addClass('open')
                .attr('data-level','0').attr('data-index',j_list.children('.j-list-one').length)
                .append('<i data-open="1" class="j-icon j-toggle">&#xe5cf</i><h4>情境'+ (j_list.children('.j-list-one').length+1) +'</h4><p title="新建的学习情境">新建的学习情境</p><button class="j-publish" data-publish="0">发布</button><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span></div>');

        }

        j_list.append(editOne);
        insertForm('situation','','');
    }

};

var toggleList = function(){
    var open = $(this).attr('data-open');
    var id = $(this).parent('.j-list-one').attr('data-id');
    var level = $(this).parent('.j-list-one').attr('data-level');
    if(open === '1'){
        if(level === '0'){
            $(this).parent('.j-list-one').removeClass('open');
        }
        $(this).attr('data-open','0').html('&#xe409');
        $('div[data-cid="'+ id +'"]').slideUp(200);
    }else{
        if(level === '0'){
            $(this).parent('.j-list-one').addClass('open');
        }
        $(this).attr('data-open','1').html('&#xe5cf');
        $('div[data-cid="'+ id +'"]').slideDown(200);
    }
    return false;
};

var removeList = function(){
    var level = $(this).parent('.j-list-one').attr('data-level'),
        id = $(this).parent('.j-list-one').attr('data-id'),
        me = this,
        type;
    if(!id){
        $(me).parent('.j-list-one').remove();
        if(!$('.j-list-one.active').length){
            $('.j-right>span').hide();
            $('.j-form').hide();
        }
        return false;
    }
    if(level === '2'){
        var course_child_list = $(this).parent('.j-list-one').parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
        type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
    }
    if(level === '0'){
        removeEles(id,'situation',function(){
            $(me).parent('.j-list-one').remove();
            $('div[data-cid="'+ id +'"]').remove();
            if(!$('.j-list-one.active').length){
                $('.j-right>span').hide();
                $('.j-form').hide();
            }
            if(!$('.j-list-one').length){
                $('.j-list').append('<p>_(:з」∠)_课程列表空空如也</p>');
            }
        });
    }else if(level === '1'){
        if(areaInfo.info.type === '1'){
            removeEles(id,'section',function(){
                $(me).parent('.j-list-one').remove();
                $('div[data-cid="'+ id +'"]').remove();
                if(!$('.j-list-one.active').length){
                    $('.j-right>span').hide();
                    $('.j-form').hide();
                }
            });
        }else{
            removeEles(id,'activity',function(){
                $(me).parent('.j-list-one').remove();
                $('div[data-cid="'+ id +'"]').remove();
                if(!$('.j-list-one.active').length){
                    $('.j-right>span').hide();
                    $('.j-form').hide();
                }
            });
        }
    }else if(level === '2' && areaInfo.info.type === '1'){
        removeEles(id,'section_child',function(){
            $(me).parent('.j-list-one').remove();
            $('div[data-cid="'+ id +'"]').remove();
            if(!$('.j-list-one.active').length){
                $('.j-right>span').hide();
                $('.j-form').hide();
            }
        });
    }else if(level === '2' && type === '1'){
        removeEles(id,'step',function(){
            $(me).parent('.j-list-one').remove();
            $('div[data-cid="'+ id +'"]').remove();
            if(!$('.j-list-one.active').length){
                $('.j-right>span').hide();
                $('.j-form').hide();
            }
        });
    }else{
        removeEles(id,'task',function(){
            $(me).parent('.j-list-one').remove();
            if(!$('.j-list-one.active').length){
                $('.j-right>span').hide();
                $('.j-form').hide();
            }
        });
    }
    if(!$('.j-list-one.active').length){
        $('.j-right>span').hide();
        $('.j-form').hide();
    }
    return false;
};

var upList = function(){
    var level = $(this).parent('.j-list-one').attr('data-level'),
        id = $(this).parent('.j-list-one').attr('data-id'),
        index = $(this).parent('.j-list-one').attr('data-index'),
        me = this,
        type,
        prevNode;
    if(!id) return false;
    if(level === '2'){
        var course_child_list = $(this).parent('.j-list-one').parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
        type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
    }
    if(level === '1'){
        if(index !== '0'){
            moveEles(id,'activity','up',function(){
                prevNode = $(me).parent('.j-list-one').parent().children('.j-list-one[data-index="'+ (parseInt(index)-1) +'"]');
                prevNode.before($(me).parent('.j-list-one').clone());
                prevNode.before($('div[data-cid="'+ id +'"]'));
                prevNode.attr('data-index',index);
                $(me).parent('.j-list-one').remove();
                $('.j-list-one[data-id="'+ id +'"]').attr('data-index',parseInt(index)-1);
            });
        }
    }else if(level === '2'){
        if(type === '0') id = $(this).parent('.j-list-one').attr('data-step-id');
        if(index !== '0'){
            moveEles(id,'step','up',function(){
                prevNode = $(me).parent('.j-list-one').parent().children('.j-list-one[data-index="'+ (parseInt(index)-1) +'"]');
                prevNode.before($(me).parent('.j-list-one').clone());
                prevNode.before($('div[data-cid="'+ id +'"]'));
                prevNode.attr('data-index',index);
                $(me).parent('.j-list-one').remove();
                $('.j-list-one[data-id="'+ id +'"]').attr('data-index',parseInt(index)-1);
            });
        }
    }
    return false;
};

var downList = function(){
    var level = $(this).parent('.j-list-one').attr('data-level'),
        id = $(this).parent('.j-list-one').attr('data-id'),
        index = $(this).parent('.j-list-one').attr('data-index'),
        me = this,
        type,
        nextNode;
    if(!id) return false;
    if(level === '2'){
        var course_child_list = $(this).parent('.j-list-one').parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
        type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
    }
    if(level === '1'){
        if(parseInt(index) !== ($(me).parent('.j-list-one').parent().children('.j-list-one').length - 1)){
            moveEles(id,'activity','down',function(){
                nextNode = $(me).parent('.j-list-one').parent().children('.j-list-one[data-index="'+ (parseInt(index)+1) +'"]');
                nextNode.next('div').after($('div[data-cid="'+ id +'"]'));
                nextNode.next('div').after($(me).parent('.j-list-one').clone());
                nextNode.attr('data-index',index);
                $(me).parent('.j-list-one').remove();
                $('.j-list-one[data-id="'+ id +'"]').attr('data-index',parseInt(index)+1);
            });
        }
    }else if(level === '2'){
        if(type === '0') id = $(this).parent('.j-list-one').attr('data-step-id');
        if(parseInt(index) !== ($(me).parent('.j-list-one').parent().children('.j-list-one').length - 1)){
            moveEles(id,'step','down',function(){
                nextNode = $(me).parent('.j-list-one').parent().children('.j-list-one[data-index="'+ (parseInt(index)+1) +'"]');
                nextNode.next('div').after($('div[data-cid="'+ id +'"]'));
                nextNode.next('div').after($(me).parent('.j-list-one').clone());
                nextNode.attr('data-index',index);
                $(me).parent('.j-list-one').remove();
                $('.j-list-one[data-id="'+ id +'"]').attr('data-index',parseInt(index)+1);
            });
        }
    }
    return false;
};

var addList = function(){
    var level = parseInt($(this).parent().attr('data-level')) + 1;
    var id = $(this).parent().attr('data-id');
    var index = parseInt($(this).parent().attr('data-index'));
    if(!id){
        $.InfoBox('alert','error','无法添加','新建尚未完成，请先完成新建在进行添加');
        return false;
    }
    onCreate = true;
    var title,course_child_id,me = this;
    if($(this).parent().children('.j-toggle').attr('data-open') === '0'){
        $(this).parent().children('.j-toggle').click();
    }

    var addNewEle = function(title){
        $('.j-list-one.active').removeClass('active');
        editOne = document.createElement('div');
        $(editOne)
            .addClass('active').addClass('j-list-one')
            .attr('data-level',level).attr('data-index',$('div[data-cid="'+ id +'"]').children().length)
            .append('<i data-open="1" class="j-icon j-toggle">&#xe5cf</i><p title="'+ title +'">'+ title +'</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span>');
        $('div[data-cid="'+ course_child_id +'"]').append(editOne);
    };
    if(level === 1){
        if(areaInfo.info.type === '1'){
            title = '新建的节';
            context = {};
            context.course_child_id = course_child_id = $(this).parent().attr('data-id');
            context.editType = 'create';
            context.level = 'section';
            sendForm(function(data){
                $(me).parent().next('div').append('<div data-index="'+ $(me).parent().next('div').children('.j-list-one').length +'" class="j-list-one" data-level="1" data-id="'+ data.section_id +'"><i data-open="1" class="j-icon j-toggle">&#xe5cf</i><p title="未命名的节">未命名的节</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span></div>');
                situationInfo[parseInt($(me).parent().attr('data-index'))].sectionData.push({
                    section_id : data.section_id,
                    course_child_id : context.course_child_id,
                    txt : data.txt,
                    exam_id : data.exam_id,
                    childs : [],
                    video : data.video,
                    videoname : data.videoname,
                    vtype : data.vtype,
                    title : data.title
                });
                $('.j-list-one[data-id="' +data.section_id+ '"]').click();
            });
        }else{
            if(context.editType === 'create'){
                $.InfoBox('confirm','info','新建尚未完成','新建没有完成，是否取消之前的开始新的新建任务？',function(){
                    $(editOne).remove();
                    context = {};
                    context.course_child_id = course_child_id = $(me).parent().attr('data-id');
                    context.editType = 'create';
                    context.level = 'activity';
                    title = '新建的活动';
                    course_child_id = $(me).parent().attr('data-id');
                    addNewEle(title);
                    insertForm('activity','',course_child_id);
                },function(){
                    return false;
                });
            }else{
                context = {};
                context.course_child_id = course_child_id = $(this).parent().attr('data-id');
                context.editType = 'create';
                context.level = 'activity';
                title = '新建的活动';
                course_child_id = $(this).parent().attr('data-id');
                addNewEle(title);
                insertForm('activity','',course_child_id);
            }
        }
    }else if(level === 2){
        context = {};
        context.course_child_id = course_child_id = $(this).parent().parent('div').prev('.j-list-one').attr('data-id');
        context.activity_id = $(this).parent().attr('data-id');
        context.editType = 'create';
        setType(course_child_id);
        if(areaInfo.info.type === '1'){
            context.level = 'section_child';
            context.section_id = $(this).parent().attr('data-id');
            sendForm(function(data){
                context.editType = 'edit';
                $(me).parent().next('div').append('<div data-index="'+ $(me).parent().next('div').children('.j-list-one').length +'" class="j-list-one" data-level="2" data-id="'+ data.section_child +'"><p title="未命名小节">未命名小节</p><span class="j-icon j-remove">&#xe9d6</span></div>');
                situationInfo[parseInt($(me).parent().parent().prev('.j-list-one').attr('data-index'))].sectionData[parseInt($(me).parent().attr('data-index'))].childs.push({
                    section_child_id : data.section_child_id,
                    course_child_id : context.course_child_id,
                    txt : data.txt,
                    exam_id : data.exam_id,
                    childs : [],
                    video : data.video,
                    videoname : data.videoname,
                    vtype : data.vtype,
                    title : data.title
                });
                $('.j-list-one[data-id="' +data.task_id+ '"]').click();
            });
        }else{
            if(type === '0'){
                context.level = 'step';
                sendForm(function(data){
                    context.editType = 'edit';
                    $(me).parent().next('div').append('<div data-index="'+ $(me).parent().next('div').children('.j-list-one').length +'" class="j-list-one" data-level="2" data-step-id="'+ data.step_id +'" data-id="'+ data.task_id +'"><p title="未命名任务">未命名任务</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span></div>');
                    situationInfo[parseInt($(me).parent().parent().prev('.j-list-one').attr('data-index'))].activities[context.activity_id].steps[data.step_id] = {
                        course_id : context.course_id,
                        course_child_id : context.course_child_id,
                        step_id : data.step_id,
                        tasks : [{
                            course_id : context.course_id,
                            course_child_id : context.course_child_id,
                            step_id : data.step_id,
                            task_id : data.task_id
                        }]
                    };
                    $('.j-list-one[data-id="' +data.task_id+ '"]').click();
                });
            }else{
                context.level = 'step';
                sendForm(function(data){
                    context.editType = 'edit';
                    var con = $(me).parent().next('div');
                    con.append('<div data-index="'+ con.children('.j-list-one').length +'" class="j-list-one" data-level="2" data-id="'+ data.step_id +'"><i data-open="1" class="j-icon j-toggle">&#xe5cf</i><p title="步骤'+ (con.children('.j-list-one').length+1) +'">步骤'+ (con.children('.j-list-one').length+1) +'</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-add">&#xe145</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span></div><div data-cid="'+ data.step_id +'"><div data-index="0" class="j-list-one" data-level="3" data-id="'+ data.task_id +'"><p title="未命名任务">未命名任务</p><span class="j-icon j-remove">&#xe9d6</span><span class="j-icon j-up">&#xe5d8</span><span class="j-icon j-down">&#xe5db</span></div></div>');
                    situationInfo[parseInt($(me).parent().parent().prev('.j-list-one').attr('data-index'))].activities[context.activity_id].steps[data.step_id] = {
                        course_id : context.course_id,
                        course_child_id : context.course_child_id,
                        step_id : data.step_id,
                        tasks : [{
                            course_id : context.course_id,
                            course_child_id : context.course_child_id,
                            step_id : data.step_id,
                            task_id : data.task_id
                        }]
                    };
                    $('.j-list-one[data-id="' +data.task_id+ '"]').click();
                });
            }
        }
    }else{
        context = {};
        context.course_child_id = course_child_id = $(me).parent().parent('div').prev('.j-list-one').parent('div').prev('.j-list-one').attr('data-id');
        context.activity_id = $(me).parent().parent('div').prev('.j-list-one').attr('data-id');
        context.step_id = $(me).parent().attr('data-id');
        context.editType = 'create';
        setType(course_child_id);
        context.level = 'task';
        context.title = '未命名任务';
        sendForm(function(data) {
            context.editType = 'edit';
            var con = $(me).parent().next('div');
            con.append('<div data-index="' + con.find('.j-list-one').length + '" class="j-list-one" data-level="3" data-id="' + data.task_id + '"><p title="未命名任务">未命名任务</p><span class="j-icon j-remove">&#xe9d6</span></div>');
            situationInfo[parseInt(con.prev('.j-list-one').parent().prev('.j-list-one').parent().prev('.j-list-one').attr('data-index'))].activities[context.activity_id].steps[context.step_id].tasks.push({
                course_id: context.course_id,
                course_child_id: context.course_child_id,
                step_id: data.step_id,
                task_id: data.task_id
            });
            $('.j-list-one[data-id="' +data.task_id+ '"]').click();
        });
    }
    return false;
};

var editList = function(){
    var me = this;
    if($(me).hasClass('active')) return false;
    //if($(this).find('.j-publish').attr('data-publish') === '1') return false;
    if(context.editType === 'create'){
        $.InfoBox('confirm','info','新建尚未完成','新建没有完成，是否取消之前的开始任务编辑？',function(){
            $(editOne).remove();
            $('.j-list-one.active').removeClass('active');
            $(me).addClass('active');
            var level = $(me).attr('data-level'),
                index,
                course_child_id,
                activity_id,
                step_id,
                task_index,
                course_child_list;
            editOne = $(me);
            $('.j-right>span').html('*编辑后自动保存。新建时把必填项填写完成后会自动新建。');
            if(level === '2'){
                course_child_list = $(me).parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
                type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
            }
            if(level === '3'){
                course_child_list = $(me).parent('div').prev('.j-list-one').parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
                type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
            }
            if(level === '0'){
                if(!$(me).attr('data-id')){
                    context.editType = 'create';
                    insertForm('situation','');
                }else{
                    index = $(me).attr('data-index');
                    insertForm('situation',situationInfo[parseInt(index)],situationInfo[parseInt(index)].course_child_id);
                }

            }else if(level === '1'){
                index = $(me).parent().prev().attr('data-index');
                if(areaInfo.info.type === '1'){
                    insertForm('section',situationInfo[parseInt(index)].sectionData[parseInt($(me).attr('data-index'))],situationInfo[parseInt(index)].course_child_id);
                }else{
                    activity_id = $(me).attr('data-id');
                    insertForm('activity',situationInfo[parseInt(index)].activities[activity_id],situationInfo[parseInt(index)].course_child_id);
                }
            }else if(level === '2' && areaInfo.info.type === '1'){
                index = $(me).parent().parent().prev().attr('data-index');
                activity_id = $(me).parent().prev().attr('data-id');
                context.step_id = step_id = $(me).attr('data-id');
                insertForm('section_child',situationInfo[parseInt(index)].sectionData[parseInt($(me).parent().prev().attr('data-index'))].childs[parseInt($(me).attr('data-index'))],situationInfo[parseInt(index)].course_child_id);
            }else if(level === '2' && type === '1'){
                index = $(me).parent().parent().prev().attr('data-index');
                activity_id = $(me).parent().prev().attr('data-id');
                context.step_id = step_id = $(me).attr('data-id');
                insertForm('step',situationInfo[parseInt(index)].activities[activity_id].steps[step_id],situationInfo[parseInt(index)].course_child_id);
            }else{
                if(type === '1'){
                    index = $(me).parent().parent().parent().prev().attr('data-index');
                    activity_id = $(me).parent().parent().prev().attr('data-id');
                    step_id = $(me).parent().prev().attr('data-id');
                    task_index = $(me).attr('data-index');
                    insertForm('task',situationInfo[parseInt(index)].activities[activity_id].steps[step_id].tasks[task_index],situationInfo[parseInt(index)].course_child_id);
                }else{
                    index = $(me).parent().parent().prev().attr('data-index');
                    activity_id = $(me).parent().prev().attr('data-id');
                    step_id = $(me).attr('data-step-id');
                    insertForm('task',situationInfo[parseInt(index)].activities[activity_id].steps[step_id].tasks[0],situationInfo[parseInt(index)].course_child_id);
                }
            }
            return false;
        },function(){
            return false;
        });
    }else{
        $('.j-list-one.active').removeClass('active');
        $(me).addClass('active');
        var level = $(me).attr('data-level'),
            index,
            course_child_id,
            activity_id,
            step_id,
            task_index,
            course_child_list;
        editOne = $(me);
        $('.j-right>span').html('*编辑后自动保存。新建时把必填项填写完成后会自动新建。');
        if(level === '2'){
            course_child_list = $(me).parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
            type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
        }
        if(level === '3'){
            course_child_list = $(me).parent('div').prev('.j-list-one').parent('div').prev('.j-list-one').parent('div').prev('.j-list-one');
            type = situationInfo[parseInt(course_child_list.attr('data-index'))].type;
        }
        if(level === '0'){
            if(!$(me).attr('data-id')){
                context.editType = 'create';
                insertForm('situation','');
            }else{
                index = $(me).attr('data-index');
                insertForm('situation',situationInfo[parseInt(index)],situationInfo[parseInt(index)].course_child_id);
            }

        }else if(level === '1'){
            index = $(me).parent().prev().attr('data-index');
            if(areaInfo.info.type === '1'){
                insertForm('section',situationInfo[parseInt(index)].sectionData[parseInt($(me).attr('data-index'))],situationInfo[parseInt(index)].course_child_id);
            }else{
                activity_id = $(me).attr('data-id');
                insertForm('activity',situationInfo[parseInt(index)].activities[activity_id],situationInfo[parseInt(index)].course_child_id);
            }
        }else if(level === '2' && areaInfo.info.type === '1'){
            index = $(me).parent().parent().prev().attr('data-index');
            activity_id = $(me).parent().prev().attr('data-id');
            context.step_id = step_id = $(me).attr('data-id');
            insertForm('section_child',situationInfo[parseInt(index)].sectionData[parseInt($(me).parent().prev().attr('data-index'))].childs[parseInt($(me).attr('data-index'))],situationInfo[parseInt(index)].course_child_id);
        }else if(level === '2' && type === '1'){
            index = $(me).parent().parent().prev().attr('data-index');
            activity_id = $(me).parent().prev().attr('data-id');
            context.step_id = step_id = $(me).attr('data-id');
            insertForm('step',situationInfo[parseInt(index)].activities[activity_id].steps[step_id],situationInfo[parseInt(index)].course_child_id);
        }else{
            if(type === '1'){
                index = $(me).parent().parent().parent().prev().attr('data-index');
                activity_id = $(me).parent().parent().prev().attr('data-id');
                step_id = $(me).parent().prev().attr('data-id');
                task_index = $(me).attr('data-index');
                insertForm('task',situationInfo[parseInt(index)].activities[activity_id].steps[step_id].tasks[task_index],situationInfo[parseInt(index)].course_child_id);
            }else{
                index = $(me).parent().parent().prev().attr('data-index');
                activity_id = $(me).parent().prev().attr('data-id');
                step_id = $(me).attr('data-step-id');
                insertForm('task',situationInfo[parseInt(index)].activities[activity_id].steps[step_id].tasks[0],situationInfo[parseInt(index)].course_child_id);
            }
        }
        return false;
    }
};
//入口
$(function(){
/*    var socket = io.connect('http://192.168.1.105:1177');
    socket.emit('join',{})*/
    //领域信息
    getAreaInfo(window.location.hash.split("#")[1],function(){
        //情景树
        var k = 0;
        $('.j-area-name').html(areaInfo.info.coursename);
        $('.j-area-des').html(areaInfo.info.des);
        bindEvent();
        setSize();
        if(areaInfo.info.type === '1'){
            $('.j-new-situation').html('&#xe145添加章节');
        }
        if(!areaInfo.childs.length){
            $('.j-list').append('<p>_(:з」∠)_课程列表空空如也</p>');
        }
        $(areaInfo.childs).each(function(i,c){
            getSituation(c.course_child_id,function(){
                k++;
                if(k === areaInfo.childs.length){
                    window.onresize = function(){
                        setSize();
                    };
                    createTree();
                }
            });
        });
    });
});

var Database = function(con,fileType,belong,callback){
    var me = this;
    me.con = con;
    me.belong = belong;
    me.fileType = fileType;
    me.fileMap = {
        /*root : {
         user_folder_id:'fff',
         folders:[
         {child_folder_id:'1' ,name:"aa",parent_id:'fff'},
         {child_folder_id:'2' ,name:"bb",parent_id:'fff'}
         ],
         files:[
         {file_id:'aaa' ,  name:'11', type:'doc'},
         {file_id:'bbb' ,  name:'22', type:'pdf'}
         ]
         },
         1 : {
         folders:[
         {child_folder_id:'3' ,name:"333",parent_id:'1'}
         ],
         files:[
         {file_id:'aaa1' ,  name:'111', type:'doc'},
         {file_id:'bbb1' ,  name:'221', type:'pdf'}
         ]
         },
         2 : {
         files:[
         {file_id:'aaa2' ,  name:'112', type:'doc'},
         {file_id:'bbb2' ,  name:'222', type:'pdf'}
         ]
         },
         3 : {
         files:[
         {file_id:'aaa3' ,  name:'113', type:'doc'},
         {file_id:'bbb3' ,  name:'223', type:'pdf'}
         ]
         }*/
    };
    me.currentParent = {
        id : 'root',
        name : '全部文件'
    };
    me.resetMe();

    if(me.fileType){
        me.getFileByType(me.fileType,function(){
            callback(me);
        });
    }else{
        me.getAllFile(function(){
            callback(me);
        });
    }
};
Database.prototype = {
    getFileByType : function(type,callback){
        var me = this;
        sendMessage('get',(ports.file.domain === location.origin ? ports.file.domain : ''),'/file/disk/findtype',{filetype:type},function(data){
            if(data && data.code === 201){
                me.currentFiles = data.datas;
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    },
    //获取目录下的文件pathId为文件夹id
    getAllFile : function(callback){
        var me = this;
        me.resetMe();
        /*if(me.fileMap[me.currentParent.id]){
         me.currentFiles = me.fileMap[me.currentParent.id];
         if(!me.userfolderId) me.userfolderId = me.currentFiles.user_folder_id;
         return callback();
         }*/
        if(me.currentParent.id === 'root'){
            sendMessage('get',(ports.file.domain === location.origin ? ports.file.domain : ''),'/file/disk/rootlist',{},function(data){
                if(data && data.code === 201){
                    me.currentFiles = me.fileMap[me.currentParent.id] = data.datas;
                    me.userfolderId = me.currentFiles.user_folder_id;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            sendMessage('get',(ports.file.domain === location.origin ? ports.file.domain : ''),'/file/disk/childfolderlist',{child_folder_id : me.currentParent.id},function(data){
                if(data && data.code === 201){
                    me.currentFiles = me.fileMap[me.currentParent.id] = data.datas;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    },
    resetMe : function(){
        var me = this;
        me.currentFiles = {};
        me.currentParentId = '';
        me.checkedArr = [];
    }
};


var View = function(database){
    this.database = database;
    this.setMainSize();
    this.viewType = 'list';
    window.onresize = this.setMainSize;

    if(this.database.fileType){
        $('.j-'+this.database.fileType+'-file').addClass('active');
    }else{
        $('.j-base-file').addClass('active');
    }

    this.changeFileRoad('file');
    this.refreshFiles();
    this.bindFuns();
};
View.prototype = {
    //绑定事件
    bindFuns : function(){
        var me = this;

        var chooseFile = function(){
            var num = 0,sendData;
            $(me.database.checkedArr).each(function(i,c){
                if(c.type === 'folder')return num += 1;
                sendData = {
                    ele : context.ele,
                    task_id : context.task_id,
                    type : 'cloud_file',
                    fileID : c.id,
                    sourceType : 'myself'
                };
                sendMessage('post',(ports.course.domain === location.origin ? ports.course.domain : ''),'/course/develop/addtaskele?ele='+(me.database.belong === 'step'?'task_result':context.ele)+'&'+(me.database.belong === 'step'?'step_id':'task_id')+'='+(me.database.belong === 'step'?context.step_id:context.task_id)+'&type=cloud_file&fileID='+ c.id+'&sourceType=myself&filename='+ c.name+'&filetype='+ c.type+'&user_folder_id='+database.userfolderId+'&belong='+me.database.belong,{},function(data){
                    if(data.code === 201){
                        num += 1;
                        if(num === me.database.checkedArr.length){
                            $('.j-edit-block').hide();
                            $('.j-nav-back').hide();
                            $('.j-edit-pan').empty();
                            context[context.ele].push({
                                type : 'cloud_file',
                                task_ele_id : data.datas.task_ele_id,
                                task_file_id : data.datas.task_file_id
                            });
                            me.database.con.append('<div class="j-ele-list-one" data-index="'+ (me.database.con.children('.j-ele-list-one').length?me.database.con.children('.j-ele-list-one').length:0) +'" data-ele="'+ context.ele +'" data-type="cloud_file" data-id="'+ data.datas.task_ele_id +'"><h4>'+ c.name +'.' + c.type +'</h4><p>云文件</p><span class="j-icon j-remove"></span><span class="j-preview">编辑</span></div>');
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

        //checkBox 事件绑定
        $('.j-file-select-all').on('click','input[type="checkbox"]',function(){
            var checked = this.checked;
            me.database.checkedArr = [];
            $('.j-file-content').find('input[type="checkbox"]').prop("checked",checked);
            if(checked){
                if(me.viewType === 'list'){
                    $('.j-one-list').addClass('active').each(function(i){
                        me.database.checkedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type'),name:$(this).attr('data-name')});
                    });
                }else{
                    $('.j-one-block').attr('data-checked','yes').addClass('active').each(function(i){
                        me.database.checkedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type'),name:$(this).attr('data-name')});
                    });
                }
            }else{
                if(me.viewType === 'list'){
                    $('.j-one-list').removeClass('active');
                }else{
                    $('.j-one-block').attr('data-checked','no').removeClass('active');
                }
            }
            me.onSelectItemChange();
        });
        //选择文件、文件夹
        $('.j-file-content').on('click','input[type="checkbox"]',function(){
            var parent = $(this).parents('ul');
            var checked = this.checked;
            if(checked){
                parent.addClass('active');
                me.database.checkedArr.push({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type'),name : parent.attr('data-name')});
            }else{
                parent.removeClass('active');
                me.database.checkedArr.splice($.inArray({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')},database.checkedArr),1);
            }
            me.onSelectItemChange();
        }).on('click','.j-one-block>span',function(){
            $('.j-right-click').hide();
            var parent = $(this).parent('.j-one-block');
            var checked = parent.attr('data-checked');
            if(checked === 'no'){
                $(this).parent('.j-one-block').attr('data-checked','yes').addClass('active');
                me.database.checkedArr.push({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type'),name:parent.attr('data-name')});
            }else{
                $(this).parent('.j-one-block').attr('data-checked','no').removeClass('active');
                me.database.checkedArr.splice($.inArray({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')},database.checkedArr),1);
            }
            me.onSelectItemChange();
            return false;
        }).on('click','li.j-list-file-name>p',function(){
            var type = $(this).parents('ul').attr('data-type');
            var id = $(this).parents('ul').attr('data-id');
            var name = $(this).html();
            if(type === 'folder'){
                me.database.currentParent = {
                    id : id,
                    name : name
                };
                me.database.getAllFile(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            }else{//TODO : 打开文件

            }
        }).on('click','.j-one-block',function(){
            var type = $(this).attr('data-type');
            var id = $(this).attr('data-id');
            var name = $(this).find('p').html();
            if(type === 'folder'){
                me.database.currentParent = {
                    id : id,
                    name : name
                };
                me.database.getAllFile(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            }else{//TODO : 打开文件

            }
        });

        $('.j-choose-file').click(function(){
            chooseFile();
        });

        $('.j-path-roads').on('click','span',function(){
            var thisSpan = this;
            me.database.currentParent = {
                id : $(this).attr('data-id'),
                name : $(this).html()
            };
            me.database.getAllFile(function(){
                me.changeFileRoad('top',thisSpan);
                me.refreshFiles();
            });
        });

        $('.j-return-prev').on('click',function(){
            $('.j-path-roads').find('span').last().click();
        });

        $('.j-file-show-type').on('click',function(){
            if(me.viewType === 'list'){
                me.viewType = 'block';
                $(this).html('&#xe8ef');
                me.database.checkedArr = [];
                me.refreshFiles();
            }else{
                me.viewType = 'list';
                $(this).html('&#xe228');
                me.database.checkedArr = [];
                me.refreshFiles();
            }
        });

        $('#j-file-upload').on('change',function(){
            var _this = this;

            me.database.uploadFile(function(){
                $(_this).val('');
                me.database.getAllFile(function(){
                    me.refreshFiles();
                });
            });

        });

        //tool-bar
        $('.j-apps>li').eq(1).click(function(){
            window.location.href = (ports.net.domain === location.origin ? ports.file.domain : '') + '/control/file/share';
        });

        //文件搜索
        $('.j-file-search input').on('input',function(){
            var val = $(this).val();
            if(val){
                me.database.searchedFiles = {
                    files : [],
                    folders : []
                };
                if(me.database.currentFiles.folders){
                    $(me.database.currentFiles.folders).each(function(i,folder){
                        if((folder.name).indexOf(val) > -1){
                            me.database.searchedFiles.folders.push(folder);
                        }
                    });
                }

                if(me.database.currentFiles.files){
                    $(me.database.currentFiles.files).each(function(i,file){
                        if((file.name).indexOf(val) > -1){
                            me.database.searchedFiles.files.push(file);
                        }
                    });
                }
                me.refreshFiles('search');
            }else{
                me.refreshFiles();
            }
        });
    },
    //选中的文件发生变化时执行
    onSelectItemChange : function(){
        var me = this;
        var haveFolder = false;
        if(me.database.checkedArr.length === ($('.j-one-list').length + $('.j-one-block').length)){
            $('.j-file-select-all input[type="checkbox"]').prop("checked",true);
        }else{
            $('.j-file-select-all input[type="checkbox"]').prop("checked",false);
        }
        if(me.database.checkedArr.length > 0){
            $('.j-btn-group').show();
            if(me.database.checkedArr.length > 1){
                $('.j-top-rename').hide();
                $('.j-top-download').hide();
            }else{
                $('.j-top-rename').show();
                $('.j-top-download').show();
            }
        }else{
            $('.j-btn-group').hide();
        }
    },
    changeFileRoad : function(type,currentEle){
        var me = this;
        $('.j-file-search input').val('');
        if(type === 'reset'){
            me.database.currentParent = {
                id : 'root',
                name : '全部文件'
            };
            $('.j-return-prev').hide();
            $('.j-path-roads').empty().append('<p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
            return;
        }
        if(me.database.currentParent.id === 'root'){
            $('.j-return-prev').hide();
            $('.j-path-roads').empty().append('<p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
        }else{
            if(type === 'top'){
                $('.j-return-prev').show();
                $(currentEle).nextAll().remove();
                $(currentEle).replaceWith('<p data-id="'+$(currentEle).attr('data-id')+'">'+$(currentEle).html()+'</p>');
            }else{
                $('.j-return-prev').show();
                var lastP = $('.j-path-roads').find('p');
                lastP.replaceWith('<span data-id="'+lastP.attr('data-id')+'">'+lastP.html()+'</span>');
                $('.j-path-roads').append('<i class="j-icon">&#xe315</i><p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
            }
        }
        if(me.viewType === 'list'){
            $('.j-title-file-name>p').html('文件名');
            $('.j-title-file-size').show();
            $('.j-title-file-date').show();
        }else{
            $('.j-title-file-name>p').html('全选');
            $('.j-title-file-size').hide();
            $('.j-title-file-date').hide();
        }
    },
    //刷新文件列表
    refreshFiles : function(type){
        var me = this;

        var changeSize = function(size){
            if(size >= 1024*1024){
                return (size/(1024*1024)).toFixed(0) + 'MB';
            }else if(1024 <= size && size < 1024*1024){
                return (size/(1024)).toFixed(0) + 'KB';
            }else{
                return size + 'B';
            }
        };

        $('.j-file-select-all input[type="checkbox"]').prop('checked',false);
        var index = 0,content = $('.j-file-content');
        content.empty();
        if(this.viewType === 'list'){
            $('.j-file-show-type').html('&#xe228');
            if(type === 'search'){
                if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                    $(me.database.searchedFiles.folders).each(function(i,folder){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'" data-name="'+folder.name+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.searchedFiles.files && me.database.searchedFiles.files.length){
                    $(me.database.searchedFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'" data-id="'+file.name+'" data-name="'+file.name+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
            }else if(type === 'order'){
                if(me.database.orderedFiles.folders && me.database.orderedFiles.folders.length){
                    $(me.database.orderedFiles.folders).each(function(i,folder){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'" data-name="'+folder.name+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.orderedFiles.files && me.database.orderedFiles.files.length){
                    $(me.database.orderedFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'" data-name="'+file.name+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
            }else{
                if(me.database.currentFiles.folders && me.database.currentFiles.folders.length){
                    $(me.database.currentFiles.folders).each(function(i,folder){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'" data-name="'+folder.name+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.currentFiles.files && me.database.currentFiles.files.length){
                    $(me.database.currentFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'" data-name="'+file.name+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
            }
        }else{
            $('.j-file-show-type').html('&#xe8ef');
            if(type === 'search'){
                if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                    $(me.database.searchedFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'" data-name="'+folder.name+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-folder.png"/>'+
                                '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
                if(me.database.searchedFiles.files && me.database.searchedFiles.files.length){
                    $(me.database.searchedFiles.files).each(function(i,file){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'" data-name="'+file.name+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-doc.png"/>'+
                                '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
            }else if(type === 'order'){
                if(me.database.orderedFiles.folders && me.database.orderedFiles.folders.length){
                    $(me.database.orderedFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'" data-name="'+folder.name+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-folder.png"/>'+
                                '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
                if(me.database.orderedFiles.files && me.database.orderedFiles.files.length){
                    $(me.database.orderedFiles.files).each(function(i,file){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'" data-name="'+file.name+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-doc.png"/>'+
                                '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
            }else{
                if(me.database.currentFiles.folders && me.database.currentFiles.folders.length){
                    $(me.database.currentFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'" data-name="'+folder.name+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-folder.png"/>'+
                                '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
                if(me.database.currentFiles.files && me.database.currentFiles.files.length){
                    $(me.database.currentFiles.files).each(function(i,file){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'" data-name="'+file.name+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-doc.png"/>'+
                                '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
            }
        }
        $('.j-totle-number').empty().append('已全部加载，共'+index+'个');
        me.onSelectItemChange();
    },
    //设置主窗口大小
    setMainSize : function(){
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;
        if(window.innerWidth < 1080){
            if(windowHeight<560){
                mainDiv.css({'width':900,'height':300,'marginRight':0,'borderTopRightRadius':'0','borderRight':'0'});
                $('.j-file-content').css({'height':300 - 107});
            }else{
                mainDiv.css({'width':900,'height':windowHeight - 278,'marginRight':0,'borderTopRightRadius':'0','borderRight':'0'});
                $('.j-file-content').css({'height':windowHeight - 285});
            }
        }else{
            if(windowHeight<560){
                mainDiv.css({'width':windowWidth - 218,'height':300,'marginRight':0,'borderTopRightRadius':'5px','borderRight':'1px solid #dfdfdf'});
                $('.j-file-content').css({'height':300 - 107});
            }else{
                mainDiv.css({'width':windowWidth - 200,'height':windowHeight - 260,'marginRight':20,'borderTopRightRadius':'5px','borderRight':'1px solid #dfdfdf'});
                $('.j-file-content').css({'height':windowHeight - 370});
            }
        }
    }
};