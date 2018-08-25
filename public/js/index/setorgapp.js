var orgAppData;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height})
        container.empty().append(
                '<p>组织功能授权</p>'+
                '<div class="j-table">'+
                '<table><thead>'+
                '<tr><th>组织名称</th><th>功能名称</th></tr>'+
                '</thead><tbody></tbody></table></div>');
        next();
    };

    init(function(){
        var tbody = $('.j-table tbody');

        var getAddTr = function(data){
            var appendStr = '';

            appendStr += '<tr>';

            appendStr += '<td>'+data.org_name+'</td>';
            appendStr += '<td><ul>';
            $(data.orgappdocs).each(function(i,roleApp){
                if(roleApp.status == '0'){
                    appendStr += '<li data-id="'+roleApp.org_app_id+'"><div><span data-status="0" class="j-icon">&#xe835</span></div><div><p>'+roleApp.name+'</p></div></li>';
                }else{
                    appendStr += '<li data-id="'+roleApp.org_app_id+'"><div><span data-status="1" class="j-icon">&#xe834</span></div><div><p>'+roleApp.name+'</p></div></li>';
                }
            });

            appendStr += '</ul></td></tr>';
            return appendStr;
        };

        var initTable = function(datas){
            tbody.empty();
            $(datas).each(function(i,data){
                tbody.append(getAddTr(data));
            });
        };
        /*获得表单初始化数据*/
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/getorgapp',{},function(data){
            if(data.code == 201){
                orgAppData = data.datas;
                initTable(data.datas);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });

        /*更新表单数据*/
        tbody.on('click','li>div>span',function(){
            var me = this;
            var org_app_id = $(this).parents('li').attr('data-id');
            var currentStatus = $(this).attr('data-status');

            var sendData = {
                org_app_id : org_app_id,
                status : (currentStatus == '0'?'1':'0')
            };

            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/updateorgapp',sendData,function(data){
                if(data.code == 201){
                    $(me).attr('data-status',sendData.status).html((currentStatus == '0'?'&#xe834':'&#xe835'));
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