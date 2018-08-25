var view,
    database,
    windowHeight,
    windowWidth,
    mainDiv = $('.j-main');

var Database = function(callback){
    var me = this;
    me.fileMap = {};
    me.currentParent = {
        id : 'root',
        name : '全部文件'
    };
    me.resetMe();

    me.getAllFile(function(){
        callback(me);
    });

};
Database.prototype = {
    //取消共享
    cancelShare : function(callback){
        var me = this;
        var files = [],folders = [];
        $(me.checkedArr).each(function(i,one){
            if(one.type == 'folder'){
                folders.push(one.id);
            }else{
                files.push(one.id);
            }
        });
        if(folders.length && files.length){
            sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/delmyshares',{files:JSON.stringify(files),folders:JSON.stringify(folders)},function(data){
                if(data && data.code == 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(folders.length){
            sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/delmyshares',{folders:JSON.stringify(folders)},function(data){
                if(data && data.code == 201){
                    callback();
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else if(files.length){
            sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/delmyshares',{files:JSON.stringify(files)},function(data){
                if(data && data.code == 201){
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
//获取目录下的文件pathId为文件夹id
    getAllFile : function(callback){
        var me = this;
        me.resetMe();
        /*if(me.fileMap[me.currentParent.id]){
         me.currentFiles = me.fileMap[me.currentParent.id];
         if(!me.userfolderId) me.userfolderId = me.currentFiles.user_folder_id;
         return callback();
         }*/
        if(me.currentParent.id == 'root'){
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/myshares',{},function(data){
                if(data && data.code == 201){
                    me.currentFiles = me.fileMap[me.currentParent.id] = data.datas;
                    me.userfolderId = me.currentFiles.user_folder_id;
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
                    me.currentFiles = me.fileMap[me.currentParent.id] = data.datas;
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
    resetMe : function(){
        var me = this;
        me.currentFiles = {};
        me.currentParentId = '';
        me.checkedArr = [];
    }
};


var View = function(database){
    this.database = database;
    this.setMainSize();
    window.onresize = this.setMainSize;
    this.viewType = 'list';
    this.changeFileRoad();
    this.refreshFiles();
    this.bindFuns();
};
View.prototype = {
    bindFuns : function(){
        var me = this;
        $('.j-file-select-all').on('click','input[type="checkbox"]',function(){
            var checked = this.checked;
            me.database.checkedArr = [];
            $('.j-file-content').find('input[type="checkbox"]').prop("checked",checked);
            if(checked){
                if(me.viewType == 'list'){
                    $('.j-one-list').addClass('active').each(function(i){
                        me.database.checkedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type')});
                    });
                }else{
                    $('.j-one-block').attr('data-checked','yes').addClass('active').each(function(i){
                        me.database.checkedArr.push({index:i,id:$(this).attr('data-id'),type:$(this).attr('data-type')});
                    });
                }
            }else{
                if(me.viewType == 'list'){
                    $('.j-one-list').removeClass('active');
                }else{
                    $('.j-one-block').attr('data-checked','no').removeClass('active');
                }
            }
            me.onSelectItemChange();
        });

        $('.j-file-content').on('click','input[type="checkbox"]',function(){
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
        }).on('click','.j-one-block>span',function(){
            $('.j-right-click').hide();
            var parent = $(this).parent('.j-one-block');
            var checked = parent.attr('data-checked');
            if(checked == 'no'){
                $(this).parent('.j-one-block').attr('data-checked','yes').addClass('active');
                me.database.checkedArr.push({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')});
            }else{
                $(this).parent('.j-one-block').attr('data-checked','no').removeClass('active');
                me.database.checkedArr.splice($.inArray({index:parent.attr('data-index'),id:parent.attr('data-id'),type:parent.attr('data-type')},database.checkedArr),1);
            }
            me.onSelectItemChange();
            return false;
        }).on('click','li.j-list-file-name>p',function(){
            var type = $(this).parents('ul').attr('data-type');
            var id = $(this).parents('ul').attr('data-id');
            var name = $(this).html();
            if(type == 'folder'){
                me.database.currentParent = {
                    id : id,
                    name : name
                };
                me.database.getAllFile(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            }else{//TODO : 打开文件

            }
        }).on('click','.j-one-block',function(){
            var type = $(this).attr('data-type');
            var id = $(this).attr('data-id');
            var name = $(this).find('p').html();
            if(type == 'folder'){
                me.database.currentParent = {
                    id : id,
                    name : name
                };
                me.database.getAllFile(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            }else{//TODO : 打开文件

            }
        });

        $('.j-path-roads').on('click','span',function(){
            var thisSpan = this;
            me.database.currentParent = {
                id : $(this).attr('data-id'),
                name : $(this).html()
            };
            me.database.getAllFile(function(){
                me.changeFileRoad('top',thisSpan);
                me.refreshFiles();
            });
        });

        $('.j-return-prev').on('click',function(){
            $('.j-path-roads').find('span').last().click();
        });

        $('.j-cancel-share').click(function(){
            me.database.cancelShare(function(){
                me.database.getAllFile(function(){
                    me.changeFileRoad('file');
                    me.refreshFiles();
                });
            });
        });

        $('.j-list li').click(function(){
            window.location.href = $(this).attr('data-href');
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

        //文件搜索
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

        $('.j-apps li').eq(2).click(function(){
            window.location.href = '/control/file/share';
        });

        $('.j-apps li').eq(0).click(function(){
            window.location.href = '/control';
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
    },
//选中的文件发生变化时执行
    onSelectItemChange : function(){
        var me = this;
        var haveFolder = false;
        if(me.database.checkedArr.length == ($('.j-one-list').length + $('.j-one-block').length)){
            $('.j-file-select-all input[type="checkbox"]').prop("checked",true);
        }else{
            $('.j-file-select-all input[type="checkbox"]').prop("checked",false);
        }
        if(me.database.checkedArr.length > 0){
            $('.j-btn-group').show();
            if(me.database.checkedArr.length > 1){
                $('.j-top-rename').hide();
                $('.j-top-download').hide();
            }else{
                $('.j-top-rename').show();
                $('.j-top-download').show();
            }
        }else{
            $('.j-btn-group').hide();
        }
    },
    changeFileRoad : function(type,currentEle){
        var me = this;
        $('.j-file-search input').val('');
        if(type == 'reset'){
            me.database.currentParent = {
                id : 'root',
                name : '全部文件'
            };
            $('.j-return-prev').hide();
            $('.j-path-roads').empty().append('<p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
            return;
        }
        if(me.database.currentParent.id == 'root'){
            $('.j-return-prev').hide();
            $('.j-path-roads').empty().append('<p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
        }else{
            if(type == 'top'){
                $('.j-return-prev').show();
                $(currentEle).nextAll().remove();
                $(currentEle).replaceWith('<p data-id="'+$(currentEle).attr('data-id')+'">'+$(currentEle).html()+'</p>');
            }else{
                $('.j-return-prev').show();
                var lastP = $('.j-path-roads').find('p');
                lastP.replaceWith('<span data-id="'+lastP.attr('data-id')+'">'+lastP.html()+'</span>');
                $('.j-path-roads').append('<i class="j-icon">&#xe315</i><p data-id="'+me.database.currentParent.id+'">'+me.database.currentParent.name+'</p>');
            }
        }
        if(me.viewType == 'list'){
            $('.j-title-file-name>p').html('文件名');
            $('.j-title-file-size').show();
            $('.j-title-file-date').show();
        }else{
            $('.j-title-file-name>p').html('全选');
            $('.j-title-file-size').hide();
            $('.j-title-file-date').hide();
        }
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
            $('.j-file-show-type').html('&#xe228');
            if(type == 'search'){
                if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                    $(me.database.searchedFiles.folders).each(function(i,folder){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name="'+folder.name+'">'+folder.name+'</p><input type="text" value="'+folder.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-dept"><p>'+folder.dept_name+'</p></li>'+
                                '<li class="j-list-file-time"><p>2017-4-19 14:37:15</p></li>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.searchedFiles.files && me.database.searchedFiles.files.length){
                    $(me.database.searchedFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-dept"><p>'+file.dept_name+'</p></li>'+
                                '<li class="j-list-file-time"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
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
                                '<li class="j-list-file-dept"><p>'+folder.dept_name+'</p></li>'+
                                '<li class="j-list-file-time"><p>2017-4-19 14:37:15</p></li>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.orderedFiles.files && me.database.orderedFiles.files.length){
                    $(me.database.orderedFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-dept"><p>'+file.dept_name+'</p></li>'+
                                '<li class="j-list-file-time"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
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
                                '<li class="j-list-file-dept"><p>'+folder.dept_name+'</p></li>'+
                                '<li class="j-list-file-time"><p>2017-4-19 14:37:15</p></li>'+
                                '<li class="j-list-file-size"><p>-</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
                if(me.database.currentFiles.files && me.database.currentFiles.files.length){
                    $(me.database.currentFiles.files).each(function(i,file){
                        content.append(
                                '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.shore_file_id+'">'+
                                '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                                '<li class="j-list-file-dept"><p>'+file.dept_name+'</p></li>'+
                                '<li class="j-list-file-time"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
                                '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                                '</ul>');
                        index ++ ;
                    });
                }
            }
        }else{
            $('.j-file-show-type').html('&#xe8ef');
            if(type == 'search'){
                if(me.database.searchedFiles.folders && me.database.searchedFiles.folders.length){
                    $(me.database.searchedFiles.folders).each(function(i,folder){
                        content.append(
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
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
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
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
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="folder" data-id="'+folder.shore_folder_id+'">'+
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
    setMainSize : function(){
        windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;
        if(window.innerWidth < 1080){
            if(windowHeight<560){
                mainDiv.css({'width':900,'height':500,'marginRight':0,'borderTopRightRadius':'0','borderRight':'0'});
                $('.j-file-content').css({'height':500 - 107});
            }else{
                mainDiv.css({'width':900,'height':windowHeight - 78,'marginRight':0,'borderTopRightRadius':'0','borderRight':'0'});
                $('.j-file-content').css({'height':windowHeight - 185});
            }
        }else{
            if(windowHeight<560){
                mainDiv.css({'width':windowWidth - 218,'height':500,'marginRight':0,'borderTopRightRadius':'5px','borderRight':'1px solid #dfdfdf'});
                $('.j-file-content').css({'height':500 - 107});
            }else{
                mainDiv.css({'width':windowWidth - 200,'height':windowHeight - 60,'marginRight':20,'borderTopRightRadius':'5px','borderRight':'1px solid #dfdfdf'});
                $('.j-file-content').css({'height':windowHeight - 170});

            }   }
        }
};

database = new Database(function(database){
    view = new View(database);
});
