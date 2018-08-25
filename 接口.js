

//*** 需session：**********接口======首页用：首页课程列表 **********************/
        url: /net/index/courselist
        post
        参数： ;   
        返回数据：    //status ：1可以做锁定或删除角色操作， 2锁定，不能删除
        {      
                code: 201 or 204,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ 
                        { 
                           dept_id: 'aaaaa' , 
                           name：'系名' ，
                           childs:[
                                         { 
                                          dept_id:'111',
                                          name:'专业名1', 
                                          courselist:[{course_id:'6666' , coursename:'' ,des:'' , pngpath:''    } , {{course_id:'6666' , coursename:'' ,des:'' , pngpath:''} , {}] 
                                          },

                                         { 
                                          dept_id:'111',
                                          name:'专业名2', 
                                          courselist:[{course_id:'6666' , coursename:'' ,des:'' , pngpath:''    } , {{course_id:'6666' , coursename:'' ,des:'' , pngpath:''} , {}] 
                                          }
                           ]   
                        } , 

                        { 
                           dept_id: 'aaaaa' , 
                           name：'系名2' ，
                           childs:[
                                         { 
                                          dept_id:'111',
                                          name:'专业名3', 
                                          courselist:[{course_id:'6666' , coursename:'' ,des:'' , pngpath:''    } , {{course_id:'6666' , coursename:'' ,des:'' , pngpath:''} , {}] 
                                          },

                                         { 
                                          dept_id:'111',
                                          name:'专业名4', 
                                          courselist:[{course_id:'6666' , coursename:'' ,des:'' , pngpath:''    } , {{course_id:'6666' , coursename:'' ,des:'' , pngpath:''} , {}] 
                                          }
                           ]   
                        }
                          
                        
                       ]
        
}










//*** 无需session：**********接口1======注册用：查询所有有效组织 **********************/
        url: /net/register/searchorg_register
        get
        参数： ;   
        返回数据：    //status ：1可以做锁定或删除角色操作， 2锁定，不能删除
        {      
                code: 201 or 204,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {org_id: 'aaaaa' , name：'计算机系' } , 
                        {org_id: 'bbbbb' , name：'A班' } ]
        }



//*** 无需session：**********接口2======注册用：查询组织的所有机构 **********************/
        url: /net/register/searchdept_register
        get
        参数：org_id='111' ;   
        返回数据：    //status ：1可以做锁定或删除角色操作， 2锁定，不能删除
        {      
                code: 201 or 204,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {dept_id: 'aaaaa' , father_id: '1111', name：'计算机系',level:'1'} , 
                        {dept_id: 'bbbbb' , father_id: 'aaaa', name：'A班',level:'2'} ]
        }


//***无需session：：**********接口3======注册用：查询组织的角色 **********************/
        url: /net/register/searchroles_register
        get org_id='aaa'
        参数：;   
        返回数据：    //status ：1可以做锁定或删除角色操作， 2锁定，不能删除
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {role_id: 'aaaaa' , name: '学生'} , {role_id: 'bbbb' , name: '老师'}  ]
        }



//*************无需session：： **********接口4 ======注册：********************* */
        url: /register/apply
        POST
        参数：   org_id=, dept_id= , role_id= ,account,password,email
        返回数据：
        {
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: 返回数据为登录后数据，见登录；
        }




//*************无需session： **********接口5 ======用户登录：********************* */

        url: /net/login
        POST
        参数：account=admin，password=123
        返回数据：
        {
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {
                        menuinfo: [
                                {
                                app_id:'org' ,                       //功能ID
                                domain:'http//:www.baidu.com','',   //链接的主域，空位当前域
                                href:'',
                                blank:'0','1',   //1为跳转页面
                                name:'菜单功能名',  
                                developmark:'aaaa',
                                appfuns: [      //功能旗下的子功能
                                        {fun_id:'', href:'/net/login', name:'组织查询'},
                                        {fun_id:'', href:'', name:'机构维护'}
                                        ]
                                },

                         ],

                        personalinfo ：[
                                {
                                app_id:'aaa' ,                       //功能ID
                                domain:'',   //链接的主域，空位当前域
                                href:'',
                                blank:'0','1',   //1为跳转页面
                                name:'菜单功能名',  
                                developmark:'aaaa',
                                appfuns: [      //功能旗下的子功能
                                        {fun_id:'', href:'', name:'组织查询'},
                                        {fun_id:'', href:'', name:'机构维护'}
                                        ]
                                },
                        ],


                        // userfolderinfo:{
                        //         user_folder_id:'aaaa',
                        //         diskname:'admin_djads'
                        // },

                        // orgfolderinfo:{
                        //         org_folder_id:'aaaa',
                        //         diskname:'admin_djads'
                        // },

                        userinfo: {
                                account: 'user1',
                                fullname:'张三',
                                email:'abc@aa.com',
                                roleType:'',   //角色类型：如： 'student':学生 ， 'teacher':老师, 'superadmin'：超管 ,‘common’:一般用户， 'orgadmin':企业账号  , 'null': 无组织游客,'-1'
                        },

                        orginfo ：{  //所在当前组织机构的信息,超管类型时全部信息为：''
                                org_id:'',
                                orgName:'超管公司',
                                deptid:'',
                                deptName:'超管部门',
                                deptuser_id: 'superadmin_ID' , // 无所在机构的为‘’, 超管为'superadmin_ID', 企业账户为'orgadmin_ID'
                        },

                        roles:[{role_id: "5e40bcb0-1e74-11e7-9858-01a1f8200ebc", name: "test21", type: "other", status: "-1"},
                                 {role_id: "c109e250-1eaf-11e7-ab1e-1790c43164f3", name: "学生", type: "student", status: "2"}
                                ],

                        rolesinfo:[   //用户所拥有的机构角色信息
                                {
                                org_id:'',
                                orgName:'超管公司', 
                                dept_id:'',
                                deptName:'超管部门',
                                role_id:'',
                                roleType:'superadmin', 
                                roleName:'超管',    
                                deptuser_id:'superadmin_ID',
                                status:'0'
                                },
                                {
                                org_id:'',
                                orgName:'中国职业学院',
                                 dept_id:'', 
                                deptName:'中国职业学院',
                                role_id:'',
                                roleType:'orgadmin', 
                                roleName:'学校管理员',    
                                deptuser_id:'orgadmin_ID',
                                status:'1'
                                }

                        ]


                }

  }




//********所有角色：*****接口2（与接口1返回数据类似） **********接口6 ======获取初始化数据：在每次页面刷新时使用， 其中包含用户身份信息， 组织信息，用户所能使用功能的信息  ********************* */

        url: /net/initializeinfo
        get
        参数：account=admin，password=123
        返回数据：
        {
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {
                        menuinfo: [
                                {
                                app_id:'org' ,                       //功能ID
                                domain:'http//:www.baidu.com','',   //链接的主域，空位当前域
                                href:'',
                                blank:'0','1',   //1为跳转页面
                                name:'菜单功能名',  
                                developmark:'aaaa',
                                appfuns: [      //功能旗下的子功能
                                        {fun_id:'', href:'', name:'组织查询'},
                                        {fun_id:'', href:'', name:'机构维护'}
                                        ]
                                },

                                ],

                        personalinfo：[
                                {
                                app_id:'aaa' ,                       //功能ID
                                domain:'',   //链接的主域，空位当前域
                                href:'',
                                blank:'0','1',   //1为跳转页面
                                name:'菜单功能名',  
                                developmark:'aaaa',
                                appfuns: [      //功能旗下的子功能
                                        {fun_id:'', href:'', name:'组织查询'},
                                        {fun_id:'', href:'', name:'机构维护'}
                                        ]
                                },
                        ],

                        // userfolderinfo:{
                        //         user_folder_id:'aaaa',
                        //         diskname:'admin_djads'
                        // },

                        // orgfolderinfo:{
                        //         org_folder_id:'aaaa',
                        //         diskname:'admin_djads'
                        // },

                        userinfo: {
                                
                                account: 'user1',
                                fullname:'张三',
                                email:'abc@aa.com',
                                roleType:'',   //角色类型：如： 'student':学生 ， 'teacher':老师, 'superadmin'：超管 ,‘common’:一般用户， 'admin':企业账号  , 'null': 无组织游客
                        },

                        orginfo：{  //所在当前组织机构的信息
                                org_id:'',
                                orgName:'',
                                deptid:'',
                                deptName:'',
                                deptuser_id: 'aaaaaaaaaaaaa' , // 无所在机构的为‘’      
                        }

                        rolesinfo:[   //用户所拥有的机构角色信息
                                {
                                org_id:'',
                                orgName:'超管公司', 
                                dept_id:'',
                                deptName:'超管部门',
                                role_id:'',
                                roleType:'superadmin', 
                                roleName:'超管',    
                                deptuser_id:'superadmin_ID',
                                status:'0'
                                },
                                {
                                org_id:'',
                                orgName:'中国职业学院',
                                 dept_id:'', 
                                deptName:'中国职业学院',
                                role_id:'',
                                roleType:'orgadmin', 
                                roleName:'学校管理员',    
                                deptuser_id:'orgadmin_ID',
                                status:'1'
                                }
                        ]


                }

  }






