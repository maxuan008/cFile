

/** 课程 ***/

        //***** 创建新的课程 ********接口======：,  **********************/
                url: /course/develop/addcourse
                POST
                参数：
                必选: type='1学科,2领域,3任务,4项目' coursename= '课程名' , describe='课程描述'， period ='课时', teacher_introduction = '教师介绍'  ;
                非必选：  workflow='工作过程' ,  target='目标'，  tool = '工具' ,  for_use_people= '适用人群' , content = '内容' 
                        jobreq='工作需求' , pqs='职业资格标准' , period ='课时', method ='工作方法与组织方式'    ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{course_id:'aaaaaaaa' }
                }




        //*****更新课程********接口======：,  **********************/
                url: /course/develop/updatecourse
                POST
                参数： 必选: course_id = 'aaaaaaaa'  
                type='1学科,2领域,3任务,4项目' coursename= '课程名' , describe='课程描述'， period ='课时', teacher_introduction = '教师介绍'  ;
                workflow='工作过程' ,  target='目标'，  tool = '工具' ,  for_use_people= '适用人群', content = '内容'  , 
                jobreq='工作需求' , pqs='职业资格标准' ,  method ='工作方法与组织方式'    ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }

        //*****删除课程********接口======：,  **********************/
                url: /course/develop/delcourse
                POST
                参数： course_id = 'aaaaaaaa';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }





/** 课程子集 , 对应: 章, 学习情景 ***/

        //***** 创建新的课程子集 ********接口======：,  **********************/
                url: /course/develop/addcoursechild
                POST
                参数：
                必选: course_id='aaaaaaaa', num= '2' , title='情景名'，    ='课时', describe = '情景描述'， type='0,1' ;
                非必选：  workflow='工作过程' ,  target='目标', content = '内容' , keynote = '重难点'  ,  task = '工作任务' ,  
                        for_use_people= '适用人群', teacher_introduction = '教师介绍', tool = '工具', method ='工作方法与组织方式' , jobreq='工作需求' , pqs='职业资格标准'  ;
               
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{course_child_id:'bbbbbbbbb' }
                }




        //*****更新课程子集********接口======：,  **********************/
                url: /course/develop/updatecoursechild
                POST
                参数： 必选: course_child_id = 'bbbbbbbbb'  
                num= '2' , title='情景名'， period ='课时', describe = '情景描述',
                workflow='工作过程' ,  target='目标', content = '内容' , keynote = '重难点'  ,  task = '工作任务' ,  
                for_use_people= '适用人群', teacher_introduction = '教师介绍', tool = '工具', method ='工作方法与组织方式' 
                , jobreq='工作需求' , pqs='职业资格标准'  ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


        //*****删除课程子集********接口======：,  **********************/
                url: /course/develop/delcoursechild
                POST
                参数： course_child_id = 'bbbbbbbbb';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }






/** 任务 , 对应: 节, 任务 ***/

        //***** 创建新的任务 ********接口======：,  **********************/
                url: /course/develop/addtask
                POST
                参数：
                必选: course_id='aaaaaaaa', course_child_id = 'bbbbbbbb',  title='情景名'， period ='课时', describe = '情景描述', isasync ='0异步， 1同步' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{task_id:'ddddddd' }
                }


        //*****更新任务********接口======：,  **********************/
                url: /course/develop/updatetask
                POST
                参数： 必选: task_id = 'ddddddd' ,
                title='情景名'， period ='课时', describe = '情景描述', isasync ='0异步， 1同步' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


        //*****删除任务********接口======：,  **********************/
                url: /course/develop/deltask
                POST
                参数： task_id = 'ddddddd';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }








/** 子任务 , 对应: 小节,学科型使用 ***/

        //***** 创建新的子任务 ********接口======：,  **********************/
                url: /course/develop/addtaskchild
                POST
                参数：
                必选: course_id='aaaaaaaa', task_id = 'dddddd',  title='情景名'， period ='课时', describe = '情景描述', isasync ='0异步， 1同步' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{task_child_id : 'ddddddd' }
                }


        //*****更新子任务********接口======：,  **********************/
                url: /course/develop/updatetaskchild
                POST
                参数： 必选: task_child_id = 'ddddddd' ,
                title='情景名'， period ='课时', describe = '情景描述', isasync ='0异步， 1同步' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


        //*****删除子任务********接口======：,  **********************/
                url: /course/develop/deltaskchild
                POST
                参数： task_child_id = 'ddddddd';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }





        //*****下载任务的文件********接口======：,  **********************/
                url: /course/develop/downtaskfile
                get
                参数： id = 'ddddddd', type='dev'or 'study'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        返回下载文件
                }





/** 关于office后台 ***/

        //*****将office后台的文件下载到对应的课程设计的文件中********接口======：,  **********************/
                url: /course/develop/downloadOfficeFile_dev
                get
                参数： id = 'ddddddd', url='http://192.168.1.106/cache/files/6220996887776_8242/output.docx/999docx.docx?md5=F5Befv8b6L0B1x5eW4GLNw==&expires=1505360484&disposition=attachment&ooname=output.docx'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }




