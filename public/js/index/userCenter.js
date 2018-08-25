var sendOrgData = {},deptData;

$(function(){
    var initTree = function (fid, index) {
        var resStr = '', have = false, childStr;
        $(deptData).each(function (i, dept) {
            if (dept.father_id === fid) {
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
    //拿到用户初始化信息
    sendMessage('get',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/initializeinfo','',function(data){
        if(data.code === 201){
            menuinfo = data.datas.menuinfo;
            personalinfo = data.datas.personalinfo;
            userinfo = data.datas.userinfo;
            orginfo = data.datas.orginfo;
            rolesinfo = data.datas.rolesinfo;
            orgRolesInfo = data.datas.roles;

            initEles();
            initClick();
        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });

    //添加节点
    var initEles = function(){
        if(userinfo.headpngpath) $('.j-touxiang-img').attr('src',(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+userinfo.headpngpath);
        $('#fullname').val(userinfo.fullname);
        $('#email').val(userinfo.email);
        if(rolesinfo && rolesinfo.length && orginfo){
            $(rolesinfo).each(function(i,role){
                if(role.deptuser_id === orginfo.deptuser_id){
                    $('#default-role').append('<option value="'+role.deptuser_id+'" selected>'+role.orgName + '-' + role.deptName+ '-' + role.roleName+'</option>');
                }else{
                    $('#default-role').append('<option value="'+role.deptuser_id+'">'+role.orgName + '-' + role.deptName+ '-' + role.roleName+'</option>');
                }
            });
        }else{
            $('#default-role').append('<option val="" selected>您还没有加入组织机构</option>');
        }
    };
    var uploadTouxiang = function(callback){
        var me = this;

        var progressHandler = function(e){
            console.log(e);
        };

        var beforeSendHandler = function(){
        };

        var completeHandler = function(data){
            callback(data);
        };

        var errorHandler = function(){
            callback(false);
        };

        var formData = new FormData($('form')[0]);
        $.ajax({
            url: (ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/uploadheadpng',
            type: 'POST',
            xhr: function() {  // custom xhr
                myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // check if upload property exists
                    myXhr.upload.addEventListener('progress',progressHandler, false); // for handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax事件
            beforeSend: beforeSendHandler,
            success: completeHandler,
            error: errorHandler,
            // Form数据
            data: formData,
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false,
            processData: false
        });
    };
    //事件绑定
    var initClick = function(){
        $('#j-touxiang-upload').on('change',function(){
            var _this = this;
            if(!$('#j-touxiang-upload').val()) return false;
            var filename = $('#j-touxiang-upload').val().split('\\');
            var filetype = filename[filename.length-1].split('.')[filename[filename.length-1].split('.').length-1];
            if(filetype !== 'png' &&filetype !== 'jpg' &&filetype !== 'PNG' &&filetype !== 'JPG' ){
                $.InfoBox('alert','error','格式不对','上传的文件格式不对(.png或.jpg)！');
                return false;
            }else{
                var fileSize = (this.files[0].size).toFixed(2);
                if(fileSize > 1048576){
                    $.InfoBox('alert','error','文件过大','上传的文件过大(文件不能大于1M)！');
                    return false;
                }else{
                    uploadTouxiang(function(data){
                        if(data.code === 201){
                            $('.j-touxiang-img').attr('src',(ports.net.domain == location.host ? ports.net.domain : '')+'/net/user/downloadpng?path='+data.datas.path);
                            $(_this).val('');
                        }else if(data.code === 204){
                            $.InfoBox('alert','error','错误',data.err.toString());
                        }else{
                            $.InfoBox('alert','error','用户信息错误','请重新登录！');
                            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                        }
                    });
                }
            }


        });

        $('input').on('blur',function(){
            var me = this;
            if($(this).attr('type') === 'file') return false;
            var title = $(this).attr('id');
            sendData = {};
            sendData[title] = $(this).val();
            if(sendData[title] === userinfo[title] && title !== 'password') return false;
            sendMessage('post',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/user/updateuserinfo',sendData,function(data){
                if(data.code === 201){
                    $(me).css({'color':'green'});
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
        //用户信息修改
        $('#add-org-btn').click(function(){
            //$(this).unbind('click');
            $('.j-add-org').slideDown(200);
            sendMessage('get',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/register/searchorg_register',{},function(data){
                if(data.code === 201){
                    $(data.datas).each(function(i,org){
                        $('#select-org').append('<option value="'+org.org_id+'">'+org.name+'</option>');
                    });
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
        //组织信息
        $('#select-org').on('blur',function(){
            if($(this).val()){
                sendOrgData.org_id = $(this).val();

                if(sendOrgData.dept_id){
                    sendOrgData.dept_id = '';
                    $('#select-dept').find('option').val('').html('—请选择—');
                    //$('#select-dept').next().next('span').html('&#xea0d 请重新选择').css({'color':'#ff0000'});
                    $('#select-dept').find('option').attr('selected',false);
                    $('#select-dept').empty().prepend('<option value="" selected>—请重新选择—</option>');
                }
                if(sendOrgData.role_id){
                    sendOrgData.role_id = '';
                    $('#j-role').next('span').html('&#xea0d 请重新选择').css({'color':'#ff0000'});
                }

                sendMessage('get', (ports.net.domain === location.host ? ports.net.domain : ''), '/net/register/searchdept_register', {org_id:sendOrgData.org_id}, function (deptdata) {
                    if (deptdata.code == 201) {
                        deptData = deptdata.datas;
                        if (deptData.length) {
                            $('#j-dept-select').empty().append(initTree(sendOrgData.org_id, 1));
                        }
                    }else if(deptdata.code === 204){
                        $.InfoBox('alert','error','错误',deptdata.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });

                sendMessage('get',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/register/searchroles_register',{org_id:sendOrgData.org_id},function(data){
                    if(data.code === 201){
                        $('#select-role').empty();
                        $(data.datas).each(function(i,role){
                            $('#select-role').append('<option value="'+role.role_id+'">'+role.name+'</option>');
                        });
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }


        });

        $('#select-dept').click(function(){
            $(this).empty();
            $(this).next('div').toggle(200);
        });

        $('.j-add-org').on('click','#j-dept-select li',function(){
            //$('#select-dept').next().next('span').html('&#xea10').css({'color':'#00ff33'});
            var dept_id = $(this).attr('data-id');
            var name = $(this).find('p').html();
            $('#select-dept').append('<option value="'+dept_id+'">'+name+'</option>');
            $('#j-dept-select').toggle(200);
            sendOrgData.dept_id = dept_id;
        });

        $('#select-role').on('blur',function(){
            sendOrgData.role_id = $(this).val();
        });

        $('.j-add-org button').click(function(){
            if(!sendOrgData.org_id){
                $.InfoBox('alert','error','数据不全','没选择组织！');
                return;
            }

            if(!sendOrgData.dept_id){
                $.InfoBox('alert','error','数据不全','没选择机构！');
                return;
            }

            if(!sendOrgData.role_id){
                $.InfoBox('alert','error','数据不全','没选择角色！');
                return;
            }

            sendMessage('post',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/user/applydeptuser',sendOrgData,function(data){
                if(data.code === 201){
                    $.InfoBox('alert','success','成功','您已经成功申请！');
                    sendOrgData = {};
                    $('#select-org').empty().append('<option value="">—请选择—</option>');
                    $('#select-dept').empty().append('<option value="">—请先选择组织—</option>');
                    $('#j-dept-select').empty();
                    $('#select-role').empty().append('<option value="">—请先选择组织—</option>');
                    $('.j-add-org').hide();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        $('#default-role').on('blur',function(){
            var deptUserId = $(this).val();
            sendMessage('post',(ports.net.domain === location.host ? ports.net.domain : ''),'/net/user/setdefaultrole',{deptuser_id:deptUserId},function(data){
                if(data.code === 201){
                    $.InfoBox('alert','success','成功','切换成功！');
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
    };
});