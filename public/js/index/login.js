var username,password;

$(function(){
    sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/initializeinfo','',function(data1) {
        if(data1.code == 201){
            window.location.href = (ports.net.domain === location.origin ? ports.net.domain : '') + '/control';
        }else if(data1.code === 204){
            $.InfoBox('alert','error','错误',data1.err.toString());
        }else{
            username = $('input.username').val();
            password = $('input.password').val();
            document.onkeydown = function(e){
                var ev = document.all ? window.event : e;
                if(ev.keyCode==13) {
                    if(username && password){
                        $('body').find('button').click();
                    }else{
                        $(document.activeElement).parent().next().find('input').focus();
                    }
                }
            };

            $('.j-login').on('focus','input',function(){
                $('.j-login>div').removeClass('active');
                $(this).parent().addClass('active');
            }).on('input','input',function(){
                var val = $(this).val();
                username = $('input.username').val();
                password = $('input.password').val();
                if(val){
                    $(this).parent().find('span').show();
                }else{
                    $(this).parent().find('span').hide();

                }
            }).on('click','.close',function(){
                $(this).prev('input').val('');
                $(this).hide();
            }).on('click','.to_register',function(){
                window.location.href = (ports.net.domain === location.origin ? ports.net.domain : '') + '/register';
            }).on('click','button',function(){
                if(!username){
                    $.InfoBox('alert','error','用户名错误','用户名不能为空！');
                    return false;
                }

                if(!password){
                    $.InfoBox('alert','error','密码错误','密码不能为空！');
                    return false;
                }

                sendMessage('post','','/net/login',{account : username,password:password},function(data){
                    if(data.code == 201){
                        window.location.href = (ports.net.domain === location.origin ? ports.net.domain : '') + '/control';
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            });
        }
    });

});