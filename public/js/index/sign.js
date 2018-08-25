//给文件为绑定登录窗口的事件的操作
var signType,
    isInputCompleted;
var signInit = function(){
    var signBox = $('.j-sign-box');
    var navBack = $('.j-nav-back');
    var header = $('header');

    var sendSignReq = function(){
        var name,
            email,
            password,
            re_password,
            sign_in_body = $('.j-sign-in-body'),
            sign_up_body = $('.j-sign-up-body'),
            err_span = $('.j-sign-body>span');
        if(signType == 'signUp'){
            name = $('#j-name-register').val();
            email = $('#j-email-register').val();
            password = $('#j-password-register').val();
            re_password = $('#j-repassword-register').val();

        }else{
            name = $('#j-name-login').val();
            password = $('#j-password-login').val();
            sendMessage('post','','/net/login',{account : name,password:password},function(data){
                if(data.code == 201){
                    window.location.reload()
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    };

    var signCheck = function(){
        var name,
            password,
            re_password,
            email,
            sign_in_body = $('.j-sign-in-body'),
            sign_up_body = $('.j-sign-up-body'),
            err_span = $('.j-sign-body>span'),
            nameTest = /^([0-9]|[a-z]|[A-Z]|@){1,}$/,
            passwordTest = /^.{3,}$/,
            emailTest = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{1,}$/;

        if(signType == 'signUp'){
            name = $('#j-name-register').val();
            email = $('#j-email-register').val();
            password = $('#j-password-register').val();
            re_password = $('#j-repassword-register').val();

            if(password != re_password){
                $('.j-sign-up-body>span').html('两次输入的密码不一致');
                return false;
            }
            if(!emailTest.exec(email)){
                $('.j-sign-up-body>span').html('请输入正确的邮箱');
                return false;
            }
        }else{
            name = $('#j-name-login').val();
            password = $('#j-password-login').val();
        }

        if(!nameTest.exec(name)){
            err_span.html('用户名不正确，用户名只能由数字、字符、@组成');
            return false;
        }
        if(!passwordTest.exec(password)){
            err_span.html('密码不正确，密码为3位以上');
            return false;
        }

        err_span.html('');
        return true;
    };

    /*关闭登录窗口的事件*/
    signBox.on('click','.j-sign-header>span',function(){
        navBack.hide();
        signBox.hide();
    });

    navBack.on('click',function(){
        navBack.hide();
        signBox.hide();
    });

    /*登录注册切换的事件绑定*/
    signBox.on('click','.j-sign-in',function(){
        if(signType == 'signIn') return;
        isInputCompleted = 0;
        signType = 'signIn';
        $(this).addClass('active');
        $('.j-sign-up').removeClass('active');
        $('.j-sign-in-body').show().children('span').html('').parents('.j-sign-in-body').find('input').val('').eq(0).focus();
        $('.j-sign-up-body').hide();
    });

    signBox.on('click','.j-sign-up',function(){
        if(signType == 'signUp') return;
        isInputCompleted = 0;
        signType = 'signUp';
        $(this).addClass('active');
        $('.j-sign-in').removeClass('active');
        $('.j-sign-up-body').show().children('span').html('').parents('.j-sign-up-body').find('input').val('').eq(0).focus();
        $('.j-sign-in-body').hide();
    });

    /*输入框'×'事件绑定*/
    signBox.on('click','.j-sign-body>div>i',function(){
        $(this).prev('input').val('');
    });

    /*input获得、失去焦点事件*/
    signBox.on('focus','.j-sign-body input',function(){
        $(this).parents('div').addClass('active');
        if($(this).attr('isEnd')) isInputCompleted = 1;
    });

    signBox.on('blur','.j-sign-body input',function(){
        $(this).parents('div').removeClass('active');
    });

    /*回车Enter事件*/
    document.onkeydown = function(e){
        var ev = document.all ? window.event : e;
        if(ev.keyCode==13) {
            if(isInputCompleted){
                if(signType == 'signUp'){
                    $('.j-sign-up-body').find('button').click();
                }else{
                    $('.j-sign-in-body').find('button').click();
                }
            }else{
                $(document.activeElement).parents().next().find('input').focus();
            }
        }
    };
    /*登陆注册按钮事件绑定*/
    signBox.on('click','button',function(){
        if(signCheck()){
            sendSignReq();
        }
    });

    /*header注册、登录按钮事件绑定*/
    header.on('click','.j-sign-in-button',function(){
        navBack.show();
        signBox.show();
        $('.j-sign-in').click();
    });

    header.on('click','.j-sign-up-button',function(){
        window.location.href = '/register';
    });
};