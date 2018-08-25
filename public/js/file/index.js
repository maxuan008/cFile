var view,
    database,
    windowHeight,
    windowWidth,
    mainDiv = $('.j-main');

$(function(){
    sendMessage('get',(ports.net.domain == location.host ? ports.net.domain : ''),'/net/initializeinfo','',function(data){
        if(data.code == 201){
            userinfo = data.datas.userinfo;

        }else if(data.code === 204){
            $.InfoBox('alert','error','错误',data.err.toString());
        }else{
            $.InfoBox('alert','error','用户信息错误','请重新登录！');
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
        }
    });
});

var Database = function(callback){
    var me = this;
    me.fileType = window.location.hash.split('#')[1];
    me.fileMap = {
        /*root : {
            user_folder_id:'fff',
            folders:[
                {child_folder_id:'1' ,name:"aa",parent_id:'fff'},
                {child_folder_id:'2' ,name:"bb",parent_id:'fff'}
            ],
            files:[
                {file_id:'aaa' ,  name:'11', type:'doc'},
                {file_id:'bbb' ,  name:'22', type:'pdf'}
            ]
        },
        1 : {
            folders:[
                {child_folder_id:'3' ,name:"333",parent_id:'1'}
            ],
            files:[
                {file_id:'aaa1' ,  name:'111', type:'doc'},
                {file_id:'bbb1' ,  name:'221', type:'pdf'}
            ]
        },
        2 : {
            files:[
                {file_id:'aaa2' ,  name:'112', type:'doc'},
                {file_id:'bbb2' ,  name:'222', type:'pdf'}
            ]
        },
        3 : {
            files:[
                {file_id:'aaa3' ,  name:'113', type:'doc'},
                {file_id:'bbb3' ,  name:'223', type:'pdf'}
            ]
        }*/
    };
    me.currentParent = {
        id : 'root',
        name : '全部文件'
    };
    me.resetMe();

    if(me.fileType){
        me.getFileByType(me.fileType,function(){
            callback(me);
        });
    }else{
        me.getAllFile(function(){
            callback(me);
        });
    }
};
Database.prototype = {
    orderFile : function(){

    },
    getFileByType : function(type,callback){
        var me = this;
        sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/findtype',{filetype:type},function(data){
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
    },
    //删除文件或文件夹
    removeFile : function (file,callback) {
        if(file.type == 'folder'){
            sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/delfolder',{child_folder_id:file.id},function(data){
                if(data && data.code == 201){
                    callback(true);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                    callback(false);
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }else{
            sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/delfile',{file_id:file.id},function(data){
                if(data && data.code == 201){
                    callback(true);
                }else if(data.code === 204){
                    $.InfoBox('alert','error','错误',data.err.toString());
                    callback(false);
                }else{
                    $.InfoBox('alert','error','用户信息错误','请重新登录！');
                    window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
                }
            });
        }
    },
    //上传文件
    uploadFile : function(callback){
        var me = this;

        var progressHandler = function(e){
            console.log(e);
        };

        var beforeSendHandler = function(){
        };

        var completeHandler = function(){
            callback(true);
        };

        var errorHandler = function(){
            callback(false);
        };

        var formData = new FormData($('form')[0]);
        $.ajax({
            url: (ports.file.domain == location.host ? ports.file.domain : '')+'/file/disk/uploadfile?id='+(me.currentParent.id == 'root'?me.userfolderId:me.currentParent.id),  //server script to process data
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
    },
    //创建文件夹
    addfolder : function(sendData,callback){
        sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/addfolder',sendData,function(data){
            if(data && data.code == 201){
                callback(true);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
                callback(false);
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    },
    //文件重命名
    updatefile : function(sendData,callback){
        sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/updatefile',sendData,function(data){
            if(data && data.code == 201){
                callback(true);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
                callback(false);
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
    },
    //文件夹重命名
    updatefolder : function(sendData,callback){
        sendMessage('post',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/updatefolder',sendData,function(data){
            if(data && data.code == 201){
                callback(true);
            }else if(data.code === 204){
                $.InfoBox('alert','error','错误',data.err.toString());
                callback(false);
            }else{
                $.InfoBox('alert','error','用户信息错误','请重新登录！');
                window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/';
            }
        });
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
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/rootlist',{},function(data){
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
            sendMessage('get',(ports.file.domain == location.host ? ports.file.domain : ''),'/file/disk/childfolderlist',{child_folder_id : me.currentParent.id},function(data){
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
    this.viewType = 'list';
    window.onresize = this.setMainSize;

    if(this.database.fileType){
        $('.j-'+this.database.fileType+'-file').addClass('active');
    }else{
        $('.j-base-file').addClass('active');
    }

    this.changeFileRoad('file');
    this.refreshFiles();
    this.bindFuns();
};
View.prototype = {
    //绑定事件
    bindFuns : function(){
        var me = this;

        var removeFile = function(){
            var index = 0,success = 0,fail = 0;
            $(me.database.checkedArr).each(function(i,one){
                me.database.removeFile(one,function(data){
                    index++;
                    if(data){
                        success ++ ;
                    }else{
                        fail ++ ;
                    }
                    if(index == me.database.checkedArr.length){
                        console.log('共删除'+index+'个项目，其中'+success+'个成功、'+fail+'个失败！');
                        if(me.database.fileType){
                            me.database.getFileByType(me.database.fileType,function(){
                                me.refreshFiles();
                            });
                        }else{
                            me.database.getAllFile(function(){
                                me.refreshFiles();
                            });
                        }
                    }
                });
            });
        };

        var renameFile = function(){
            var thisList;
            if(me.viewType == 'list'){
                $(me.database.checkedArr).each(function(i,one){
                    thisList = $('.j-one-list').eq(one.index);
                    thisList.find('p').css({'color':'#333'}).hide();
                    thisList.find('input[type="text"]').show().focus().val(thisList.find('p').attr('data-name'));
                    thisList.find('i').show();
                });
            }else{
                $(me.database.checkedArr).each(function(i,one){
                    thisList = $('.j-one-block').eq(one.index);
                    thisList.find('p').css({'color':'#333'}).hide();
                    thisList.find('input[type="text"]').show().focus().val(thisList.find('p').attr('data-name'));
                    thisList.find('i').show();
                });
            }
        };

        var downloadFile = function(){
            $(me.database.checkedArr).each(function(i,one){
                $.download((ports.file.domain == location.host ? ports.file.domain : '')+'/file/disk/downloadfile','file_id='+one.id,'post');
            });
        };

        //checkBox 事件绑定
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
        //选择文件、文件夹
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
        }).on('click','.j-list-save',function(){//保存修改的文件、文件夹名字
            $('.j-right-click').hide();
            var _this = this;
            var newname = $(_this).parents('li').find('input[type="text"]').val();
            var oldname = $(_this).parents('li').find('p').attr('data-name');
            if(!newname){
                $.InfoBox('alert','error','填写有误','名字不能为空！');
                return false;
            }
            if(newname == oldname){
                $(_this).parents('li').find('input[type="text"]').hide();
                $(_this).parents('li').find('i').hide();
                $(_this).parents('li').find('p').show();
                return false;
            }
            var parent_id = (me.database.currentParent.id == 'root'?me.database.userfolderId:me.database.currentParent.id);
            var id = $(_this).parents('ul').attr('data-id');
            var type = $(_this).parents('ul').attr('data-type');
            var sendData;
            if(type == 'folder'){
                sendData = {
                    newname : newname,
                    parent_id : parent_id,
                    child_folder_id : id
                };
                me.database.updatefolder(sendData,function(data){
                    $(_this).parents('li').find('input[type="text"]').hide();
                    $(_this).parents('li').find('i').hide();
                    if(data){
                        $(_this).parents('li').find('p').html(newname).attr('data-name',newname).css({'color':'#00CC66'}).show();
                    }else{
                        $(_this).parents('li').find('p').show();
                    }
                });
            }else{
                sendData = {
                    newname : newname,
                    folder_id : parent_id,
                    file_id : id
                };
                me.database.updatefile(sendData,function(data){
                    $(_this).parents('li').find('input[type="text"]').hide();
                    $(_this).parents('li').find('i').hide();
                    if(data){
                        $(_this).parents('li').find('p').html(newname+'.'+type).attr('data-name',newname).css({'color':'#00CC66'}).show();
                    }else{
                        $(_this).parents('li').find('p').show();
                    }
                });
            }
            return false;
        }).on('click','.j-block-save',function(){//保存修改的文件、文件夹名字
            $('.j-right-click').hide();
            var _this = this;
            var newname = $(_this).parent('div').find('input[type="text"]').val();
            var oldname = $(_this).parent('div').find('p').attr('data-name');
            if(!newname){
                $.InfoBox('alert','error','填写有误','名字不能为空！');
                return false;
            }
            if(newname == oldname){
                $(_this).parent('div').find('input[type="text"]').hide();
                $(_this).parent('div').find('i').hide();
                $(_this).parent('div').find('p').show();
                return false;
            }
            var parent_id = (me.database.currentParent.id == 'root'?me.database.userfolderId:me.database.currentParent.id);
            var id = $(_this).parent('div').attr('data-id');
            var type = $(_this).parent('div').attr('data-type');
            var sendData;
            if(type == 'folder'){
                sendData = {
                    newname : newname,
                    parent_id : parent_id,
                    child_folder_id : id
                };
                me.database.updatefolder(sendData,function(data){
                    $(_this).parent('div').find('input[type="text"]').hide();
                    $(_this).parent('div').find('i').hide();
                    if(data){
                        $(_this).parent('div').find('p').html(newname).attr('data-name',newname).css({'color':'#00CC66'}).show();
                    }else{
                        $(_this).parent('div').find('p').show();
                    }
                });
            }else{
                sendData = {
                    newname : newname,
                    folder_id : parent_id,
                    file_id : id
                };
                me.database.updatefile(sendData,function(data){
                    $(_this).parent('div').find('input[type="text"]').hide();
                    $(_this).parent('div').find('i').hide();
                    if(data){
                        $(_this).parent('div').find('p').html(newname+'.'+type).attr('data-name',newname).css({'color':'#00CC66'}).show();
                    }else{
                        $(_this).parent('div').find('p').show();
                    }
                });
            }
            return false;
        }).on('click','.j-block-cancel',function(){
            $('.j-right-click').hide();
            var _this = this;
            $(_this).parent('div').find('input[type="text"]').hide();
            $(_this).parent('div').find('i').hide();
            $(_this).parent('div').find('p').show();
            return false;
        }).on('click','.j-list-cancel',function(){
            $('.j-right-click').hide();
            var _this = this;
            $(_this).parents('li').find('input[type="text"]').hide();
            $(_this).parents('li').find('i').hide();
            $(_this).parents('li').find('p').show();
            return false;
        }).on('click','.j-block-cancel-create',function(){
            var _this = this;
            $(_this).parent('div').remove();
            return false;
        }).on('click','.j-list-cancel-create',function(){
            $('.j-right-click').hide();
            var _this = this;
            $(_this).parents('ul').remove();
            return false;
        }).on('click','.j-block-save-create',function(){//保存创建的文件夹名字
            $('.j-right-click').hide();
            var _this = this;
            var newname = $(_this).parent('div').find('input[type="text"]').val();
            if(!newname){
                $.InfoBox('alert','error','填写有误','名字不能为空！');
                return false;
            }
            var parent_id = (me.database.currentParent.id == 'root'?me.database.userfolderId:me.database.currentParent.id);
            var sendData = {
                newname : newname,
                parent_id : parent_id
            };
            me.database.addfolder(sendData,function(data){
                if(data){
                    me.database.getAllFile(function(){
                        me.refreshFiles();
                    });
                }else{
                    $.InfoBox('alert','error','创建失败','创建失败！');
                }
            });
            return false;
        }).on('click','.j-list-save-create',function(){//保存创建的文件夹名字
            var _this = this;
            var newname = $(_this).parents('ul').find('input[type="text"]').val();
            if(!newname){
                $.InfoBox('alert','error','填写有误','名字不能为空！');
                return false;
            }
            var parent_id = (me.database.currentParent.id == 'root'?me.database.userfolderId:me.database.currentParent.id);
            var sendData = {
                newname : newname,
                parent_id : parent_id
            };
            me.database.addfolder(sendData,function(data){
                if(data){
                    me.database.getAllFile(function(){
                        me.refreshFiles();
                    });
                }else{
                    $.InfoBox('alert','error','创建失败','创建失败！');
                }
            });
            return false;
        }).on('click','input[type="text"]',function(){
            $('.j-right-click').hide();
            return false;
        }).on('contextmenu','.j-one-block',function(){
            me.activeFileEle = $(this);
            if($(this).attr('data-type') == 'folder'){
                $('.j-right-download').hide();
            }else{
                $('.j-right-download').show();
            }
            if(!$('.j-title-file-name').find('input[type="checkbox"]')[0].checked){
                $('.j-title-file-name').find('input[type="checkbox"]').click();
            }
            $('.j-title-file-name').find('input[type="checkbox"]').click();
            $(this).find('span').click();
            var e = event || window.event;
            $('.j-right-click').show().css({'left':e.clientX,'top': e.clientY});
            return false;
        }).on('contextmenu','.j-one-list',function(){
            me.activeFileEle = $(this);
            if($(this).attr('data-type') == 'folder'){
                $('.j-right-download').hide();
            }else{
                $('.j-right-download').show();
            }
            if(!$('.j-title-file-name').find('input[type="checkbox"]')[0].checked){
                $('.j-title-file-name').find('input[type="checkbox"]').click();
            }
            $('.j-title-file-name').find('input[type="checkbox"]').click();
            $(this).find('input[type="checkbox"]').click();
            var e = event || window.event;
            $('.j-right-click').show().css({'left':e.clientX,'top': e.clientY});
            return false;
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

        $('#j-file-upload').on('change',function(){
            var _this = this;
            /*var formData = new FormData($('form')[0]);
            var id = (me.database.currentParent.id == 'root'?me.database.userfolderId:me.database.currentParent.id);
            formData.append('id',id);*/

            me.database.uploadFile(function(){
                $(_this).val('');
                me.database.getAllFile(function(){
                    me.refreshFiles();
                });
            });

            //$(this).parent('form').prop('action','/file/disk/uploadfile?id='+(me.database.currentParent.id == 'root'?me.database.userfolderId:me.database.currentParent.id)).submit();
            /*$.ajax({
                url : '/file/disk/uploadfile',
                type : 'post',
                xhr : function(){
                    var xhr = $.ajaxSettings.xhr();
                    if(xhr.upload){
                        xhr.upload.addEventListener('progress',progressHandler,false);
                    }
                },
                beforeSend : beforeSendHandler,
                success : completeHandler,
                error : errorHandler,
                data : formData,
                cache : false,
                contentType : false,
                processData : false
            });*/

        });

        //tool-bar
        $('.j-create-folder').on('click',function(){
            var content = $('.j-file-content');
            if(me.viewType == 'list'){
                content.prepend(
                    '<ul class="j-one-list" data-index="0" data-parentId="'+me.database.currentParent.id+'" data-type="folder">'+
                    '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-folder.png"/><p data-name=""></p><input type="text"/><i class="j-icon j-list-save-create">&#xe5ca</i><i class="j-icon j-list-cancel-create">&#xe5cd</i></li>'+
                    '<li class="j-list-file-size"><p>-</p></li>'+
                    '<li class="j-list-file-date"><p>2017-4-19 14:37:15</p></li>'+
                    '</ul>');
                content.find('ul').eq(0).find('.j-list-file-name>p').hide();
                content.find('ul').eq(0).find('.j-list-file-name>input[type="text"]').show().focus();
                content.find('ul').eq(0).find('.j-list-file-name>i').show();
            }else{
                content.prepend(
                    '<div data-checked="no" class="j-one-block" data-index="0" data-parentId="'+me.database.currentParent.id+'" data-type="folder">'+
                    '<span class="j-icon">&#xe876</span>'+
                    '<img src="/img/file/block-folder.png"/>'+
                    '<p data-name=""></p><input type="text"/><i class="j-icon j-block-save-create">&#xe5ca</i><i class="j-icon j-block-cancel-create">&#xe5cd</i>'+
                    '</div>');
                content.find('div').eq(0).find('p').hide();
                content.find('div').eq(0).find('input[type="text"]').show().focus();
                content.find('div').eq(0).find('i').show();
            }
        });

        $('.j-top-remove').click(function(){
            removeFile();
        });

        $('.j-top-rename').on('click',function(){
            renameFile();
        });

        $('.j-top-download').on('click',function(){
            downloadFile();
        });
        //右键菜单
        $('body').click(function(){
            $('.j-right-click').hide();
        });

        $('.j-right-click').on('click','.j-right-share',function(){

        }).on('click','.j-right-rename',function(){
            renameFile();
        }).on('click','.j-right-download',function(){
            downloadFile();
        }).on('click','.j-right-remove',function(){
            removeFile();
        });

        $('.j-apps>li').eq(2).click(function(){
            window.location.href = (ports.file.domain == location.host ? ports.file.domain : '') + '/control/file/share';
        });

        $('.j-apps>li').eq(0).click(function(){
            window.location.href = (ports.net.domain == location.host ? ports.net.domain : '') + '/control';
        });

        $('.j-logo').click(function(){
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

        // 文件分类
        $('.j-base-file').click(function(){
            var _this = this;
            me.database.getAllFile(function(){
                $('.j-list li.active').removeClass('active');
                $(_this).addClass('active');
                me.changeFileRoad('reset');
                me.refreshFiles();
                window.location.hash = '';
            });
        });

        $('.j-picture-file').click(function(){
            var _this = this;
            me.database.getFileByType('picture',function(){
                $('.j-list li.active').removeClass('active');
                $(_this).addClass('active');
                me.changeFileRoad('reset');
                me.refreshFiles();
                window.location.hash = 'picture';
            });
        });

        $('.j-document-file').click(function(){
            var _this = this;
            me.database.getFileByType('document',function(){
                $('.j-list li.active').removeClass('active');
                $(_this).addClass('active');
                me.changeFileRoad('reset');
                me.refreshFiles();
                window.location.hash = 'document';
            });
        });

        $('.j-video-file').click(function(){
            var _this = this;
            me.database.getFileByType('video',function(){
                $('.j-list li.active').removeClass('active');
                $(_this).addClass('active');
                me.changeFileRoad('reset');
                me.refreshFiles();
                window.location.hash = 'video';
            });
        });

        $('.j-music-file').click(function(){
            var _this = this;
            me.database.getFileByType('music',function(){
                $('.j-list li.active').removeClass('active');
                $(_this).addClass('active');
                me.changeFileRoad('reset');
                me.refreshFiles();
                window.location.hash = 'music';
            });
        });

        $('.j-other-file').click(function(){
            var _this = this;
            me.database.getFileByType('other',function(){
                $('.j-list li.active').removeClass('active');
                $(_this).addClass('active');
                me.changeFileRoad('reset');
                me.refreshFiles();
                window.location.hash = 'other';
            });
        });

        $('.j-my-share').click(function(){
            window.location.href = '/control/myShare';
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
                            '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
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
                            '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
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
                            '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
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
                            '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
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
                            '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="folder" data-id="'+folder.child_folder_id+'">'+
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
                            '<ul class="j-one-list" data-index='+index+' data-parentId="'+me.database.currentParent.id+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
                            '<li class="j-list-file-name"><input type="checkbox"/><img src="/img/file/file-doc.png"/><p data-name="'+file.name+'">'+file.name+'.'+file.type+'</p><input type="text" value="'+file.name+'"/><i class="j-icon j-list-save">&#xe5ca</i><i class="j-icon j-list-cancel">&#xe5cd</i>'+
                            '<li class="j-list-file-size"><p>'+changeSize(file.size)+'</p></li>'+
                            '<li class="j-list-file-date"><p>'+new Date(file.create_time).Format("yyyy-MM-dd hh:mm:ss") +'</p></li>'+
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
                            '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
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
                            '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
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
                                '<div data-checked="no" class="j-one-block" data-index='+index+' data-parentId="'+me.database.currentParentId+'" data-type="'+file.type+'" data-id="'+file.file_id+'">'+
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
    //设置主窗口大小
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
            }
        }
    }
};

database = new Database(function(database){
    view = new View(database);
});
