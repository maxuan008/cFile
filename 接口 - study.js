
/*** 学习历史记录 */
         获取一个情景下指定机构的所有学生的历史数据 ：  url: /study/search/getdeptusershistory
                POST
                参数： course_child_id ='' , dept_id=''
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                type: '0单人' , '1多人',
                                
                                info:{pngpath:'' , title:'',des:''  },
                                users:[{ userinfo:{} , study_log_id:'', over_time:'' }]  //用于单人
                                teams:[  //用于多人
                                        {teaminfo:{orgtitle : 组织标题语,least:'' , most:'' } , users:[{ userinfo:{} , study_log_id:'', over_time:'' } , { userinfo:{} , study_log_id:'', over_time:'' }]  },
                                       {teaminfo:{orgtitle : 组织标题语,least:'' , most:'' } , users:[{ userinfo:{} , study_log_id:'', over_time:'' } , { userinfo:{} , study_log_id:'', over_time:'' }]  },
                                ]  
                        
                        }
                }










/** 单人课程学习 ***/


    //*****单人课程学习 ********接口======：,  **********************/
   // 1.生成一个学生的学习记录：基础信息，不含正在进行的学习任务。
         开始学习 ：  url: /study/single/beginlearining  
                POST
                参数： course_child_id =''
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{study_log_id:'aaaaaaaa' }
                }



    //1.如果是刚开始学习，创建首个学习任务，并更新到学习记录：正在进行的学习任务,学习流
    //2.通过学习记录中正在学习任务，获取学习任务的全部信息：1.任务模板中的描述，理论,输出模板及文件信息......; 2.学习任务的基本信息，产出文件信息。

         获取正在学习的任务 url: /study/single/getingstudytask
                POST
                参数：   
                必选: study_log_id='' ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{ 
                           task_info:{  //任务模板，老师编辑的
                                info:{任务信息集合}，
                                eles：{
                                   des:{ele_id1:{   results:[{结果文档数据}] }, ele_id2:{   results:[{结果文档数据}] }  },
                                   task_result:{  ele_id1:{   results:[{结果文档数据}] }, ele_id2:{   results:[{结果文档数据}] }   } ,
                                   theory:{ ele_id1:{   results:[{结果文档数据}] }, ele_id2:{   results:[{结果文档数据}] } }     
                                }
                           }  ,

                           study_info:{ //学生学习任务的输出结果
                                info:{学习任务集合},
                                results:[{result_id1:  ,,,  file:{输出的文件信息} } ,{result_id2:,,,  file:{输出的文件信息} }     ]
                           }    ,

                           course_child_info:{
                                   
                           }


                         }
                }





    //1.获取下一个任务的模板数据。  2.创建新的学习任务。 3.更新本学习任务的相关数据。  4.更新学习记录的相关信息：正在进行的学习任务，最近的学习任务,学习流。
         完成学习的任务 url: /study/single/completestudytask
                POST
                参数：   
                必选: study_task_id ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{  //情境全部学完，返回 {is_over:'1'}
                           task_info:{  //任务模板，老师编辑的
                                任务信息集合，
                                eles：{
                                   des:{ele_id1:{   results:[{结果文档数据}] }, ele_id2:{   results:[{结果文档数据}] }  },
                                   task_result:{  ele_id1:{   results:[{结果文档数据}] }, ele_id2:{   results:[{结果文档数据}] }   } ,
                                   theory:{ ele_id1:{   results:[{结果文档数据}] }, ele_id2:{   results:[{结果文档数据}] } }     
                                }
                           }  ,

                           study_info:{ //学生学习任务的输出结果
                                info:{学习任务集合},
                                results:[{result_id1:,,,  file:{输出的文件信息} } ,{result_id2:,,,  file:{输出的文件信息} }     ]
                           }    

                         }           
                }






    //更新学习结果中的富文本
         完成学习的任务 url: /study/single/updatestudyresult
                POST
                参数：   
                必选: study_result_id='00000' ,
                txt='aa'
            
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:''
       
                }







        // 获取工作流程链条:  url: /study/single/getworkflownodes
                POST
                参数：  
                  必选       study_log_id='aaaaaaaa', 
                 非必选：   
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:[
                                {
                                  info:{}
                                  steps:{
                                     {info:{},
                                      tasks:[]
                            }     
                                  }  ,

                                                                  {
                                  info:{}
                                  steps:{
                                          
                                  } 
                        ]


                }


    //******************************************************************/
         



        //*****将office后台的文件下载到对应的课程设计的文件中********接口======：,  **********************/
                url: /study/single/downloadOfficeFile_study
                get
                参数： id = 'ddddddd', url='http://192.168.1.106/cache/files/6220996887776_8242/output.docx/999docx.docx?md5=F5Befv8b6L0B1x5eW4GLNw==&expires=1505360484&disposition=attachment&ooname=output.docx'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }










    //*************************学习的课程管理*****************************************/


        获取学习的课程 url: /study/search/getstudycourses
                POST
                参数：   type:  0:'未完成学习的课程'  ,  1：'已完成学习的课程' ;    
                必选: 

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:  [ 
                                        {
                                           study_log_id:  ,
                                           course_id ,
                                           course_child_id: ,

                                           title:
                                           period:
                                           des:
                                           workflow:
                                           target:
                                           content:
                                           keynote:
                                           task:
                                           for_use_people:
                                           teacher_introduction:
                                           tool:
                                           method:
                                           jobreq:
                                           pqs:

                                        } ,
                                        {

                                        }  
                                ] 
                }     
               
























    //************************************************************************************/










