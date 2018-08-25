var orgAppData,tmpChangeData;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        container.empty().append(
                '<p>组织功能授权</p>'+
                '<div class="j-table">'+
                '<table><thead>'+
                '<tr><th>#</th><th>组织名称</th><th>功能名称</th><th>功能标签</th></tr>'+
                '</thead><tbody></tbody></table></div>');
        next();
    };

    init(function(){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height});
        var tbody = $('.j-table tbody');

        $('.j-table span').hide();
        $('.j-col-add-button span').hide();

        var getAddTr = function(){
            var appendStr = '';

            appendStr += '<tr data-id="'+data.role_id+'">';
            appendStr += '<td>'+$('tr').length+'</td>';


            if(data.status == '1'){
                appendStr += '<td><input data-name="name" type="text" value="'+data.name+'"/></td>';

                if(data.type == 'student') appendStr += '<td><select data-name="type"><option value="student" selected>学生</option><option value="teacher">老师</option><option value="other">其他</option></select></td>';
                else if(data.type == 'teacher') appendStr += '<td><select data-name="type"><option value="student">学生</option><option value="teacher" selected>老师</option><option value="other">其他</option></select></td>';
                else if(data.type == 'other') appendStr += '<td><select data-name="type"><option value="student">学生</option><option value="teacher">老师</option><option value="other" selected>其他</option></select></td>';

                appendStr += '<td>可用</td>';

                appendStr += '<td><button class="j-icon">&#xe9ad</button></td>';
            }else{
                appendStr += '<td>data.name</td>';

                if(data.type == 'student') appendStr += '<td>学生</td>';
                else if(data.type == 'teacher') appendStr += '<td>老师</td>';
                else if(data.type == 'other') appendStr += '<td>其他</td>';

                else if(data.status == '2') appendStr += '<td>锁定</td>';

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
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/searchorg',{},function(data){
            if(data.code == 201){
                orgData = data.datas;

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
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/role/delrole',{role_id:role_id},function(data){
                if(data.code == 201){
                    $(me).parents('tr').remove();
                    $('.j-table span').hide();
                    //alert('删除角色成功！');
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        tbody.on('focus','input,select',function(){
            tmpChangeData = $(this).val();
            $(this).css({'color':'#474747'});
        });
        /*更新表单数据*/
        tbody.on('blur','input,select',function(){
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