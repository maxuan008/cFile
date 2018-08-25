var fnData,childFnData,searchedId,tmpChangeData;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height})
        container.empty().append(
                '<p>子功能添加</p>'+
                '<div class="j-add-col"><div>'+
                '<div class="j-field-con"><p>功能名称</p>'+
                '<select></select></div>'+
                '<div class="j-field-con"><p>子功能名称</p>'+
                '<input type="text" placeholder="请输入子功能名称"/></div>'+
                '<div class="j-field-con"><p>打开方式(type)</p>'+
                '<select><option value="0">非iframe</option><option value="1">iframe</option></select></div>'+
                '<div class="j-field-con"><p>开发标签或路径</p>'+
                '<input type="text" placeholder="请输入开发标签或路径"/></div>'+
                '<div class="j-col-add-button"><button>添加</button><span></span></div>'+
                /*'</div></div><p>子功能查看</p>'+*/
                '<div class="j-table">'+
                '<table><thead>'+
                '<tr><th>#</th><th>子功能名称</th><th>打开方式(type)</th><th>开发标签或路径</th><th>操作</th></tr>'+
                '</thead><tbody></tbody></table><span></span></div>');
        /*获得app数据*/
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/searchapp',{},function(data){
            if(data.code == 201){
                fnData = data.datas;
                /*添加app下拉框选项*/
                $(fnData).each(function(i,data){
                    $('.j-add-col select').eq(0).append('<option value="'+data.app_id+'">'+data.name+'</option>');
                    $('#j-org-search-input').append('<option value="'+data.app_id+'">'+data.name+'</option>');
                });
                next();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    };

    init(function(){
        var tbody = $('.j-table tbody');
        var addCol = $('.j-add-col');

        $('.j-table span').hide();
        $('.j-col-add-button span').hide();
        /*组装添加的tr*/
        var getAddTr = function(data){
            var appendStr = '';
            appendStr += '<tr data-id="'+data.fun_id+'">';
            appendStr += '<td>'+$('tr').length+'</td>';
            appendStr += '<td><input data-name="name" type="text" value="'+data.name+'"/></td>';

            if(data.type == '0') appendStr += '<td><select data-name="type"><option value="0" selected>非iframe</option><option value="1">iframe</option></select></td>';
            else if(data.type == '1') appendStr += '<td><select data-name="type"><option value="0">非iframe</option><option value="1" selected>iframe</option></select></td>';

            appendStr += '<td><input data-name="href" type="text" value="'+data.href+'"/></td>';

            appendStr += '<td><button class="j-icon">&#xe9d6</button></td>';

            appendStr += '</tr>';
            return appendStr;
        };

        var initTable = function(datas){
            tbody.empty();
            $(datas).each(function(i,data){
                tbody.append(getAddTr(data));
            });
        };

        searchedId = fnData[0].app_id;
        /*获得表单初始化数据*/
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/searchappfuns',{app_id:searchedId},function(data){
            if(data.code == 201){
                childFnData = data.datas;
                initTable(data.datas);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
        /*删除表单tr事件*/
        tbody.on('click','button',function(){
            var me = this;
            $('.j-table span').hide().empty();
            var id = $(me).parents('tr').attr('data-id');
            $.InfoBox('confirm','info','是否删除','是否删除该子功能？',function(){
                sendMessage('post','','/net/app/delappfun',{fun_id:id},function(data){
                    if(data.code == 201){
                        $(me).parents('tr').remove();
                        //alert('删除子功能成功！');
                        $('.j-col-add-button span').hide();
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
        tbody.on('blur','input,select',function(){
            /*如果输入框、选项框值不变*/
            var me = this;
            if(tmpChangeData == $(this).val()) return;
            $('.j-table span').hide().empty();
            var fun_id = $(this).parents('tr').attr('data-id');
            var sendData = {
                fun_id : fun_id,
                app_id : searchedId
            };
            sendData[$(this).attr('data-name')] = $(this).val();
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/updateappfun',sendData,function(data){
                if(data.code == 201){
                    $(me).css({'color':'#00CC66'});
                    $('.j-col-add-button span').hide();
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
            var app_id = $('.j-add-col select').eq(0).val();
            var name = $('.j-add-col input').eq(0).val();
            var type = $('.j-add-col select').eq(1).val();
            var href = $('.j-add-col input').eq(1).val();
            $('.j-field-con input').val('');
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/addappfun',{app_id:app_id,name:name,type:type,href:href},function(data){
                if(data.code == 201){
                    if(searchedId == app_id){
                        data.datas.app_id = app_id;
                        data.datas.name = name;
                        data.datas.type = type;
                        data.datas.href = href;
                        tbody.prepend(getAddTr(data.datas));
                    }
                    $('.j-col-add-button span').hide();
                    //alert('添加子功能成功！');
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
        /*app下拉框值改变，重新组装table*/
        $('.j-add-col').on('change','select:first',function(){
            searchedId = $(this).val();
            sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/searchappfuns',{app_id:searchedId},function(data){
                if(data.code == 201){
                    childFnData = data.datas;
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