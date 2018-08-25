
code: 201 ,203 204,205,   //201:返回成功，203：此账户的云文件有多份,云数据错误， 204：返回错误， 205：session未通过

//****用户接口：*****接口======获取用户根下的子文件夹和文件**********************/
        url: /file/disk/rootlist
        get
        参数：  // 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{
                     user_folder_id:'fff'
                     folders:[
                        {child_folder_id:'' ,name:"",parent_id:'', create_time:''},
                        {child_folder_id:'' ,name:"",parent_id:'', create_time:''}
                        ], 

                     files:[
                             {file_id:'aaa' ,  name:'11', type:'doc', create_time:''},
                             {file_id:'bbb' ,  name:'22', type:'pdf', create_time:''}
                           ]
                 }


        }

//******获取子文件夹的子文件夹和文件*******接口======  **********************/
        url: /file/disk/childfolderlist
        get   //参数：child_folder_id为要获取的文件夹的父id
        参数：  child_folder_id=''  
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{

                     folders:[
                        {child_folder_id:'' ,name:"",parent_id:'', create_time:''},
                        {child_folder_id:'' ,name:"",parent_id:'', create_time:''}
                        ], 

                     files:[
                             {file_id:'aaa' ,  name:'11', type:'doc', create_time:''},
                             {file_id:'bbb' ,  name:'22', type:'pdf', create_time:''}
                           ]
                 }

        }

//*****上传文件********接口======：,  **********************/
        url: /file/disk/uploadfile
        POST
        参数： id='fff'; id为用户文件夹ID:user_folder_id ，或子文件夹ID:  child_folder_id
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {file_id:'aaa',name:"文件(1).doc"  }
        }


//*****下载文件********接口======：,  **********************/
        url: /file/disk/downloadfile
        POST
        参数： file_id=;
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }

//*****更新文件夹名********接口======：,  **********************/
        url: /file/disk/updatefolder  
        POST     //参数：child_folder_id为要修改的文件夹的id，此文件夹的父文件夹ID
        参数： child_folder_id=, newname=， ?parent_id=;  
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }

//*****创建新的子文件夹********接口======：,  **********************/
        url: /file/disk/addfolder
        POST
        参数：newname=， parent_id= ;
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{child_folder_id:child_folder_id }
        }




//*****更新文件名********接口======：,  **********************/
        url: /file/disk/updatefile
        POST
        参数： file_id= , newname= , folder_id = ;
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }

//*****删除文件********接口======：,  **********************/
        url: /file/disk/delfile
        POST
        参数： file_id = ;
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }



//*****删除用户的子文件夹********接口======：,  **********************/
        url: /file/disk/delfolder
        POST
        参数： child_folder_id = ;
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }










/**共享 */







//*****共享文件到机构，并指定角色可见********接口======：,  **********************/
        url: /file/disk/deptshorefile
        POST
        参数： file_id =  , dept_id =  , role_id = '-1' or ['role_id1','role_id2'];
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                 datas:{shore_file_id:'aaa' ,name:'11' ， type：'doc' } 
        }



//********接口======获取机构根下的子文件夹和文件**********************/
        url: /file/disk/deptrootlist
        get
        参数：dept_id:'aaaaa'  // 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{
                     dept_folder_id:'fff'
                     folders:[
                        {shore_folder_id:'' ,name:"",},
                        {shore_folder_id:'' ,name:"",'}
                        ], 

                     files:[
                             {shore_file_id:'aaa' , size:'6876',  name:'11', type:'doc'},
                             {shore_file_id:'bbb' , size:'887686',  name:'22', type:'pdf'}
                           ]
                 }


        }

//******获取子文件夹的子文件夹和文件*******接口======  **********************/
        url: /file/disk/deptchildfolderlist
        get   //参数：child_folder_id为要获取的文件夹的父id
        参数：  shore_folder_id=''  
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{

                     folders:[
                        {child_folder_id:'' ,name:"",},
                        {child_folder_id:'' ,name:"",}
                        ], 

                     files:[
                             {file_id:'aaa' ,  name:'11', type:'doc'},
                             {file_id:'bbb' ,  name:'22', type:'pdf'}
                           ]
                 }

        }









//******获取用户的类型的文件*******接口======类型：图片：picture， 文档 ： document ，视频:video ，音乐:music ，其它:other  **********************/
        url: /file/disk/findtype
        get   
        参数：  filetype='document'   //参数：图片：picture， 文档 ： document ，视频:video ，音乐:music，其它:other
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{

                     files:[ 
                             {file_id:'aaa' ,  name:'11', type:'doc', create_time:''},
                             {file_id:'bbb' ,  name:'22', type:'pdf', create_time:''}
                           ]
                 }

        }




//*****共共享文件夹到机构，并指定角色可见; 共享前先做一个检测，如果曾共享过，弹框询问用户是否要继续共享；检测接口下方：/file/disk/isfoldershored********接口======：,  **********************/
        url: /file/disk/shorefoldertodept
        POST
        参数： child_folder_id =  , dept_id =  , role_id = '-1' or ['role_id1','role_id2'];
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                 datas:{shore_folder_id:'aasdfadsfdsafa' ,name:'aab'  } 
        }


//******检测文件夹是否已被在此机构共享过：*******接口======  **********************/
        url: /file/disk/isfoldershored
        post  
        参数： child_folder_id =  , dept_id =    //参数：图片：picture， 文档 ： document ，视频:video ，音乐:music，其它:other
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{
                  flag:true, false;   true:已在此部门共享过； false: 未共享；
                 }

        }





/**我的共享 */


//********接口======获取我共享到机构的文件夹和文件**********************/
        url: /file/disk/myshares
        get
        参数： // 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{
                     dept_folder_id:'fff'
                     folders:[
                        {shore_folder_id:'' ,name:"",},
                        {shore_folder_id:'' ,name:"",'}
                        ], 

                     files:[
                             {shore_file_id:'aaa' ,  name:'11', type:'doc' ,size:''},
                             {shore_file_id:'bbb' ,  name:'22', type:'pdf' ,size:''}
                           ]
                 }


        }



//********接口======删除共享文件和文件夹**********************/
        url: /file/disk/delmyshares
        post         //参数 使用JSON.stringify()
        参数： files="['111','222']" , folders="['aaaa','bbbbb']"     // 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:''

        }





