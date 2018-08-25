var fnData,tmpChangeData;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height})
        container.empty().append(
                '<p>功能添加</p>'+
                '<div class="j-add-col"><div>'+
                '<div class="j-field-con"><p>功能id</p>'+
                '<input type="text" placeholder="请输入功能id"/></div>'+
                '<div class="j-field-con"><p>功能名称</p>'+
                '<input type="text" placeholder="请输入功能名称"/></div>'+
                '<div class="j-field-con"><p>主域名</p>'+
                '<input type="text" placeholder="请输入主域名"/></div>'+
                '<div class="j-field-con"><p>子域名</p>'+
                '<input type="text" placeholder="请输入子域名"/></div>'+
                '<div class="j-field-con"><p>开发标识</p>'+
                '<input type="text" placeholder="请输入开发标识"/></div>'+
                '<div class="j-field-con"><p>是否跳转</p>'+
                '<select><option value="0">当前页面打开</option><option value="1">在新页面打开</option></select></div>'+
                '<div class="j-field-con"><p>归属用户(type)</p>'+
                '<select><option value="0">普通用户</option><option value="1">企业用户</option><option value="2">超级管理员</option></select></div>'+
                '<div class="j-field-con"><p>所处位置</p>'+
                '<select><option value=1>主菜单</option><option value=2>用户下拉菜单</option></select></div>'+
                '<div class="j-col-add-button"><button>添加</button><span></span></div>'+
                /*'</div></div><p>功能查看</p>'+*/
                '<div class="j-table">'+
                /*'<input  id="j-org-search-input" type="text" placeholder="请输入功能名称"/>'+
                '<button id="j-org-search-button">查询</button>'+*/
                '<table><thead>'+
                '<tr><th>#</th><th>功能id</th><th>功能名称</th><th>主域名</th><th>子域名</th><th>开发标识</th><th>是否跳转</th><th>归属用户</th><th>所处位置</th><th>操作</th></tr>'+
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
            appendStr += '<tr data-app_id="'+data.app_id+'">';
            appendStr += '<td>'+$('tr').length+'</td>';
            appendStr += '<td><input data-name="app_id" type="text" value="'+data.app_id+'"/></td>';
            appendStr += '<td><input data-name="name" type="text" value="'+data.name+'"/></td>';
            appendStr += '<td><input data-name="domain" type="text" value="'+data.domain+'"/></td>';
            appendStr += '<td><input data-name="href" type="text" value="'+data.href+'"/></td>';
            appendStr += '<td><input data-name="developmark" type="text" value="'+data.developmark+'"/></td>';

            if(data.isblank == '0') appendStr += '<td><select data-name="isblank"><option value="0" selected>当前页面打开</option><option value="1">在新页面打开</option></select></td>';
            else if(data.isblank == '1') appendStr += '<td><select data-name="isblank"><option value="0">当前页面打开</option><option value="1" selected>在新页面打开</option></select></td>';

            if(data.type == '0') appendStr += '<td><select data-name="type"><option value="0" selected>普通用户</option><option value="1">企业用户</option><option value="2">超级管理员</option></select></td>';
            else if(data.type == '1') appendStr += '<td><select data-name="type"><option value="0">普通用户</option><option value="1" selected>企业用户</option><option value="2">超级管理员</option></select></td>';
            else if(data.type == '2') appendStr += '<td><select data-name="type"><option value="0">普通用户</option><option value="1">企业用户</option><option value="2" selected>超级管理员</option></select></td>';

            if(data.position == '1') appendStr += '<td><select data-name="position"><option value="1" selected>主菜单</option><option value="2">用户下拉菜单</option></select></td>';
            else if(data.position == '2') appendStr += '<td><select data-name="position"><option value="1">主菜单</option><option value="2" selected>用户下拉菜单</option></select></td>';

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
        /*获得表单初始化数据*/
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/searchapp',{},function(data){
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
            var id = $(me).parents('tr').find('input').eq(0).val();
            $.InfoBox('confirm','info','是否删除','是否删除该功能？',function(){
                sendMessage('post','','/net/app/delapp',{id:id},function(data){
                    if(data.code == 201){
                        $(me).parents('tr').remove();
                        $('.j-col-add-button span').hide();
                        //alert('删除功能成功！');
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
            var id = $(this).parents('tr').attr('data-app_id');
            var name = $(this).parents('tr').find('input').eq(1).val();
            var sendData = {
                id : id,
                name : name
            };
            sendData[$(this).attr('data-name')] = $(this).val();
            if($(this).attr('data-name') == 'app_id'){
                $(this).parents('tr').attr('data-app_id',$(this).val());
            }
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/updateapp',sendData,function(data){
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
            var id = $('.j-add-col input').eq(0).val();
            var name = $('.j-add-col input').eq(1).val();
            var domain = $('.j-add-col input').eq(2).val();
            var href = $('.j-add-col input').eq(3).val();
            var developmark = $('.j-add-col input').eq(4).val();
            var isblank = $('.j-add-col select').eq(0).val();
            var type = $('.j-add-col select').eq(1).val();
            var position = $('.j-add-col select').eq(2).val();
            $('.j-field-con input').val('');
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/addapp',{id:id,name:name,domain:domain,href:href,developmark:developmark,isblank:isblank,type:type,position:position},function(data){
                if(data.code == 201){
                    tbody.prepend(getAddTr({app_id:id,name:name,domain:domain,isblank:isblank,type:type,position:position,href:href,developmark:developmark}));
                    //alert('添加功能成功！');
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
            sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/app/searchapp',{name:name},'',function(data){
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