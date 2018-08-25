var courses,org,sendData = {},userArray,recordArray  = [],currentPage = 0,course_child_data,courseMap;


(function(container){
  

$('.j-main-content').empty().append('<div class="j-record-c"><div class="j-record"><p>始发地</p><div style="z-index: 2"><input id="fromcity" value="CAN" ></div></div><div class="j-record"><p>目的地</p><div style="z-index: 1"><input id="tocity" value="KUL" > </div></div><div class="j-record"><p>出发日期</p><div style="z-index: 1"><input id="flydate" value="2017-10-28" ></div></div><button id="search" >搜索</button></div><div class="j-record-header"><span >航班号</span><span>航班时间</span><span>币种</span><span>乘客类型</span><span>价格</span></div><div class="j-record-body"></div><div class="j-record-footer"><div></div></div>');




        $('.j-record-c').on('click','button',function(){
            //$("#search).click(function(){
    
            var fromcity = $("#fromcity").val() ,   tocity = $("#tocity").val() ,  flydate  = $("#flydate").val() ;

            if(!fromcity){
                $.InfoBox('alert','error','搜索条件不全','请选择出发地！');
                return false;
            }

            if(!tocity){
                $.InfoBox('alert','error','搜索条件不全','请选择目的地！');
                return false;
            }

            if(!flydate){
                $.InfoBox('alert','error','搜索条件不全','请填写目的地！');
                return false;
            }

            sendMessage('post',(ports.study.domain === location.host ? ports.study.domain : ''),'/flight/search/test',{fromcity:fromcity,tocity:tocity, flydate:flydate  },function(data){
                if(data.code === 201){
                    var htmlstr = '';
                    var flightdatas = data.datas;
                    for(var i=0;i< flightdatas.length ;i++) {
                        var htmlstr = htmlstr + 
                        '<div class="j-record-header">' + 
                        '<span>'+  flightdatas[i].flightid +' </span><span>'+ flightdatas[i].timeshort +'</span><span>'+ flightdatas[i].currency +'</span><span>'+ flightdatas[i].pptype +'</span><span>'+ flightdatas[i].price_value +'</span>' + 
                        '</div>';
                    }
            
                    $(".j-record-body").html(htmlstr);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
 




})($('.j-main-content'));