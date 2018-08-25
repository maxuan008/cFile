var orgData,tmpChangeData;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height});
        container.empty().append(
                '<p>组织添加</p>'+
                '<div class="j-add-col">'+
                '<div>'+
                '<div class="j-field-con"><p>组织名称</p>'+
                '<input type="text" placeholder="请输入组织名称"/></div>'+
                '<div class="j-field-con"><p>账户</p>'+
                '<input type="text" placeholder="请输入账户"/></div>'+
                '<div class="j-field-con"><p>密码</p>'+
                '<input type="password" placeholder="请输入密码"/></div>'+
                '<div class="j-col-add-button"><button>添加</button><span></span></div>'+
                /*'</div></div><p>组织查看</p>'+*/
                '<div class="j-table">'+
                /*'<input  id="j-org-search-input" type="text" placeholder="请输入组织名称"/>'+
                '<button id="j-org-search-button">查询</button>'+*/
                '<table><thead>'+
                '<tr><th>#</th><th>组织名称</th><th>操作</th></tr>'+
                '</thead><tbody></tbody></table>'+
                '<span></span></div>');
        next();
    };

    init(function(){
        var tbody = $('.j-table tbody');
        var addCol = $('.j-add-col');

        $('.j-table span').hide();
        $('.j-col-add-button span').hide();

        var initTable = function(datas){
            tbody.empty();
            $(datas).each(function(i,data){
                tbody.append('<tr data-id="'+data.org_id+'"><td>'+$('tr').length+'</td><td><input type="text" value="'+data.name+'"/></td><td><button class="j-icon">&#xe9d6</button></td></tr>')
            });
        };
        /*获得表单初始化数据*/
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/searchorg',{},function(data){
            if(data.code == 201){
                orgData = data.datas;
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
            var id = $(me).parents('tr').attr('data-id');
            $.InfoBox('confirm','info','是否删除','是否删除该组织？',function(){
                sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/delorg',{id:id},function(data){
                    if(data.code == 201){
                        $(me).parents('tr').remove();
                        $('.j-col-add-button span').hide();
                        //alert('删除组织成功！');
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
        tbody.on('blur','input',function(){
            /*如果输入框、选项框值不变*/
            var me = this;
            if(tmpChangeData == $(this).val()) return;
            $('.j-table span').hide().empty();
            var id = $(this).parents('tr').attr('data-id');
            var name = $(this).parents('tr').find('input').eq(0).val();
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/updateorg',{id:id,name:name},function(data){
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
            var orgName = $('.j-add-col input').eq(0).val(),
                account = $('.j-add-col input').eq(1).val(),
                password = $('.j-add-col input').eq(2).val();
            $('.j-field-con input').val('');

            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/addorg',{name:orgName,account : account,password: password},function(data){
                if(data.code == 201){
                    tbody.prepend('<tr data-id="'+data.datas.org_id+'"><td>'+$('tr').length+'</td><td><input type="text" value="'+orgName+'"/></td><td><button class="j-icon">&#xe9d6</button></td></tr>');
                    //alert('添加组织成功！');
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
            sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/searchorg',{name:name},function(data){
                if(data.code == 201){
                    orgData = data.datas;
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