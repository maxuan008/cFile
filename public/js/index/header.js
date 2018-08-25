/*初始化HEADER*/
var initHeader = function(){
    sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/initializeinfo','',function(data){
        if(data.code == 201){
            menuinfo = data.datas.menuinfo;
            personalinfo = data.datas.personalinfo;
            userinfo = data.datas.userinfo;
            orginfo = data.datas.orginfo;
            rolesinfo = data.datas.rolesinfo;
            orgRolesInfo = data.datas.roles;
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }

        var jLink = $('.j-link'),
            jInner = $('.j-inner');

        /*$('.j-logo').click(function(){
            window.location.href = '/';
        });
*/
        jLink.empty().append('<li class="j-home"><p>控制台</p></li>');

        $('.j-home').click(function(){
            window.location.href = '/control';
        });

        jInner.empty();
        $('.j-username').remove();
        if(userinfo){
            jInner.append('<li class="j-click-logout"><p></p><i class="j-icon">&#xe8ac</i></li>');
            $('.j-click-logout').click(function(){
                sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/logout',{},function(data){
                    if(data.code === 201){
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            });
            var menuItem,menuP;
            //console.log(menuinfo,personalinfo,userinfo,orginfo,rolesinfo);
            $(menuinfo).each(function(i,one){
                menuItem = document.createElement('li');
                menuP = document.createElement('p');menuItem.appendChild(menuP);
                menuP.innerHTML = one.name;
                menuItem.onclick = function(){
                    if(one.developmark){
                        window.location.href = '/control#'+one.app_id;
                    }else{
                        if(one.href){
                            window.location.href = one.domain + one.href;
                        }else{
                            window.location.href = '/control#'+one.app_id+'/'+one.appfuns[0].href;
                        }
                    }
                };
                jLink.append(menuItem);
            });

            jInner.append('<li class="j-icon j-username"><p>'+userinfo.account+'</p><i class="j-icon">&#xe5c5</i><div class="j-personal"></div></div>');
            var personalItem;
            var jPersonal = $('.j-personal');
            jPersonal.empty().append('<a href="/userCenter">个人中心</a>');
            $(personalinfo).each(function(i,person){
                personalItem = document.createElement('a');
                personalItem.innerHTML = person.name;
                personalItem.onclick = function(){
                    if(person.developmark){
                        window.location.href = '/control#'+person.app_id;
                    }else{
                        if(person.href){
                            window.location.href = person.domain + person.href;
                        }else{
                            window.location.href = '/control#'+person.app_id+'/'+person.appfuns[0].href;
                        }
                    }
                };
                jPersonal.append(personalItem);
            });


            if(rolesinfo && rolesinfo.length && orginfo){
                $(rolesinfo).each(function(i,role){
                    if(role.deptuser_id == orginfo.deptuser_id){
                        currentDeptUser_id = role.deptuser_id;
                        jInner.append('<li class="j-icon j-username"><p>'+role.orgName + '-' + role.deptName+ '-' + role.roleName+'</p><i class="j-icon">&#xe5c5</i><div class="j-dept-user-select"></div></div>');
                    }
                });
                var dept_a;
                $(rolesinfo).each(function(i,role){
                    dept_a = document.createElement('a');dept_a.innerHTML = role.orgName + '-' + role.deptName+ '-' + role.roleName;$(dept_a).attr('data-id',role.deptuser_id).click(function(){
                        if(!($(this).attr('data-id') == currentDeptUser_id)){
                            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/user/changerole',{deptuser_id:$(this).attr('data-id')},function(data){
                                if(data.code === 201){

                                }else if(data.code === 204){
                                    $.InfoBox('alert','error','错误',data.err.toString());
                                }else{
                                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                                }
                            })
                        }
                    });

                    $('.j-dept-user-select').append(dept_a).css({'height':(30 * rolesinfo.length)});
                });
            }else{
                $('#default-role').append('<option val="" selected>您还没有加入组织机构</option>');
            }
        }else{
            $('.j-inner').append('<li class="j-sign-up-button"><p>注册</p></li><li class="j-sign-in-button"><p>登录</p></li>');
            $('body').append('<div class="j-nav-back"></div><div class="j-sign-box">'+
                '<div class="j-sign-header">'+
                '<div class="j-sign-in active">登录</div>'+
                '<div class="j-sign-up">注册</div>'+
                '<span class="j-icon j-sign-close">&#xe5cd</span></div>'+
                '<div class="j-sign-body j-sign-in-body"><div>'+
                '<span class="j-icon">&#xe7fd</span>'+
                '<input id="j-name-login" type="text" placeholder="请输入您的用户名"/>'+
                '<i class="j-icon">&#xe5cd</i></div><div>'+
                '<span class="j-icon">&#xe897</span>'+
                '<input id="j-password-login" isEnd=1 type="password" placeholder="请输入您的密码"/>'+
                '<i class="j-icon">&#xe5cd</i></div>'+
                '<span>用户名或密码错误</span>'+
                '<button>登录</button></div>'+
                '<div class="j-sign-body j-sign-up-body"><div>'+
                '<span class="j-icon">&#xe06b</span>'+
                '<input id="j-name-register" type="text" placeholder="请输入您的用户名"/>'+
                '<i class="j-icon">&#xe5cd</i></div><div>'+
                '<span class="j-icon">&#xe04c</span>'+
                '<input id="j-email-register" type="text" placeholder="请输入您的邮箱"/>'+
                '<i class="j-icon">&#xe5cd</i></div><div>'+
                '<span class="j-icon">&#xe03d</span>'+
                '<input id="j-password-register" type="password" placeholder="请输入您的密码"/>'+
                '<i class="j-icon">&#xe5cd</i></div><div>'+
                '<span class="j-icon">&#xe03d</span>'+
                '<input id="j-repassword-register" isEnd=1 type="password" placeholder="请再次输入您的密码"/>'+
                '<i class="j-icon">&#xe5cd</i></div>'+
                '<span>用户名或密码错误</span>'+
                '<button>注册</button></div></div>');

            if(typeof(signInit)=="function")
            {
                signInit();
            }else{
                pullInJavascript(['./js/index/sign.js'],function(){
                    signInit();
                });
            }
        }
    });
};


    initHeader();
