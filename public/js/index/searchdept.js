var deptData,deptUserData,oldValue,selectedDeptId;

(function(container){
    /*添加功能模板*/
    var init = function(next){
        var height = window.innerHeight - 80;
        container.css({'minHeight':height})
        var appendStr = '<p>机构人员管理</p>'+
            '<ul class="j-tree"><li data-level="0" data-id="'+orginfo.org_id+'"><i data-open="1" class="j-icon j-tree-toggle">&#xe313</i><p>'+orginfo.orgName+'</p><span class="j-icon j-tree-add">&#xe145</span></li></ul>'+//<span class="j-icon j-tree-remove">&#xe9d6</span><span class="j-icon j-tree-edit">&#xe22b</span>
            '<div class="j-add-user">'+
            '<div class="j-field-con"><p>用户名</p>'+
            '<input data-name="account" type="text" placeholder="请输入用户名"/></div>'+
            '<div class="j-field-con"><p>密码</p>'+
            '<input data-name="password" type="password" placeholder="请输入密码"/></div>'+
            '<div class="j-field-con"><p>角色</p>'+
            '<select data-name="role">';

        $(orgRolesInfo).each(function (i, role) {
            appendStr += '<option value="' + role.role_id + '">' + role.name + '</option>';
        });

        appendStr += '</select></div>'+
            '<div class="j-col-add-button"><button>添加</button><span></span></div>'+
            '<table><thead>'+
            '<tr><th>#</th><th>用户名</th><th>角色</th><th>状态</th><th>操作</th></tr>'+
            '</thead><tbody></tbody></table><span></span></div>';


        container.empty().append(appendStr);
        next();
    };

    init(function() {
        var tree = $('.j-tree');
        var addCol = $('.j-add-user');
        var tbody = $('.j-add-user tbody');

        var getAddTr = function (data) {
            var appendStr = '';

            appendStr += '<tr data-id="' + data.deptuser_id + '">';

            appendStr += '<td>' + $('tr').length + '</td>';
            appendStr += '<td>' + data.account + '</td>';
            appendStr += '<td><select data-name="role_id">';

            $(orgRolesInfo).each(function (i, role) {
                if (role.role_id == data.role_id) {
                    appendStr += '<option selected value="' + role.role_id + '">' + role.name + '</option>';
                } else {
                    appendStr += '<option value="' + role.role_id + '">' + role.name + '</option>';
                }
            });
            appendStr += '</select></td>';

            if (data.status == '0') {
                appendStr += '<td><select data-name="status"><option value="0" selected>未审核</option><option value="1">已审核</option></select></td>';
            } else {
                appendStr += '<td><select data-name="status"><option value="0">未审核</option><option value="1" selected>已审核</option></select></td>';
            }

            appendStr += '<td><button class="j-icon">&#xe9d6</button></td>';

            appendStr += '</tr>';
            return appendStr;
        };

        var initTable = function (datas) {
            tbody.empty();
            $(datas).each(function (i, data) {
                tbody.append(getAddTr(data));
            });
        };

        var initTree = function (fid, index) {
            var resStr = '', have = false, childStr;
            $(deptData).each(function (i, dept) {
                if (dept.father_id == fid) {
                    have = true;
                    childStr = initTree(dept.dept_id, index + 1);
                    if (childStr) {
                        resStr += '<li data-level="' + index + '" data-id="' + dept.dept_id + '"><i data-open="1" class="j-icon j-tree-toggle">&#xe313</i><p>' + dept.name + '</p><input class="j-tree-input-edit" type="text" value="' + dept.name + '"/><span class="j-icon j-tree-remove">&#xe9d6</span><span class="j-icon j-tree-edit">&#xe22b</span><span class="j-icon j-tree-add">&#xe145</span></li>'+childStr;
                    } else {
                        resStr += '<li data-level="' + index + '" data-id="' + dept.dept_id + '"><i class="j-icon j-tree-toggle"></i><p>' + dept.name + '</p><input class="j-tree-input-edit" type="text" value="' + dept.name + '"/><span class="j-icon j-tree-remove">&#xe9d6</span><span class="j-icon j-tree-edit">&#xe22b</span><span class="j-icon j-tree-add">&#xe145</span></li>';
                    }

                }
            });
            if (have) {
                return '<ul>' + resStr + '</ul>'
            } else {
                return '';
            }
        };
        /*获得表单初始化数据*/
        //                orgAppData = data.datas;
//                initTable(data.datas);
        sendMessage('get', (ports.net.domain == location.host ? ports.net.domain : ''), '/net/org/searchdept', {}, function (deptdata) {
            if (deptdata.code == 201) {
                deptData = deptdata.datas;
                if (deptData.length) {
                    $('.j-tree').append(initTree(orginfo.org_id, 1)).find('li').eq(1).find('p').click();
                }
            }else if(deptdata.code === 204){
                $.InfoBox('alert','error','错误',deptdata.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });

        /*更新表单数据*/
        tree.on('click', 'li>p', function () {
            var me = this, dept_id;
            if ($(this).parent('li').attr('data-level') == '0') {
                if ($(this).prev('i').attr('data-open') == '1') {
                    $(this).prev('i').attr('data-open', '0').html('&#xe315').parent('li').next('ul').toggle(100);
                } else {
                    $(this).prev('i').attr('data-open', '1').html('&#xe313').parent('li').next('ul').toggle(100);
                }
            } else {
                selectedDeptId = dept_id = $(this).parent('li').attr('data-id');
                sendMessage('get', (ports.net.domain == location.host ? ports.net.domain : ''), '/net/org/searchdeptuser', {dept_id: dept_id}, function (data) {
                    if (data.code == 201) {
                        $('.j-tree li.active').removeClass('active');
                        $(me).parent('li').addClass('active');
                        deptUserData = data.datas;
                        initTable(data.datas);
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }).on('click', '.j-tree-toggle', function () {
            if ($(this).attr('data-open') == '1') {
                $(this).attr('data-open', '0').html('&#xe315').parent('li').next('ul').toggle(100);
            } else {
                $(this).attr('data-open', '1').html('&#xe313').parent('li').next('ul').toggle(100);
            }
        }).on('click', '.j-tree-remove', function () {
            var me = this;
            $.InfoBox('confirm','info','是否删除','删除机构以下将被删除，是否确认删除？（该机构下所有的用户、文件，该机构下的所有子机构以及用户、文件）',function(){
                var dept_id = $(_this).parent('li').attr('data-id');
                sendMessage('post', (ports.net.domain == location.host ? ports.net.domain : ''), '/net/org/deldept', {dept_id: dept_id}, function (data) {
                    if (data.code == 201) {
                        $(me).parent('li').next('ul').remove();
                        $(me).parent('li').remove();
                        //alert('删除机构成功！');
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            });
        }).on('click', '.j-tree-edit', function () {
            var parentLi = $(this).parent('li');
            parentLi.find('p').hide();
            parentLi.find('input').show().focus();
        }).on('focus', '.j-tree-input-edit,.j-tree-input-add', function () {
            oldValue = $(this).val();
            $(this).css({'color': '#474747'});
        }).on('blur', '.j-tree-input-edit', function () {
            var me = this, newValue;
            if ($(this).val() == oldValue) {
                $(this).hide().parent('li').find('p').show();
            } else {
                var dept_id = $(this).parent('li').attr('data-id');
                newValue = $(this).val();
                sendMessage('post', (ports.net.domain == location.host ? ports.net.domain : ''), '/net/org/updatedept', {dept_id: dept_id, name: newValue}, function (data) {
                    if (data.code == 201) {
                        $(me).hide();
                        $(me).parent('li').find('p').html(newValue).css({'color': '#00CC66'}).show();
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }).on('blur', '.j-tree-input-add', function () {
            var me = this, newValue;
            if ($(this).val() == oldValue) {
                if($(this).parent('li').parent('ul').find('li').length == 1){
                    $(this).parent('li').parent('ul').prev('li').find('i').html('');
                    $(this).parent('li').parent('ul').remove();
                }else{
                    $(this).parent('li').remove();
                }
            } else {
                var father_id = $(this).parent('li').parent('ul').prev('li').attr('data-id'),
                    level = parseInt($(this).parent('li').parent('ul').prev('li').attr('data-level')) + 1;
                newValue = $(this).val();
                sendMessage('post', (ports.net.domain == location.host ? ports.net.domain : ''), '/net/org/adddept', {father_id: father_id, name: newValue, level: level}, function (data) {
                    if (data.code == 201) {
                        $(me).removeClass('j-tree-input-add').addClass('j-tree-input-edit').hide();
                        $(me).parent('li').attr('data-id', data.datas.dept_id).find('p').html(newValue).css({'color': '#00CC66'}).show();
                    }else if(data.code === 204){
                        $.InfoBox('alert','error','错误',data.err.toString());
                    }else{
                        $.InfoBox('alert','error','用户信息错误','请重新登录！');
                        window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                    }
                });
            }
        }).on('click', '.j-tree-add', function () {
            var addPlace;
            var level = parseInt($(this).parent('li').attr('data-level')) + 1;
            if ($(this).parent('li').next('ul').length) {
                addPlace = $(this).parent('li').next('ul');
                addPlace.prepend('<li data-level="' + level + '"><i class="j-icon j-tree-toggle"></i><p></p><input class="j-tree-input-add" type="text" value=""/><span class="j-icon j-tree-remove">&#xe9d6</span><span class="j-icon j-tree-edit">&#xe22b</span><span class="j-icon j-tree-add">&#xe145</span></li>');
                addPlace.find('li').eq(0).find('p').hide();
                addPlace.find('li').eq(0).find('input').show().focus();
            } else {
                $(this).parent('li').find('i').attr('data-open','1').html('&#xe313').parent('li').after('<ul><li data-level="' + level + '"><i class="j-icon j-tree-toggle"></i><p></p><input class="j-tree-input-add" type="text" value=""/><span class="j-icon j-tree-remove">&#xe9d6</span><span class="j-icon j-tree-edit">&#xe22b</span><span class="j-icon j-tree-add">&#xe145</span></li></ul>');
                addPlace = $(this).parent('li').next('ul');
                addPlace.find('li').eq(0).find('p').hide();
                addPlace.find('li').eq(0).find('input').show().focus();
            }
        });

        addCol.on('click','.j-col-add-button>button',function(){
            var role_id = $('.j-add-user select').eq(0).val(),
                account = $('.j-add-user input').eq(0).val(),
                password = $('.j-add-user input').eq(1).val(),
                status = '1';
            $('.j-field-con input').eq(0).val('');
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/adddeptuser',{dept_id:selectedDeptId,role_id:role_id,account : account,password: password,status:status},function(data){
                if(data.code == 201){
                    data.datas.role_id = role_id;
                    data.datas.account = account;
                    data.datas.password = password;
                    data.datas.status = status;
                    tbody.prepend(getAddTr(data.datas));
                    //alert('添加用户成功！');
                    $('.j-col-add-button span').hide();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });

        tbody.on('click','button',function(){
            $('.j-add-user span').hide().empty();
            var me = this;
            var deptuser_id = $(me).parents('tr').attr('data-id');
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/deldeptuser',{deptuser_id:deptuser_id},function(data){
                if(data.code == 201){
                    $(me).parents('tr').remove();
                    //alert('删除用户成功！');
                    $('.j-add-user span').hide();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }).on('focus','input,select',function(){
            oldValue = $(this).val();
            $(this).css({'color':'#474747'});
        }).on('blur','input,select',function(){
            /*如果输入框、选项框值不变*/
            var me = this;
            if(oldValue == $(this).val()) return;
            $('.j-add-user span').hide().empty();
            var deptuser_id = $(this).parents('tr').attr('data-id');
            var sendData = {deptuser_id : deptuser_id};
            sendData[$(this).attr('data-name')] = $(this).val();
            sendMessage('post',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/org/updatedeptuser',sendData,function(data){
                if(data.code == 201){
                    $(me).css({'color':'#00CC66'});
                    $('.j-add-user span').hide();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        });
    });
})($('.j-main-content'));