//*************接口3=====获取一个组织Html模板：  **********************/
        url: /control#org#orglist
        POST
        参数：
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }


//****superadmin超级管理员专用接口：*********接口7======模糊查询组织, name:组织名称, num：查询数量，不得超过300 **********************/
        url: /net/org/searchorg
        POST
        参数：name='abcdefg' ,num=20 ;  // 可以不用参数， 遍历所有
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {id: 1 , name: 1 } ,{id:2 , name:2 }  ]


        }

//******superadmin超级管理员专用接口：*******接口8======添加一个组织：组织名称,  **********************/
        url: /net/org/addorg
        POST
        参数：name='中国职业学院', account ='orgadmin' , password ='123'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {id:  }

        }

//*****superadmin超级管理员专用接口：********接口9======删除一个组织：,  **********************/
        url: /net/org/delorg
        POST
        参数：id='abcdefg'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }






//******superadmin超级管理员专用接口：*******接口10======初始化授权的组织信息  **********************/
        url: /net/org/initorgapp
        get
        参数：org_id
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }




//******superadmin超级管理员专用接口：*******接口11======获取授权的组织的功能  **********************/
        url: /net/org/getorgapp
        get
        参数：org_id
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:[{org_app_id : , org_id: , app_id: ,status:, name  }]
        }

//******superadmin超级管理员专用接口：*******接口12======更新授权的组织的功能  **********************/
        url: /net/org/updateorgapp
        post
        参数：org_app_id ='aaa', status='1'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }


















//********超管，组织管理员*****接口13======更新组织：, id和name ,必选  **********************/
        url: /net/org/updateorg
        POST
        参数：id='abcdefg' , name='中国职业学院2'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }












//********超管*****接口14======模糊查询功能, name:功能名称, num：查询数量，不得超过50 **********************/
        url: /net/app/searchapp
        get
        参数：name='' ,num=20 ;  // 可以不用参数， 遍历所有
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {id: 1 , name: 1,domain:'', isblank:1,type:2 ,position:1 ,href:'',developmark:''} ,
                {id:2 , name:2,domain:'', isblank:1,type:2 ,position:1 ,href:'',developmark:'' }  ]
        }

//******超管*******接口15======添加一个功能：功能名称,  **********************/

        url: /net/app/addapp
        POST    //type：0归属普通用户，1归属企业账户，2归属超级管理员 ；position：所处位置：1主菜单， 2下拉； 
        参数：name='角色管理' , id='role' , domain =''  , isblank = 0,1  ， type= 0，1 ， 2 ， position=1，2   , href= '',developmark:'' //参数：name,id ,domain，isblank ，type ，position项必需参数 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {id:'role' , name:'角色管理',domain:'', isblank:1,type:2 ,position:1 ,href:'',developmark:''}
        }



//******超管 *******接口17======更新功能：, id和name ,必选  **********************/
        url: /net/app/updateapp
        POST
        参数：id='role' , app_id='role2', name='角色管理2' , domain =''  , isblank = 0,1  ， type= 0，1 ， 2 ， position=1，2   , href= '' ,developmark:''
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }


//*******超管******接口16======删除一个功能：,  **********************/
        url: /net/app/delapp
        POST
        参数：id='role'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }










