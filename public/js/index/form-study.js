var form_id,eles;

var getFormHtml = function(next){
    sendMessage('post','','/form/study/getstudyform',{study_html_id : form_id},function(data){
        if(data.code === 201){
            next(data.datas);
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var submitFormHtml = function(){
    $.InfoBox('alert','info','成功','提交成功！');
};

var submitFormValue = function(){
    var name,id,val;
    name = $(this).attr('name');
    val = $(this).val();
    $(eles).each(function(i,e){
        if(e.name === name){
            id = e.study_html_ele_id;
        }
    });
    sendMessage('post','','/form/study/updatestudyformele',{study_html_ele_id : id,value : val},function(data){
        if(data.code === 201){
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
};

var bindEvent = function(){
    $('.j-submit').on('click',submitFormHtml);

    $('input').on('blur',submitFormValue);
};

$(function(){
    form_id = window.location.hash.split("#")[1];
    getFormHtml(function(data){
        $('.j-con').append(data.forminfo.code);
        eles = data.eles;
        $(data.eles).each(function(i,a){
            $('input[name="'+a.name+'"]').val(a.value?a.value:'');
        });
        bindEvent();
    });

});