var roleData,tmpChangeData;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height})
        container.empty().append(
                '<p>角色添加</p>'+
                '<div class="j-add-col"><div>'+
                '<div class="j-field-con"><p>角色名称(name)</p>'+
                '<input type="text" placeholder="请输入角色名称"/></div>'+
                '<div class="j-field-con"><p>角色类型(type)</p>'+
                '<select><option value="other">其他</option><option value="student">学生</option><option value="teacher">老师</option></select></div>'+
                '<div class="j-col-add-button"><button>添加</button><span></span></div>'+
                /*'</div></div><p>角色查看</p>'+*/
                '<div class="j-table">'+
                '<table><thead>'+
                '<tr><th>#</th><th>角色名称(name)</th><th>角色类型(type)</th><th>角色状态(status)</th><th>操作</th></tr>'+
                '</thead><tbody></tbody></table><span></span></div>');
        next();
    };

    init(function(){
        var tbody = $('.j-table tbody');
        var addCol = $('.j-add-col');

        $('.j-table span').hide();
        $('.j-col-add-button span').hide();

        var getAddTr = function(data){
            var appendStr = '';

            appendStr += '<tr data-id="'+data.role_id+'">';
            appendStr += '<td>'+$('tr').length+'</td>';


            if(data.status == '1'){
                appendStr += '<td><input data-name="name" type="text" value="'+data.name+'"/></td>';

                if(data.type == 'student') appendStr += '<td><select data-name="type"><option value="student" selected>学生</option><option value="teacher">老师</option><option value="other">其他</option></select></td>';
                else if(data.type == 'teacher') appendStr += '<td><select data-name="type"><option value="student">学生</option><option value="teacher" selected>老师</option><option value="other">其他</option></select></td>';
                else if(data.type == 'other') appendStr += '<td><select data-name="type"><option value="student">学生</option><option value="teacher">老师</option><option value="other" selected>其他</option></select></td>';

                appendStr += '<td><select data-name="status"><option value="other">可用</option><option value="student">锁定</option></select></td>';

                appendStr += '<td><button class="j-icon">&#xe9d6</button></td>';
            }else{
                appendStr += '<td>'+data.name+'</td>';

                if(data.type == 'student') appendStr += '<td>学生</td>';
                else if(data.type == 'teacher') appendStr += '<td>老师</td>';
                else if(data.type == 'other') appendStr += '<td>其他</td>';
                
                appendStr += '<td>锁定</td>';

                appendStr += '<td>/</td>';
            }


            appendStr += '</tr>';
            return appendStr;
        };

        var initTable = function(datas){
            tbody.empty();
            $(datas).each(function(i,data){
                tbody.append(getAddTr(data));
            });
        };
        /*获得表单初始化数据*/
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/role/searchroles',{},function(data){
            if(data.code == 201){
                fnData = data.datas;
                initTable(data.datas);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
        /*删除tr事件*/
        tbody.on('click','button',function(){
            $('.j-table span').hide().empty();
            var me = this;
            var role_id = $(me).parents('tr').attr('data-id');
            $.InfoBox('confirm','info','是否删除','是否删除该角色？',function(){
                sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/role/delrole',{role_id:role_id},function(data){
                    if(data.code == 201){
                        $(me).parents('tr').remove();
                        //alert('删除角色成功！');
                        $('.j-table span').hide();
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            });
        });

        tbody.on('focus','input,select',function(){
            tmpChangeData = $(this).val();
            $(this).css({'color':'#474747'});
        });
        /*更新表单数据*/
        tbody.on('blur','input,select',function(){//TODO : 锁定之后不能修改
            /*如果输入框、选项框值不变*/
            var me = this;
            if(tmpChangeData == $(this).val()) return;
            $('.j-table span').hide().empty();
            var role_id = $(this).parents('tr').attr('data-id');
            var sendData = {role_id : role_id};
            sendData[$(this).attr('data-name')] = $(this).val();
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/role/updaterole',sendData,function(data){
                if(data.code == 201){
                    $(me).css({'color':'#00CC66'});
                    $('.j-table span').hide();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
        /*添加数据事件*/
        addCol.on('click','.j-col-add-button button',function(){
            $('.j-col-add-button span').hide().empty();
            var name = $('.j-add-col input').eq(0).val();
            var type = $('.j-add-col select').eq(0).val();
            $('.j-field-con input').val('');
            var status = '1';
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/role/addrole',{name:name,type:type,status:status},function(data){
                if(data.code == 201){
                    tbody.prepend(getAddTr({role_id:data.datas.role_id,name:name,type:type,status:status}));
                    //alert('添加角色成功！');
                    $('.j-col-add-button span').hide();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
        /*搜索按钮*/
        $('#j-org-search-button').on('click',function(){
            var name = $(this).prev().val();
            sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/role/searchroles',{name:name},'',function(data){
                if(data.code == 201){
                    fnData = data.datas;
                    initTable(data.datas);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
    });

})($('.j-main-content'));