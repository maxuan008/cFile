var menuinfo,
    personalinfo,
    userinfo,
    orginfo,
    rolesinfo,
    orgRolesInfo,
    defaultHash;

var ports = {
    net : {domain : ''},
    file : {domain : ''},
    course : {domain : ''},
    onlyOffice : {domain : 'http://192.168.0.103'},
    exam : {domain : ''},
    study : {domain : ''},
    socket : {domain : 'http://'+window.location.hostname+':1177'}
};

var sendMessage = function(type,port,url,data,next){
    if(type === 'get'){
        $.get(port + url,data,function(data,status){
            if(status === 'success'){
                next(data);
            }else{
                console.log(port,url,status);
            }
        });
    }
    else if(type === 'post'){
        $.post(port + url,data,function(data,status){
            if(status === 'success'){
                next(data);
            }else{
                console.log(port,url,status);
            }
        });
    }
};

//引入JS

var pullInJavascript = function(srcs,next){
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src=srcs[0];
    srcs.shift();
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script);
    script.onload = script.onreadystatechange = function(){
        if(!this.readyState||this.readyState=='loaded'||this.readyState=='complete'){
            if(srcs.length){
                pullInJavascript(srcs,next);
            }else if(next){
                next();
            }
        }
        script.onload = script.onreadystatechange = null;
    };
};

//时间格式化
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

//文件下载
$.download = function(url, data, method){
    if( url && data ){
        // data 是 string 或者 array/object
        data = typeof data == 'string' ? data : $.param(data);        // 把参数组装成 form的  input
        var inputs = '';
        $.each(data.split('&'), function(){
            var pair = this.split('=');
            inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />';
        });        // request发送请求
        $('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
            .appendTo('body').submit().remove();
    }
};

$.fn.putCursorAtEnd = function() {
    return this.each(function() {
        // Cache references
        var $el = $(this),
            el = this;
        // Only focus if input isn't already
        if (!$el.is(":focus")) {
            $el.focus();
        }
        // If this function exists... (IE 9+)
        if (el.setSelectionRange) {
            // Double the length because Opera is inconsistent about whether a carriage return is one character or two.
            var len = $el.val().length * 2;
            // Timeout seems to be required for Blink
            setTimeout(function() {
                el.setSelectionRange(len, len);
            }, 1);
        } else {
            // As a fallback, replace the contents with itself
            // Doesn't work in Chrome, but Chrome supports setSelectionRange
            $el.val($el.val());
        }
        // Scroll to the bottom, in case we're in a tall textarea
        // (Necessary for Firefox and Chrome)
        this.scrollTop = 999999;
    });
};


var uuid = function(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
};

var putCursorEnd = function($e){
    if($e.attr('type') == 'file') return;
    //把焦点放到文本末尾
    if ($e[0].setSelectionRange) {
        var len = $e.val().length * 2;
        setTimeout(function() {
            $e[0].setSelectionRange(len, len);
        }, 1);
    } else {
        $e.val($e.val());
    }
};

$.InfoBox = function(type,state,title,msg,f1,f2){
    var msg,box,bg;
    bg = '<div class="j-alert-bg"></div>';
    if(state === 'success'){//e420 #5bb75b
        msg = '<i class="j-icon" style="color:#5bb75b">&#xe420</i><p>'+msg+'</p>'
    }else if(state === 'info'){//e88f
        msg = '<i class="j-icon" style="color:#49afcd">&#xe88f</i><p>'+msg+'</p>'
    }else if(state === 'warming'){//e8fd
        msg = '<i class="j-icon" style="color:#f89406">&#xe8fd</i><p>'+msg+'</p>'
    }else{//e001
        msg = '<i class="j-icon" style="color:#bd362f">&#xe001</i><p>'+msg+'</p>'
    }
    if(type === 'alert'){
        box = '<div class="j-alert"><div class="j-alert-header"><h4>'+title+'</h4><span class="j-icon close">&#xe5cd</span></div><div class="j-alert-body">'+msg+'</div><div class="j-alert-footer"><button class="yes">确定</button></div></div>';
    }else{
        box = '<div class="j-alert"><div class="j-alert-header"><h4>'+title+'</h4><span class="j-icon close">&#xe5cd</span></div><div class="j-alert-body">'+msg+'</div><div class="j-alert-footer"><button class="yes">确定</button><button class="no">取消</button></div></div></div>';
    }
    $('body').append(box).append(bg);

    $('.j-alert-bg').click(function(){
        if(typeof f2 === 'function'){
            f2();
        }
        $('.j-alert-bg').remove();
        $('.j-alert').remove();
    });
    $('.j-alert').on('click','span.close',function(){
        if(typeof f2 === 'function'){
            f2();
        }
        $('.j-alert-bg').remove();
        $('.j-alert').remove();
    }).on('click','button.no',function(){
        if(typeof f2 === 'function'){
            f2();
        }
        $('.j-alert-bg').remove();
        $('.j-alert').remove();
    }).on('click','button.yes',function(){
        if(typeof f1 === 'function'){
            f1();
        }
        $('.j-alert-bg').remove();
        $('.j-alert').remove();
    });
};