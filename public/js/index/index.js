$(function(){
    sendMessage('post',(ports.net.domain === location.origin ? ports.net.domain : ''),'/net/index/courselist',{},function(data){
        if(data.code === 201){
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
});