//*************接口18======查询子功能, **********************/
        url: /net/app/searchappfuns
        get
        参数：app_id='role' ;    //id为app_id
        返回数据：    //href：类型：0非ifram, 1ifram
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {fun_id: 1 , name: '添加角色'，type：'0',href:'addrole'} ,{fun_id: 1 , name: '查找角色', type：'1' ,href:'/searchrole'}  ]
        }

//*************接口18======添加一个功能： **********************/

        url: /net/app/addappfun
        POST    //type：0归属普通用户，1归属企业账户，2归属超级管理员 ；position：所处位置：1主菜单， 2下拉； 
        参数：app_id='role' , name='角色管理' , type= 0，1 ,   href= 'roleakd' //参数：app_id , name, type,   href 项必需参数 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {fun_id:'dfsaassf'}
        }

//*************接口19======删除一个子功能：,  **********************/
        url: /net/app/delappfun
        POST
        参数：fun_id='dfsaassf'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
   
        }


//*************接口20======更新子功能：, id和name ,必选  **********************/
        url: /net/app/updateappfun
        POST
        参数：app_id='',  fun_id='dfsaassf' , name='角色管理2' , type =''   , href= '' 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }






























//***orgadmin组织管理员专用接口：**********接口21======查询组织的角色 **********************/
        url: /net/role/searchroles
        get
        参数：;   
        返回数据：    //status ：1可以做锁定或删除角色操作， 2锁定，不能删除
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {role_id: 'aaaaa' , name: '学生', type：'student',status:'1'} , {role_id: 'bbbb' , name: '老师', type：'teacher',status:'2'}  ]
        }

//*******orgadmin组织管理员专用接口：******接口21======添加一个角色：组织下的角色名不能重复 **********************/

        url: /net/role/addrole
        POST    
        参数： name='助教' , type='student'，'teacher'，'other' ,   status= '1'可用,'2'锁定 //参数：
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {role_id: 'cccccc'}
        }

//*******orgadmin组织管理员专用接口：******接口22======删除一个子功能：,  **********************/
        url: /net/role/delrole
        POST
        参数：role_id: 'cccccc'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }


//******orgadmin组织管理员专用接口：*******接口23======更新子功能：, id和name ,必选  **********************/
        url: /net/role/updaterole
        POST
        参数：role_id: 'cccccc' , name='角色管理2' , type =''   , status= '2'  //role_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }



//******orgadmin组织管理员专用接口：*******接口24======初始化组织的角色功能信息  **********************/
        url: /net/role/initroleapp
        get
        参数：
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }



//******orgadmin组织管理员专用接口：*******接口25======获取组织的角色的功能  **********************/
        url: /net/org/getroleapp
        get
        参数：
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',                //参数：roleapps为数组，其中是一个角色下所有的功能权限信息， role_app_id为角色功能的id，用于修改授权的id用。status：0 未授权， 1授权
                datas:[{role_id :'aaaa' , name:"学生" , roleapps: [{role_app_id:'111111' , app_id:'bbb' ,status： '0'， name：'功能名1'  },{role_app_id:'2222' , app_id: 'bbb',status：'1'， name：'功能名2'  }]  }]
        }

//******orgadmin组织管理员专用接口：*******接口26======更新角色的功能 **********************/
        url: /net/org/updateroleapp
        post
        role_app_id ='aaa', status='1'
        返回数据：
        {      
                code: 201 or 204 or 205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
        }












//***orgadmin组织管理员专用接口：**********接口27======查询组织的所有机构 **********************/
        url: /net/org/searchdept
        get
        参数：org_id='111' ; ;   
        返回数据：    //status ：1可以做锁定或删除角色操作， 2锁定，不能删除
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {dept_id: 'aaaaa' , father_id: '1111', name：'计算机系',level:'1'} , 
                        {dept_id: 'bbbbb' , father_id: 'aaaa', name：'A班',level:'2'} ]
        }

//*******orgadmin组织管理员专用接口：******接口28======添加一个机构：组织下的机构名不能重复 **********************/

        url: /net/org/adddept
        POST           //参数：level为数字型， 为父机构节点的层级
        参数： name='计算机系' , father_id='aaaa'，level= 1 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {dept_id: 'cccccc'}
        }

//*******orgadmin组织管理员专用接口：******接口29======删除一个机构：,  **********************/
        url: /net/org/deldept
        POST
        参数： dept_id: 'cccccc'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }


