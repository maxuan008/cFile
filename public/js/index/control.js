var currentDeptUser_id;

$(function(){
   /* $('.j-link>li:first').click(function(){
        window.location.href = '/';
    });*/

    /*$('.j-main-list').on('click','.j-first-list>li',function(){
        $('.j-main-list>ul>li.active').removeClass('active');
        $('.j-main-list>ul>ul').hide();
        $(this).next('ul').show();
    });*/
    $('.j-main-content').css({'minHeight':window.innerHeight - 190});
    sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/initializeinfo','',function(data) {
        if (data.code == 201) {

            menuinfo = data.datas.menuinfo;
            personalinfo = data.datas.personalinfo;
            userinfo = data.datas.userinfo;
            orginfo = data.datas.orginfo;
            rolesinfo = data.datas.rolesinfo;
            orgRolesInfo = data.datas.roles;

            var indexMenu = 0;
            var menuItem,menuP;
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
                $('.j-link').append(menuItem);
            });

            $(personalinfo).each(function(i,personal){
                if(personal.developmark){
                    $('.j-main-list>ul').append('<li id="'+personal.app_id+'"><span class="j-icon">&#xe838</span><a href="#'+personal.app_id+'">'+personal.name+'</a></li><ul></ul>');
                    indexMenu ++;
                }else{
                    if(!personal.href){
                        $('.j-main-list>ul').append('<li id="'+personal.app_id+'"><span class="j-icon">&#xe838</span>'+personal.name+'</li><ul></ul>');
                        $(personal.appfuns).each(function(j,fun){
                            $('.j-main-list>ul>ul').eq(indexMenu).append('<li id="'+fun.href+'"><a href="#'+personal.app_id+'/'+fun.href+'">'+fun.name+'</a></li>')
                        });
                        indexMenu ++;
                    }
                }
            });

            $('header>div').append('<div class="j-username">'+userinfo.account+'<i class="j-icon">&#xe5c5</i><div class="j-personal"></div></div>');
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
                            window.location.href = one.domain + person.href;
                        }else{
                            window.location.href = '/control#'+person.app_id+'/'+person.appfuns[0].href;
                        }
                    }
                };
                jPersonal.append(personalItem);
            });
            $('.j-inner').append('<li class="j-icon j-click-logout">&#xe8ac</li>');
            if(rolesinfo && rolesinfo.length && orginfo){
                $(rolesinfo).each(function(i,role){
                    if(role.deptuser_id == orginfo.deptuser_id){
                        currentDeptUser_id = role.deptuser_id;
                        $('header>div').append('<div class="j-change-dept-user">'+role.orgName + '-' + role.deptName+ '-' + role.roleName+'<span class="j-icon">&#xe5c5</span><div class="j-dept-user-select"></div></div>');
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
            HashRead(location.hash.replace(/^#/,""));
            if(!window.location.hash){
                window.location.hash = $('.j-first-list>ul').eq(0).find('a').eq(0).attr('href');
            }
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
});

(function(win){
    var hashchange = win.onhashchange,
        change, //for IE
        loc = location,
        hash = loc.hash,
        delay = 50;
    function gethash(hash){
        return hash.replace(/^#/,"");
    }
    win.onhashchange = function(){
        if(hashchange){
            hashchange = function(){
                func(gethash(loc.hash));
            }
        }else{
            setTimeout(function change(){
                if(loc.hash !== hash){
                    func(gethash(loc.hash));
                    hash = loc.hash;
                }
                setTimeout(change, delay);
            },delay);
        }
    };
}(window));

//??func
var func = function(hash){
    HashRead(hash);
};
/*?URL???????*/
window.onhashchange(func);
/*??url*/
var HashRead = function(hash){
    if(!hash){
        window.history.pushState(null,null,defaultHash);
        return;
    }
    hashRouter(hash.split('/'));
};

var hashRouter = function(hashQueue){
    var page;

    if(hashQueue[0]){
        hashQ = hashQueue;
        pageSelect(hashQ);
    }
    else{
        window.history.pushState(null,null,defaultHash);
    }
};

//选择页面
var pageSelect = function(hashQ){
    $('html,body').animate({ scrollTop: 0}, 0);

    if(hashQ.length == 1){
        $(menuinfo).each(function(i,menu){
            if(menu.app_id == hashQ[0]){
                if(menu.developmark){
                    $('.j-first-list li').removeClass('active');
                    $('#'+hashQ[0]).addClass('active');
                    pullInJavascript(['./js/index/'+menu.developmark+'.js']);
                }
            }
        });
        $(personalinfo).each(function(i,menu){
            if(menu.developmark){
                $('.j-first-list li').removeClass('active');
                $('#'+hashQ[0]).addClass('active');
                pullInJavascript(['./js/index/'+menu.developmark+'.js']);
            }
        });
    }else if(hashQ.length == 2){
        $('.j-first-list li').removeClass('active');
        $('#'+hashQ[1]).addClass('active');
        pullInJavascript(['./js/index/'+hashQ[1]+'.js']);
    }
};