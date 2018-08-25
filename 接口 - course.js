

/** 课程 ***/

        //下载图片
        url: /course/develop/downloadpng
        get
        参数： path:''
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:''
               
        }


        //***上传临时的文件 */
                url: /course/develop/uploadtmpfile
                POST
                参数：
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{path:'./ddd/bbbbbbbbb.png' }
                }



        //***** 创建新的课程 ********接口======：,  **********************/
                url: /course/develop/addcourse
                POST
                参数：
                必选: type='1学科,2领域,3任务,4项目' coursename= '课程名' , describe='课程描述'， period ='课时', teacher_introduction = '教师介绍'  ;
                非必选：  workflow='工作过程' ,  target='目标'，  tool = '工具' ,  for_use_people= '适用人群' , content = '内容' 
                        jobreq='工作需求' , pqs='职业资格标准' , period ='课时', method ='工作方法与组织方式' , pngpath=''   ;
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


        //*****上传课程简介图像********接口======：,  **********************/
                url: /course/develop/uploadpng
                POST
                参数： course_id = 'aaaaaaaa';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }






        //***** 创建新的课程 ********接口======：,  **********************/
                url: /course/develop/publishcourse
                POST
                参数：
                必选: course_id='1学科,2领域,3任务,4项目' dept_id= '课程名'  ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{belong_id:'aaaaaaaa' }
                }






        //*****获取老师所有编辑的课程列表********接口======：,  **********************/
                url: /course/develop/getcourses
                POST
                参数： 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                course_id:'',
                                coursename:
                                childs:[

                                ]
                
        
                        }
                }









/** 课程子集 , 对应: 章, 学习情景 ***/





        //***** 创建新的课程子集 ********接口======：,  **********************/
                url: /course/develop/addcoursechild
                POST
                参数：
                必选: course_id='aaaaaaaa', num= '2' , title='情景名'，   period ='课时', describe = '情景描述'， type='0,1' ;
                非必选：  workflow='工作过程' ,  target='目标', content = '内容' , keynote = '重难点'  ,  task = '工作任务' ,  
                        for_use_people= '适用人群', teacher_introduction = '教师介绍', tool = '工具', method ='工作方法与组织方式' , jobreq='工作需求' , pqs='职业资格标准'  ;
                        pngpath='' ;
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
                type='0,1' , num= '2' , title='情景名'， period ='课时', describe = '情景描述',
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


        //*****上传学习情景的简介图像********接口======：,  **********************/
                url: /course/develop/uploadpngchild
                POST
                参数：course_id = '', course_child_id = 'aaaaaaaa';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }





        //*****发布学习情境********接口======：,  **********************/
                url: /course/develop/completedcoursechild
                POST
                参数： 必选: course_child_id = 'bbbbbbbbb'  


                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }









/** 学科体系 , 节，小节 ， 学习记录， 公共评论记录 ***/

        //***** 查询章下节的集合数据********接口======：,  **********************/
                url: /course/subject/searchsections
                POST
                必选参数： course_child_id
                
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                         [
                            {
                                section_id:'bbbbbbbbb'， txt：'0,1' , exam_id：'2' , video：'情景名', videoname：'dd' , vtype：'mp4' 
                                childs:[{ section_child_id:'bbbbbbbbb'， txt ：'0,1' , exam_id：'2' , video：'', videoname：'dd' , vtype：'mp4' },{}  ]
                            } ,
                            {
                                section_id:'bbbbbbbbb'， txt：'0,1' , exam_id：'2' , video：'情景名', videoname：'dd' , vtype：'mp4' 
                                childs:[{ section_child_id:'bbbbbbbbb'， txt ：'0,1' , exam_id：'2' , video：'', videoname：'dd' , vtype：'mp4' },{}  ]
                            }   

                         ]
                }



        //下载视频
        url: /course/develop/downloadvideo
        get
        参数： path:''
        返回数据：
        {      
                code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:''
               
        }


        //***** 节的操作********接口======：,  **********************/
                url: /course/subject/sectionoperation
                POST
                必选参数： type: '1:新建' ,'2： 更改', '3：删除' ，"4 查询"  
                
                参数:
                 "1 新建" ： course_child_id='aaaaaaaa', title='5', txt= 'ttt' , exam_id='',   video ='./aaa/bbb/cc.mp4', videoname='cc' , vtype='mp4' ;
                 "2 更改" ： section_id = 'bbbbbbbbb' ,title='5',  txt='0,1' , exam_id= '2' , video='情景名', videoname='dd' , vtype='mp4'  ;
                 "3 删除" ： section_id='aaaaaaaa';
                 
                 "4 查询" ： section_id='aaaaaaaa';


                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                        "1 新建"：  {section_id:'bbbbbbbbb' }
                        "4 查询"：  {section_id:'bbbbbbbbb'，title='5', txt：'0,1' , exam_id：'2' , video：'情景名', videoname：'dd' , vtype：'mp4'  }

                }






        //*****上传学习情景中节或小节的视频********接口======：,  **********************/
                url: /course/subject/uploadvideo
                POST
                参数：  
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{path: '/dfkd', vtype :'' , videoname:''  } 

                }


        //***** 小节的操作********接口======：,  **********************/
                url: /course/subject/sectionchildoperation
                POST
                必选参数： type: '1:新建' ,'2： 更改', '3：删除'   
                
                参数:
                 "1 新建" ： section_id='aaaaaaaa', title='5', txt= 'ttt' , exam_id='',   video ='./aaa/bbb/cc.mp4', videoname='cc' , vtype='mp4' ;
                 "2 更改" ：  section_child_id = 'bbbbbbbbb' , txt='dfa' , exam_id= '2' , video='./aaa/bbb/cc.mp4', videoname='dd' , vtype=''  ;
                 "3 删除" ： section_child_id='aaaaaaaa';
                 "4 查询" ： section_child_id='aaaaaaaa';
                 

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                        "1 新建"：  {section_child_id:'bbbbbbbbb' }
                        "4 查询"：  {section_child_id:'bbbbbbbbb'，title='5', txt ：'0,1' , exam_id：'2' , video：'', videoname：'dd' , vtype：'mp4'  }
                }




        //***** 公共评论的操作********接口======：,  **********************/
                url: /course/subject/commentsoperation
                POST
                必选参数：type: '1:新建' ,'2：删除'   
                
                参数:
                 "1 新建" ： section_id='aaaaaaaa', section_child_id='' , user_id='', account='',fullname='', txt= 'ttt' ;
                 "2 删除" ： public_comments_id='aaaaaaaa';
                 "3 查询" ： section_id='aaaaaaaa' 或者 section_child_id='bbb'  ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                        "1 新建"：  {public_comments_id:'bbbbbbbbb' }
                        "3 查询" ： [
                                { public_comments_id:'' , section_id:'' , section_child_id:'' ,  account:'' , fullname:'', txt:'' ,  create_time:'' },
                                { public_comments_id:'' , section_id:'' , section_child_id:'' , account:'' ,  fullname:'', txt:'' ,  create_time:'' }
                        ]

                }




        //***** 学习记录的操作********接口======：,  **********************/
                url: /course/subject/studylogoperation
                POST
                必选参数：type: '1:新建' ,'2:更新'   
                
                参数:
                 "1 新建" ： section_id='aaaaaaaa', section_child_id='' , user_id='', txt= 'ttt' ;
                 "2 更新" ： study_log_id='aaaaaaaa' , txt= 'ttt';
                 "3 查询" ： section_id='aaaaaaaa' 或者 section_child_id='bbb'  ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                        "1 新建"：  {study_log_id:'bbbbbbbbb' , myexam_id='' }

                         "3 查询" ： [
                                { study_log_id:'' , section_id:'' , section_child_id:'',  myexam_id:'' , txt:'' ,  create_time:'' },
                                { study_log_id:'' , section_id:'' , section_child_id:'',  myexam_id:'' , txt:'' ,  create_time:'' }
                        ]

                }














