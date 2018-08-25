var view,
    database,
    windowHeight,
    windowWidth,
    mainDiv = $('.j-main');

var Database = function(callback){
    var me = this;

    me.windowCurrentParent = {
        id : "root",
        name : "全部文件"
    };

    me.currentParent = {
        id : "root",
        name : "全部文件"
    };
    me.resetMe();

    var count = 0;
    me.getUserData(function(){
        count ++ ;
        if(count == 2){
            callback(me);
        }
    });
    me.getDeptTree(function(){
        count ++ ;
        if(count == 2){
            callback(me);
        }
    });
};
Database.prototype = {
    //获取机构的共享文件
    getDeptFiles : function(callback){
        var me = this;
        me.resetMe();
        if(me.currentParent.id == 'root'){
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/deptrootlist',{dept_id : me.currentDept},function(data){
                if(data && data.code == 201){
                    me.currentFiles = data.datas;
                    me.userfolderId = me.currentFiles.dept_folder_id;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/deptchildfolderlist',{shore_folder_id : me.currentParent.id},function(data){
                if(data && data.code == 201){
                    me.currentFiles = data.datas;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    },
    //共享文件
    shareFiles : function(callback){
        var me = this,parent_id;
        var total = 0,success = 0,err = 0;
        $(me.windowCheckedArr).each(function(i,one){
            if(one.type == 'folder'){
                if(me.currentParent.id == 'root') parent_id = me.userfolderId;
                else parent_id = me.currentParent.id;
                sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/isfoldershored',{child_folder_id:one.id,dept_id:me.currentDept},function(data){
                    if(data && data.code == 201){
                        if(data.datas.flag || true){
                            sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/shorefoldertodept',{parent_id:parent_id,child_folder_id:one.id,dept_id:me.currentDept,role_id:'-1'},function(data){
                                if(data && data.code == 201){
                                    success ++ ;
                                }else{
                                    err ++ ;
                                }
                                total ++ ;
                                if(total === me.windowCheckedArr.length){
                                    $.InfoBox('alert','info','共享完成',total + '个共享完成，其中' + success + '个成功，' + err + '个失败！');
                                    callback();
                                }
                            });
                        }else{
                            success ++ ;
                            total ++ ;
                            if(total == me.windowCheckedArr.length){
                                $.InfoBox('alert','info','共享完成',total + '个共享完成，其中' + success + '个成功，' + err + '个失败！');
                                callback();
                            }
                        }
                    }else{
                    }
                });
            }else{
                if(me.currentParent.id == 'root') parent_id = me.userfolderId;
                else parent_id = me.currentParent.id;
                sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/deptshorefile',{parent_id:parent_id,file_id:one.id,dept_id:me.currentDept,role_id:'-1'},function(data){
                    if(data && data.code == 201){
                        success ++ ;
                    }else{
                        err ++ ;
                    }
                    total ++ ;
                    if(total == me.windowCheckedArr.length){
                        $.InfoBox('alert','info','共享完成',total + '个共享完成，其中' + success + '个成功，' + err + '个失败！');
                        callback();
                    }
                });
            }
        });
        if(me.windowCheckedArr.length == 1){

        }else{
            callback();
        }
    },
    getMyFiles : function(callback){
        var me = this;

        if(me.windowCurrentParent.id == 'root'){
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/rootlist',{},function(data){
                if(data && data.code == 201){
                    me.windowCurrentFiles = data.datas;
                    me.windowUserfolderId = me.windowCurrentFiles.user_folder_id;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/childfolderlist',{child_folder_id : me.windowCurrentParent.id},function(data){
                if(data && data.code == 201){
                    me.windowCurrentFiles = data.datas;
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    },
    getUserData : function (callback) {
        var me = this;
        sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/initializeinfo','',function(data) {
            if (data.code == 201) {
                menuinfo = data.datas.menuinfo;
                personalinfo = data.datas.personalinfo;
                userinfo = data.datas.userinfo;
                orginfo = data.datas.orginfo;
                rolesinfo = data.datas.rolesinfo;
                orgRolesInfo = data.datas.roles;
                me.currentDept = orginfo.dept_id;
                    callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    },
    getDeptTree : function(callback){
        var me = this;
        sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/net/org/getdepttree',{},function(data){
            if(data && data.code == 201){
                me.deptTree = data.datas;
                callback();
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    },
    resetMe : function(){
        var me = this;
        me.currentFiles = {};
        me.currentParentId = '';
        me.checkedArr = [];
    },
    windowResetMe : function(){
        var me = this;
        me.windowCurrentFiles = {};
        me.windowCurrentParentId = '';
        me.windowCheckedArr = [];
    }
};


var View = function(database){
    var me = this;
    me.database = database;
    me.viewType = 'list';
    me.resizeWindow();
    window.onresize = this.resizeWindow;
    me.bindClick();
    $('.j-dept-list').append('<li data-level="0" data-id="'+orginfo.dept_id+'"><i class="j-icon j-tree-toggle">&#xe5cf</i><p>'+orginfo.deptName+'</p></li><ul class="j-dept-root-ul"></ul>')
    $('.j-dept-root-ul').append(me.initTree(orginfo.dept_id,1));
    $('.j-dept-list li[data-level="0"]').click();
};
View.prototype = {
    //生成机构树
    initTree : function (fid, index) {
        var me = this;
        var resStr = '', have = false, childStr;
        $(me.database.deptTree).each(function (i, dept) {
            if (dept.father_id == fid) {
                have = true;
                childStr = me.initTree(dept.dept_id, index + 1);
                if (childStr) {
                    resStr += '<li data-level="' + index + '" data-id="' + dept.dept_id + '"><i class="j-icon j-tree-toggle">&#xe5cf</i><p>' + dept.name + '</p></li>'+childStr;
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
    },
    bindClick : function () {
        var me = this;

        var downloadFile = function(){
            $(me.database.checkedArr).each(function(i,one){
                $.download((ports.file.domain == location.host ? ports.file.domain : '')+'/file/disk/downloadsharefile','shore_file_id='+one.id,'post');
            });

        };

        $('.j-top-download').click(function(){
            downloadFile();
        });

        $('.j-share-window').on('click','.j-close',function(){
            $('.j-share-window').hide();
            $('.j-nav-back').hide();
        }).on('click','.j-file-select-all input[type="checkbox"]',function(){
            var checked = this.checked;
            me.database.windowCheckedArr = [];
            $('.j-share-window .j-file-content').find('input[type="checkbox"]').prop("checked",checked);
            if(checked){
                if(me.viewType == 'list'){
                    $('.j-share-window .j-one-list').addClass('active').each(function(i){
                        me.database.windowCheckedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type')});
                    });
                }else{
                    $('.j-share-window .j-one-block').attr('data-checked','yes').addClass('active').each(function(i){
                        me.database.windowCheckedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type')});
                    });
                }
            }else{
                if(me.viewType == 'list'){
                    $('.j-share-window .j-one-list').removeClass('active');
                }else{
                    $('.j-share-window .j-one-block').attr('data-checked','no').removeClass('active');
                }
            }
            me.onWindowSelectItemChange();
        }).on('click','.j-file-content input[type="checkbox"]',function(){
            var parent = $(this).parents('ul');
            var checked = this.checked;
            if(checked){
                parent.addClass('active');
                me.database.windowCheckedArr.push({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')});
            }else{
                parent.removeClass('active');
                me.database.windowCheckedArr.splice($.inArray({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')},database.windowCheckedArr),1);
            }
            me.onWindowSelectItemChange();
        }).on('click','.j-submit-btn>span',function(){
            if(me.database.windowCheckedArr.length == 0) return;
            me.database.shareFiles(function(){
                $('.j-share-window').hide();
                $('.j-nav-back').hide();
                me.database.windowResetMe();
                me.database.getDeptFiles(function(){
                    me.refreshFiles();
                });
            });
        }).on('click','.j-file-content .j-one-block',function(){
            var type = $(this).parents('ul').attr('data-type');
            var id = $(this).parents('ul').attr('data-id');
            var name = $(this).html();
            if(type == 'folder'){
                me.database.windowCurrentParent = {
                    id : id,
                    name : name
                };
                me.database.getMyFiles(function(){
                    me.changeWindowFileRoad('file');
                    me.refreshWindowFiles();
                });
            }else{//TODO : 打开文件

            }
        }).on('click','.j-file-content li.j-list-file-name>p',function(){
            var type = $(this).parents('ul').attr('data-type');
            var id = $(this).parents('ul').attr('data-id');
            var name = $(this).html();
            if(type == 'folder'){
                me.database.windowCurrentParent = {
                    id : id,
                    name : name
                };
                me.database.getMyFiles(function(){
                    me.changeWindowFileRoad('file');
                    me.refreshWindowFiles();
                });
            }else{//TODO : 打开文件

            }
        }).on('click','.j-path-roads span',function(){
            var thisSpan = this;
            me.database.windowCurrentParent = {
                id : $(this).attr('data-id'),
                name : $(this).html()
            };
            me.database.getMyFiles(function(){
                me.changeWindowFileRoad('top',thisSpan);
                me.refreshWindowFiles();
            });
        }).on('click','.j-return-prev',function(){
            $('.j-share-window .j-path-roads').find('span').last().click();
        });


        $('.j-message').on('click','.j-share-my',function(){
            $('.j-share-window').show();
            $('.j-nav-back').show();
            me.database.windowResetMe();
            me.database.getMyFiles(function(){
                me.refreshWindowFiles();
                me.changeWindowFileRoad('file');
            });
        }).on('click','.j-file-select-all input[type="checkbox"]',function(){
            var checked = this.checked;
            me.database.checkedArr = [];
            $('.j-message .j-file-content').find('input[type="checkbox"]').prop("checked",checked);
            if(checked){
                if(me.viewType == 'list'){
                    $('.j-message .j-one-list').addClass('active').each(function(i){
                        me.database.checkedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type')});
                    });
                }else{
                    $('.j-message .j-one-block').attr('data-checked','yes').addClass('active').each(function(i){
                        me.database.checkedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type')});
                    });
                }
            }else{
                if(me.viewType == 'list'){
                    $('.j-message .j-one-list').removeClass('active');
                }else{
                    $('.j-message .j-one-block').attr('data-checked','no').removeClass('active');
                }
            }
            me.onSelectItemChange();
        }).on('click','.j-file-content input[type="checkbox"]',function(){
            var parent = $(this).parents('ul');
            var checked = this.checked;
            if(checked){
                parent.addClass('active');
                me.database.checkedArr.push({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')});
            }else{
                parent.removeClass('active');
                me.database.checkedArr.splice($.inArray({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')},database.checkedArr),1);
            }
            me.onSelectItemChange();
        }).on('click','.j-file-content .j-one-block',function(){
            var type = $(this).parents('ul').attr('data-type');
            var id = $(this).parents('ul').attr('data-id');
            var name = $(this).html();
            if(type == 'folder'){
                me.database.currentParent = {
                    id : id,
                    name : name
                };
                me.database.getDeptFiles(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            }else{//TODO : 打开文件

            }
        }).on('click','.j-file-content li.j-list-file-name>p',function(){
            var type = $(this).parents('ul').attr('data-type');
            var id = $(this).parents('ul').attr('data-id');
            var name = $(this).html();
            if(type == 'folder'){
                me.database.currentParent = {
                    id : id,
                    name : name
                };
                me.database.getDeptFiles(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            }else{//TODO : 打开文件

            }
        }).on('click','.j-path-roads span',function(){
            var thisSpan = this;
            me.database.currentParent = {
                id : $(this).attr('data-id'),
                name : $(this).html()
            };
            me.database.getDeptFiles(function(){
                me.changeFileRoad('top',thisSpan);
                me.refreshFiles();
            });
        }).on('click','.j-return-prev',function(){
            $('.j-message .j-path-roads').find('span').last().click();
        });

        $('.j-dept-list').on('click','li',function(){
            $('.j-dept-list li.active').removeClass('active');
            $(this).addClass('active');
            me.database.currentDept = $(this).attr('data-id');
            me.database.currentParent = {
                id : "root",
                name : "全部文件"
            };
            me.database.getDeptFiles(function(){
                me.refreshFiles();
                me.changeFileRoad('file');
            });
        });

        $('.j-apps>li').eq(1).click(function(){
            window.location.href = (ports.file.domain == location.host ? ports.file.domain : '') + '/control/file';
        });

        $('.j-apps>li').eq(0).click(function(){
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        });

        $('.j-logout').click(function(){
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

        $('.j-logo').click(function(){
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        });

        $('.j-file-search input').on('input',function(){
            var val = $(this).val();
            if(val){
                me.database.searchedFiles = {
                    files : [],
                    folders : []
                };
                if(me.database.currentFiles.folders){
                    $(me.database.currentFiles.folders).each(function(i,folder){
                        if((folder.name).indexOf(val) > -1){
                            me.database.searchedFiles.folders.push(folder);
                        }
                    });
                }

                if(me.database.currentFiles.files){
                    $(me.database.currentFiles.files).each(function(i,file){
                        if((file.name).indexOf(val) > -1){
                            me.database.searchedFiles.files.push(file);
                        }
                    });
                }
                me.refreshFiles('search');
            }else{
                me.refreshFiles();
            }
        });

        $('.j-file-show-type').on('click',function(){
            if(me.viewType == 'list'){
                me.viewType = 'block';
                $(this).html('&#xe8ef');
                me.database.checkedArr = [];
                me.refreshFiles();
            }else{
                me.viewType = 'list';
                $(this).html('&#xe228');
                me.database.checkedArr = [];
                me.refreshFiles();
            }
        });
    },
    onSelectItemChange : function(){
        var me = this;

        if(me.database.checkedArr.length == ($('.j-message .j-one-list').length + $('.j-message .j-one-block').length)){
            $('.j-message .j-file-select-all input[type="checkbox"]').prop("checked",true);
        }else{
            $('.j-message .j-file-select-all input[type="checkbox"]').prop("checked",false);
        }
        if(me.database.checkedArr.length > 0){
            $('.j-message .j-btn-group').show();
            if(me.database.checkedArr.length > 1){
                $('.j-message .j-top-rename').hide();
                $('.j-message .j-top-download').hide();
            }else{
                $('.j-message .j-top-rename').show();
                $('.j-message .j-top-download').show();
            }
        }else{
            $('.j-btn-group').hide();
        }
    },
    //window选中的文件发生变化时执行
    onWindowSelectItemChange : function(){
        var me = this;
        var haveFolder = false;
        if(me.database.windowCheckedArr.length == ($('.j-share-window .j-one-list').length + $('.j-share-window .j-one-block').length)){
            $('.j-share-window .j-file-select-all input[type="checkbox"]').prop("checked",true);
        }else{
            $('.j-share-window .j-file-select-all input[type="checkbox"]').prop("checked",false);
        }
        if(me.database.windowCheckedArr.length == 0){
            $('.j-submit-btn>span').css({'cursor':'not-allowed'});
        }else{
            $('.j-submit-btn>span').css({'cursor':'pointer'});
        }
    },
    changeFileRoad : function(type,currentEle){
        var me = this;
        if(me.database.currentParent.id == 'root'){
            $('.j-message .j-return-prev').hide();
            $('.j-message .j-path-roads').empty().append('<p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
        }else{
            if(type == 'top'){
                $('.j-file-content .j-return-prev').show();
                $(currentEle).nextAll().remove();
                $(currentEle).replaceWith('<p data-id="'+$(currentEle).attr('data-id')+'">'+$(currentEle).html()+'</p>');
            }else{
                $('.j-message .j-return-prev').show();
                var lastP = $('.j-message .j-path-roads').find('p');
                lastP.replaceWith('<span data-id="'+lastP.attr('data-id')+'">'+lastP.html()+'</span>');
                $('.j-message .j-path-roads').append('<i class="j-icon">&#xe315</i><p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
            }
        }
        if(me.viewType == 'list'){
            $('.j-message .j-title-file-name>p').html('文件名');
            $('.j-message .j-title-file-size').show();
            $('.j-message .j-title-file-date').show();
        }else{
            $('.j-message .j-title-file-name>p').html('全选');
            $('.j-message .j-title-file-size').hide();
            $('.j-message .j-title-file-date').hide();
        }
    },
    changeWindowFileRoad : function(type,currentEle){
        var me = this;
        if(me.database.windowCurrentParent.id == 'root'){
            $('.j-share-window .j-return-prev').hide();
            $('.j-share-window .j-path-roads').empty().append('<p data-id="'+me.database.windowCurrentParent.id+'">'+me.database.windowCurrentParent.name+'</p>');
        }else{
            if(type == 'top'){
                $('.j-share-window .j-return-prev').show();
                $(currentEle).nextAll().remove();
                $(currentEle).replaceWith('<p data-id="'+$(currentEle).attr('data-id')+'">'+$(currentEle).html()+'</p>');
            }else{
                $('.j-share-window .j-return-prev').show();
                var lastP = $('.j-share-window .j-path-roads').find('p');
                lastP.replaceWith('<span data-id="'+lastP.attr('data-id')+'">'+lastP.html()+'</span>');
                $('.j-share-window .j-path-roads').append('<i class="j-icon">&#xe315</i><p data-id="'+me.database.windowCurrentParent.id+'">'+me.database.windowCurrentParent.name+'</p>');
            }
        }
        if(me.viewType == 'list'){
            $('.j-share-window .j-title-file-name>p').html('文件名');
            $('.j-share-window .j-title-file-size').show();
            $('.j-share-window .j-title-file-date').show();
        }else{
            $('.j-share-window .j-title-file-name>p').html('全选');
            $('.j-share-window .j-title-file-size').hide();
            $('.j-share-window .j-title-file-date').hide();
        }
    },
    //刷新文件列表
    refreshWindowFiles : function(){
        var me = this;
        var changeSize = function(size){
            if(size >= 1024*1024){
                return (size/(1024*1024)).toFixed(0) + 'MB';
            }else if(1024 <= size && size < 1024*1024){
                return (size/(1024)).toFixed(0) + 'KB';
            }else{
                return size + 'B';
            }
        };
        $('.j-share-window .j-file-select-all input[type="checkbox"]').prop('checked',false);
        var index = 0,content = $('.j-share-window .j-file-content');
        content.empty();
        if(this.viewType == 'list'){
            $('.j-share-window .j-file-show-type').html('&#xe228');
            if(me.database.windowCurrentFiles.folders && me.database.windowCurrentFiles.folders.length){
                $(me.database.windowCurrentFiles.folders).each(function(i,folder){
                    content.append(
                        '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.windowCurrentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
                        '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                        '<li class="j-list-file-size"><p>-</p></li>'+
                        '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                        '</ul>');
                    index ++ ;
                });
            }
            if(me.database.windowCurrentFiles.files && me.database.windowCurrentFiles.files.length){
                $(me.database.windowCurrentFiles.files).each(function(i,file){
                    content.append(
                        '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.windowCurrentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
                        '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                        '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                        '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                        '</ul>');
                    index ++ ;
                });
            }
        }else{
            $('.j-share-window .j-file-show-type').html('&#xe8ef');
            if(me.database.windowCurrentFiles.folders && me.database.windowCurrentFiles.folders.length){
                $(me.database.windowCurrentFiles.folders).each(function(i,folder){
                    content.append(
                        '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.windowCurrentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
                        '<span class="j-icon">&#xe876</span>'+
                        '<img src="/img/file/block-folder.png"/>'+
                        '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                        '</div>');
                    index ++ ;
                });
            }
            if(me.database.windowCurrentFiles.files && me.windowCatabase.windowCurrentFiles.files.length){
                $(me.database.windowCurrentFiles.files).each(function(i,file){
                    content.append(
                        '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.windowCurrentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
                        '<span class="j-icon">&#xe876</span>'+
                        '<img src="/img/file/block-doc.png"/>'+
                        '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                        '</div>');
                    index ++ ;
                });
            }
        }
        $('.j-share-window .j-totle-number').empty().append('已全部加载，共'+index+'个');
        me.onWindowSelectItemChange();
    },
    //刷新文件列表
    refreshFiles : function(type){
        var me = this;
        var changeSize = function(size){
            if(size >= 1024*1024){
                return (size/(1024*1024)).toFixed(0) + 'MB';
            }else if(1024 <= size && size < 1024*1024){
                return (size/(1024)).toFixed(0) + 'KB';
            }else{
                return size + 'B';
            }
        };
        $('.j-file-select-all input[type="checkbox"]').prop('checked',false);
        var index = 0,content = $('.j-file-content');
        content.empty();
        if(this.viewType == 'list'){
            if(type == 'search'){
                $('.j-file-show-type').html('&#xe228');
                if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                    $(me.database.searchedFiles.folders).each(function(i,folder){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.searchedFiles.files && me.database.searchedFiles.files.length){
                    $(me.database.searchedFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
            }else if(type == 'order'){
                $('.j-file-show-type').html('&#xe228');
                if(me.database.orderedFiles.folders && me.database.orderedFiles.folders.length){
                    $(me.database.orderedFiles.folders).each(function(i,folder){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.orderedFiles.files && me.database.orderedFiles.files.length){
                    $(me.database.orderedFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
            }else{
                $('.j-file-show-type').html('&#xe228');
                if(type == 'search'){
                    if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                        $(me.database.searchedFiles.folders).each(function(i,folder){
                            content.append(
                                    '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
                                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                    '<li class="j-list-file-size"><p>-</p></li>'+
                                    '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                    '</ul>');
                            index ++ ;
                        });
                    }
                    if(me.database.searchedFiles.files && me.database.searchedFiles.files.length){
                        $(me.database.searchedFiles.files).each(function(i,file){
                            content.append(
                                    '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                    '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                    '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                    '</ul>');
                            index ++ ;
                        });
                    }
                }else if(type == 'order'){
                    if(me.database.orderedFiles.folders && me.database.orderedFiles.folders.length){
                        $(me.database.orderedFiles.folders).each(function(i,folder){
                            content.append(
                                    '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
                                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                    '<li class="j-list-file-size"><p>-</p></li>'+
                                    '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                    '</ul>');
                            index ++ ;
                        });
                    }
                    if(me.database.orderedFiles.files && me.database.orderedFiles.files.length){
                        $(me.database.orderedFiles.files).each(function(i,file){
                            content.append(
                                    '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                    '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                    '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                    '</ul>');
                            index ++ ;
                        });
                    }
                }else{
                    if(me.database.currentFiles.folders && me.database.currentFiles.folders.length){
                        $(me.database.currentFiles.folders).each(function(i,folder){
                            content.append(
                                    '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
                                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                    '<li class="j-list-file-size"><p>-</p></li>'+
                                    '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                                    '</ul>');
                            index ++ ;
                        });
                    }
                    if(me.database.currentFiles.files && me.database.currentFiles.files.length){
                        $(me.database.currentFiles.files).each(function(i,file){
                            content.append(
                                    '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                    '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                    '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                    '</ul>');
                            index ++ ;
                        });
                    }
                }
            }
        }else{
            $('.j-file-show-type').html('&#xe8ef');
            if(type == 'search'){
                if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                    $(me.database.searchedFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-folder.png"/>'+
                                '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
                if(me.database.searchedFiles.files && me.database.searchedFiles.files.length){
                    $(me.database.searchedFiles.files).each(function(i,file){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-doc.png"/>'+
                                '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
            }else if(type == 'order'){
                if(me.database.orderedFiles.folders && me.database.orderedFiles.folders.length){
                    $(me.database.orderedFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-folder.png"/>'+
                                '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
                if(me.database.orderedFiles.files && me.database.orderedFiles.files.length){
                    $(me.database.orderedFiles.files).each(function(i,file){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-doc.png"/>'+
                                '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
            }else{
                if(me.database.currentFiles.folders && me.database.currentFiles.folders.length){
                    $(me.database.currentFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-folder.png"/>'+
                                '<p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
                if(me.database.currentFiles.files && me.database.currentFiles.files.length){
                    $(me.database.currentFiles.files).each(function(i,file){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<span class="j-icon">&#xe876</span>'+
                                '<img src="/img/file/block-doc.png"/>'+
                                '<p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-block-save">&#xe5ca</i><i class="j-icon j-block-cancel">&#xe5cd</i>'+
                                '</div>');
                        index ++ ;
                    });
                }
            }

        }
        $('.j-totle-number').empty().append('已全部加载，共'+index+'个');
        me.onSelectItemChange();
    },
    resizeWindow : function(){
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;

        if(windowHeight<580){
            $('.j-main').css({'height':500});
            $('.j-message .j-file-content').css({'height':500 - 102});
        }else{
            $('.j-main').css({'height':windowHeight - 101});
            $('.j-message .j-file-content').css({'height':windowHeight - 203});
        }
    }
};

database = new Database(function(database){
    view = new View(database);
});