//******orgadmin组织管理员专用接口：*******接口30======更新机构：, id和name ,必选  **********************/
        url: /net/org/updatedept
        POST
        参数： dept_id: 'cccccc' , name='角色管理2', father_id='dddd' ,level=3 ,isvalid=1 //dept_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }







//***orgadmin组织管理员专用接口：**********接口31======查询机构的用户 **********************/
        url: /net/org/searchdeptuser
        get
        参数：dept_id ;   
        返回数据：    //status ：1已审核，0，未审核
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {deptuser_id: 'aaaaa' , user_id: '1111', role_id'abds',status:'1' ，account：‘zhangshan’，fullname：‘张山’  } , 
                        {deptuser_id: 'aaaaa' , user_id: '1111', role_id'abds',status:'1' ，account：‘zhangshan’，fullname：‘张山’  }]
        }

//*******orgadmin组织管理员专用接口：******接口32======添加机构的用户： **********************/

        url: /net/org/adddeptuser
        POST           //参数：需后台验证重名
        参数： name='计算机系' , father_id='aaaa'，level= 1 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: {dept_id: 'cccccc'}
        }

//*******orgadmin组织管理员专用接口：******接口33======删除一个机构：,  **********************/
        url: /net/org/deldeptuser
        POST
        参数： deptuser_id: 'cccccc'
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }


//******orgadmin组织管理员专用接口：*******接口34======更新机构：, id和name ,必选  **********************/
        url: /net/org/updatedeptuser
        POST
        参数： deptuser_id: 'cccccc' , role_id='', status='dddd'  //dept_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }














//******普通用户专用接口：***设置用户的默认机构角色****接口35=====：, deptuser_id ,必选  **********************/
        url: /net/user/setdefaultrole
        POST
        参数： deptuser_id: 'cccccc'  //dept_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }

//******普通用户专用接口：***切换机构角色****接口36=====：, deptuser_id ,必选  **********************/
        url: /net/user/changerole
        POST
        参数： deptuser_id: 'cccccc'  //dept_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }




//******普通用户专用接口：***申请加入到机构角色****接口37=====：, deptuser_id ，role_id,必选  **********************/
        url: /net/user/applydeptuser
        POST
        参数： dept_id: 'cccccc' , role_id ; //dept_id,role_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{deptuser_id:'aaa' } 
        }


//******orgadmin组织管理员专用接口：***添加用户到指定的机构，并制指定角色****接口38=====：, deptuser_id ，role_id,必选  **********************/
        url: /net/org/addusertodepuser
        POST
        参数： dept_id: 'cccccc' , role_id: '' ,user_id:'' ; //dept_id,role_id 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                  datas:{deptuser_id:'aaa' } 
        }


//******orgadmin组织管理员专用接口：***搜索不在本机构下的有效用户，用户范围限于****接口38=====： name,必选  **********************/
        url: /net/org/searchundeptusers
        get
        参数： accountname: 'cccccc' ; //name 必选
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                  datas:[
                        {user_id:'aaadfdsafa' , account:'mx1' } ,
                        {user_id:'aaadfdsafa' , account:'mx2' } ,
                  ]
        }








/*************************************/
/*******        
/*******  以下未记录Excel测试记录*******/
/*******
/*************************************/


//*********所有角色可用****=====：修改用户的全名，邮箱，密码   **********************/
        url: /net/user/updateuserinfo
        post
        参数： fullname: '张三',eamil:'sadfj@ad.com' ,   password:'dskfjk' ，nickname：‘乐乐’; // fullname , eamil  , password ，nickname不能全为空
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',

        }


        //上传头像
        url: /net/user/uploadheadpng
        post
        参数： 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:''
                datas:{path:'./ddd/bbbbbbbbb.png' }
        }



        //下载头像
        url: /net/user/downloadpng
        get
        参数： path:''
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:''
               
        }






//*********组织管理员和普通角色****=====：获取当前登录所在机构树  **********************/
        url: /net/org/getdepttree
        post
        参数： 
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas: [ {dept_id: 'aaaaa' , father_id: '1111', name：'计算机系',level:'1'} , 
                        {dept_id: 'bbbbb' , father_id: 'aaaa', name：'A班',level:'2'} ]
        }


