/**活动 , 对应: 节, 活动 ***/

        //***** 创建新的活动 ********接口======：,  **********************/
                url: /course/develop/addactivity
                POST
                参数：
                必选: course_id='aaaaaaaa', course_child_id = 'bbbbbbbb',  title='情景名'， period ='课时', describe = '情景描述', isasync ='0异步， 1同步' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{activity_id:'ddddddd',step_id:'' , task_id:''   }
                }


        //*****更新活动********接口======：,  **********************/
                url: /course/develop/updateactivity
                POST
                参数： 必选: activity_id = 'ddddddd' ,
                title='活动名' ， period ='课时', describe = '活动描述', isasync ='0异步， 1同步' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


        //*****删除活动********接口======：,  **********************/
                url: /course/develop/delactivity
                POST
                参数： task_id = 'ddddddd';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }















/**步骤 , 对应: 步骤 ***/

        //***** 创建新的步骤 ********接口======：,  **********************/
                url: /course/develop/addstep
                POST
                参数：
                必选: course_id='aaaaaaaa',course_child_id='', activity_id = 'bbbbbbbb' ;

                返回数据：
                {      
                        code: 201 or 204 , 205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{step_id:'33333' }
                }


       // *****步骤移动********接口======：,  **********************/
                url: /course/develop/exchangestep
                POST
                参数： 必选: step_id = 'ddddddd' ,  type='up or down'  //up:上移， down:下移
  
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



        //*****删除步骤********接口======：,  **********************/
                url: /course/develop/delstep
                POST
                参数： step_id = '55555';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


        //*****获取步骤信息,及旗下文件信息********接口======：,  **********************/
                url: /course/develop/getstep
                POST
                参数： step_id = '55555';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{step_id:'33333' ,
                               eles: [

                               ] }
                }











/**详细任务  ***/

        //***** 创建新的详细任务********接口======：,  **********************/
                url: /course/develop/addtask
                POST
                参数：
                必选: step_id='3333333', title='';
                非必需参数：  rolename=‘’ , iscooperation = '0' or '1'

                返回数据：
                {      
                        code: 201 or 204 , 205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{task_id:'33333' }
                }


       // *****修改步详细任务，仅限于 title,other_role_result,question_id更改********接口======：,  **********************/
       
                 url: /course/develop/updatetask   //other_role_result 转化为字符串传递
                 POST
                 参数： 必选: task_id = 'ddddddd' ,    
                 非必选： title=‘’  ， other_role_result="[id1,id2]"， exam_id=''  , iscooperation  ,rolename
  
                 返回数据：
                 {      
                         code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                         err:'',
                 }



        //*****删除详细任务********接口======：,  **********************/
                url: /course/develop/deltask
                POST
                参数： task_id = '55555'; 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }








