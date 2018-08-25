var sendData = {},deptData;

$(function(){
    var initTree = function (fid, index) {
        var resStr = '', have = false, childStr;
        $(deptData).each(function (i, dept) {
            if (dept.father_id == fid) {
                have = true;
                childStr = initTree(dept.dept_id, index + 1);
                if (childStr) {
                    resStr += '<li data-level="' + index + '" data-id="' + dept.dept_id + '"><i class="j-icon j-tree-toggle">&#xe313</i><p>' + dept.name + '</p></li>'+childStr;
                } else {
                    resStr += '<li data-level="' + index + '" data-id="' + dept.dept_id + '"><i class="j-icon j-tree-toggle"></i><p>' + dept.name + '</p></li>';
                }
            }
        });
        if (have) {
            return '<ul>' + resStr + '</ul>'
        } else {
            return '';
        }
    };

    $('.j-register-item').on('focus','#j-org,#j-role',function(){
        $(this).find('option[value=""]').remove();
    }).on('blur','select',function(){
        var item = $(this).attr('data-name');
        sendData[item] = $(this).val();
        $(this).next('span').html('&#xe876').css({'color':'#00ff33'});
        if(item == 'org_id'){
            sendData.role_id = '';
            if(sendData.dept_id){
                sendData.dept_id = '';
                $('#j-dept').find('option').val('').html('—请选择—');
                $('#j-dept').next().next('span').html('&#xe645 请重新选择').css({'color':'#ff0000'});
                $('#j-dept').find('option').attr('selected',false);
                $('#j-dept').empty().prepend('<option value="" selected>—请选择—</option>');
            }
            if(sendData.role_id){
                sendData.role_id = '';
                $('#j-role').next('span').html('&#xe645 请重新选择').css({'color':'#ff0000'});
            }

            sendMessage('get', (ports.net.domain == location.host ? ports.net.domain : ''), '/net/register/searchdept_register', {org_id:sendData[item]}, function (deptdata) {
                if (deptdata.code == 201) {
                    deptData = deptdata.datas;
                    if (deptData.length) {
                        $('#j-dept-select').empty().append(initTree(sendData[item], 1));
                    }
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });

            sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/register/searchroles_register',{org_id:sendData[item]},function(data){
                if(data.code == 201){
                    $(data.datas).each(function(i,role){
                     $('#j-role').append('<option value="'+role.role_id+'">'+role.name+'</option>')
                     });
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
        if(sendData.org_id && sendData.dept_id && sendData.role_id){
            $('.j-register-head li').eq(0).removeClass('current').addClass('complete');
            $('.j-register-head li').eq(1).addClass('current');
        }
    }).on('click','#j-dept',function(){
        $(this).empty();
        $(this).next('div').toggle(200);
    }).on('click','#j-dept-select li',function(){
        $('#j-dept').next().next('span').html('&#xe876').css({'color':'#00ff33'});
        var dept_id = $(this).attr('data-id');
        var name = $(this).find('p').html();
        $('#j-dept').append('<option value="'+dept_id+'">'+name+'</option>');
        $('#j-dept-select').toggle(200);
        sendData.dept_id = dept_id;
    }).on('change','#j-account',function(){
        var account = $(this).val();
        if((/^([0-9]|[a-z]|[A-Z]|@){1,}$/).test(account)){
            sendData.account = account;
            $(this).next('span').html('&#xe876').css({'color':'#00ff33'});
        }else{
            sendData.account = '';
            $(this).next('span').html('&#xe645 用户名输入错误').css({'color':'#ff0000'});
        }
    }).on('change','#j-password',function(){
        var password = $(this).val();
        if((/^.{3,}$/).test(password)){
            sendData.password = password;
            $(this).next('span').html('&#xe876').css({'color':'#00ff33'});
        }else{
            sendData.password = '';
            $(this).next('span').html('&#xe645 密码输入错误').css({'color':'#ff0000'});
        }
    }).on('change','#j-re-password',function(){
        var re_password = $(this).val();
        if(sendData.password == re_password){
            $(this).next('span').html('&#xe876').css({'color':'#00ff33'});
        }else{
            $(this).next('span').html('&#xe645 两次输入的密码不一样').css({'color':'#ff0000'});
        }
    }).on('change','#j-email',function(){
        var email = $(this).val();
        if((/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{1,}$/).test(email)){
            sendData.email = email;
            $(this).next('span').html('&#xe876').css({'color':'#00ff33'});
        }else{
            sendData.email = '';
            $(this).next('span').html('&#xe645 请输入正确的邮箱').css({'color':'#ff0000'});
        }
    });

    sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/register/searchorg_register',{},function(data){
        if(data.code == 201){
            $(data.datas).each(function(i,org){
                $('#j-org').append('<option value="'+org.org_id+'">'+org.name+'</option>')
            });
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
    $('.j-register-button').click(function(){
        if(!sendData.org_id){
            $.InfoBox('alert','error','信息缺失','没选择组织！');
            return;
        }

        if(!sendData.dept_id){
            $.InfoBox('alert','error','信息缺失','没选择机构！');
            return;
        }

        if(!sendData.role_id){
            $.InfoBox('alert','error','信息缺失','没选择角色！');
            return;
        }

        if(!sendData.account){
            $.InfoBox('alert','error','信息错误','用户名没填写或填写错误！');
            return;
        }

        if(!sendData.password){
            $.InfoBox('alert','error','信息错误','密码没填写或填写错误！');
            return;
        }

        if(!sendData.email){
            $.InfoBox('alert','error','信息错误','邮箱没填写或填写错误！');
            return;
        }

        sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/register/apply',sendData,function(data){
            if(data.code == 201){
                window.location.href = '/';
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    });

    $('.j-logo').click(function(){
        window.location.href = '/';
    });
});