/**任务的描述操作  ***/

        //***** 创建新的详细任务********接口======：,  **********************/
                url: /course/develop/addtaskele
                POST 
                参数： ele:'des描述', 'task_result输出结果', 'theory理论知识点'
                必选: task_id='3333333',step_id :'aaa',ele:'des', 'task_result', 'theory'  , type='text , upload , office , cloud_file' ,belong:'task','step' ;
                text:  txt
                office:  filetype 文档类型 , filename 文件名
                cloud_file:   fileID：文件的ID号 filename 文件名  filetype文件类型 sourceType 源文件的类型， 'myself':自身文件， 'shore':共享文件

                返回数据：
                {      
                        code: 201 or 204 , 205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{task_ele_id:'33333' ,task_file_id:'' }
                }


       // *****修改任务的描述，仅限富文本********接口======：,  **********************/
       
                 url: /course/develop/updatetaskele   //other_role_result 转化为字符串传递
                 POST
                 参数： 必选: task_ele_id = 'ddddddd' ,  txt=‘’     

  
                 返回数据：
                 {      
                         code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                         err:'',
                 }



        //*****删除任务的描述********接口======：,  **********************/
                url: /course/develop/deltaskele
                POST
                参数： task_ele_id = '55555'; 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }






        //*****更新office的回调********接口======：,  **********************/
                url: /course/develop/trackfile
                POST
                参数： id = '55555';  //存储文件的ID
                  type='dev课程开发', 'study学习中的'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }




        //*****下载taskfile,用于office的显示********接口======：,  **********************/
                url: /course/develop/downtaskfile
                POST
                参数： id = '55555';  //存储文件的ID
                  type='dev课程开发', 'study学习中的', 'step协作文档的'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }





















//---****获取各种课程信息**、、



        // //*****获取详细任务信息********接口======：,  **********************/
        //         url: /course/develop/gettask
        //         POST
        //         参数： task_id = '55555'; 
        //         返回数据：
        //         {      
        //                 code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
        //                 err:'',
        //                 datas:{
        //                         task_id:''
        //                 }
        //         }


        // //*****获取步骤信息信息********接口======：,  **********************/
        //         url: /course/develop/getstep
        //         POST
        //         参数： step_id = '55555'; 
        //         返回数据：
        //         {      
        //                 code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
        //                 err:'',
        //                 datas:{
        //                         inof:{
        //                                 step_id:'',
        //                                 course_id:''
        //                         },
        //                         tasks: {
        //                                id1 : {task_id:'id1'} ,
        //                                id2 : {task_id:'id2'}
        //                         },
 
        //                 }
        //         }


        // //*****获取活动信息********接口======：,  **********************/
        //         url: /course/develop/getactivity
        //         POST
        //         参数： activity_id = '55555'; 
        //         返回数据：
        //         {      
        //                 code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
        //                 err:'',
        //                 datas:{
        //                         inof:{
        //                                 activity_id:'',
        //                                 course_id:''
        //                         },
        //                         steps: {
        //                                id1 : {step_id:'id1'} ,
        //                                id2 : {step_id:'id2'}
        //                         },
 
        //                         workflow:['111','222','3333']
        //                 }
        //         }







        //*****获取情景信息********接口======：,  **********************/

                url: /course/develop/getcourse_child
                POST
                参数： course_child_id = '55555'; 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                info:{  //情景信息
                                        course_child_id:'',
                                        course_id:'' ,type , num ,title,period,des,workflow,target
                                        content, keynote,task,for_use_people,teacher_introduction,tool,
                                        method
                                },
                                activities: {  //活动集合
                                       activity_id1 : { //活动1
                                              info:{activity_id,course_id,course_child_id,title,des,period, 
                                                    指针：   is_startstep ,next_step_id，create_time }  
                                              
                                              steps:{ //步骤集合
                                                  step_id1:{ //步骤1
                                                          info:{ step_id ， course_id ，activity_id 
                                                             指针1：  is_startstep ，next_step_id    }，
                                                          tasks:[
                                                                task_id1:{ //详细任务1
                                                                        step_id：
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }
                                                                                                                                        },
                                                                task_id2:{ //详细任务2
                                                                        step_id:
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }        
                                                          ]
 
                                                  },
                                                  step_id2:{ //步骤2
                                                          info:{ step_id ， course_id ，activity_id 
                                                             指针1：  is_startstep ，next_step_id     }，
                                                          tasks:[
                                                                task_id1:{ //详细任务1
                                                                        step_id：
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }
                                                                                                                                        },
                                                                task_id2:{ //详细任务2
                                                                        step_id:
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }        
                                                          ]
                                                  }

                                              }
                                        
                                         } ,



                                       id2 : { //活动2
                                              info:{step_id:'id2' } 
                                              
                                              steps:{  //步骤集合
                                                  step_id1:{ //步骤1
                                                          info:{ step_id:1 ...}，
                                                          tasks:{
                                                                task_id1:{ //详细任务1
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }                                                                    },
                                                                task_id2:{ //详细任务2
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                },
                                                          }
                                                  },
                                                  step_id2:{ //步骤2
                                                          info:{ step_id:1 ...}，
                                                          tasks:[
                                                                task_id1:{ //详细任务1
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }                                                                          },
                                                                task_id2:{ //详细任务2
                                                                        task_id:'1',
                                                                        desc: '任务描述'
                                                                }        
                                                          ]
                                                  }

                                              }      
                                         } 
                                }
                        }
                }



        //*****获取课程信息********接口======：,  **********************/

                url: /course/develop/getcourse
                POST
                参数： course_id = '55555'; 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                               
                                        activity_id:'',
                                        course_id:'' ,
                                
                                childs:  [{num:'1',course_child_id:'id1'  } , {num:'2',course_child_id:'id2'}  ]


                        }
                }


        //*****获取获取任务详细的信息********接口======：,  **********************/

                url: /course/develop/gettask
                POST
                参数： task_id = '55555'; 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                        
                                task_id:'',
                                course_id:'',
                                title: ,
                                other_role_result: ,
                                question_id: ,
                               
                                des:  [{ele_id:,type:'upload', files:[{task_file_id1:},{task_file_id2} ]  } , {ele_id:,type:'cloud_file', files:[{task_file_id1:},{task_file_id2} ] }, {ele_id:,type:'office   ', files:[{task_file_id1:},{task_file_id2} ] }  ],
                                theory: [],
                                task_result:[]
                        }
                }




        //*****获取老师的课程列表信息********接口======：,  **********************/

                url: /course/develop/getmycourses
                POST
                参数：
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                
                                        activity_id:'',
                                        course_id:'',
                                },
                                childs:  [{num:'1',course_child_id:'id1'..  } , {num:'2',course_child_id:'id2'...}  ]

                        }
                }



        //*****获取老师的发布或未发布的课程********接口======：,  **********************/

                url: /course/develop/getmycourses_belong
                POST
                参数： type = '0', '1'; 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:[
                             {
                               course_id:'',
                               coursename:'',
                               pngpath:'',
                               des:'',
                               type:''
                             },
                             {
                               course_id:'',
                               coursename:'',
                               pngpath:'',
                               des:'',
                               type:''
                             }
                        
                        ]
                }





        //*****获取此学生能学习的单人课程列表信息********接口======：,  **********************/

                url: /course/develop/getmysinglecourse
                POST
                参数：
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:[
                                {belong_id：'',course_id：'' ,  dept_id：''},
                                {belong_id：'',course_id：'' ,  dept_id：''}
                              ]
                                
                            

                
                }





                //*****获取此学生能学习的多人课程列表信息********接口======：,  **********************/

                url: /course/develop/getmymanycourse
                POST
                参数：
                返回数据：
                {
                    code: 201 or 204, 205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                            datas:[
                                { belong_id：'',course_id：'' ,  dept_id：''},
                                { belong_id：'',course_id：'' ,  dept_id：''}
                            ]




                }














//*****课程归属分类********接口======：,  **********************/

        //*****课程归属到机构********接口======：,  **********************/
                url: /course/develop/coursebelong
                POST    //dept_ids为字符串化的数组 '[dept_id1,dept_id2]'
                参数： dept_ids, course_id = 'aaaaaaaa';
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:[{belong_id: ,course_id,dept_id  },  {belong_id: ,course_id,dept_id  }  ]
                }

        //*****删除归属机构的某个课程********接口======：,  **********************/
                url: /course/develop/delcoursebelong
                POST
                参数： belong_id = 'aaaaaaaa';
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













