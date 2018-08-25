 

/** 多人课程学习 ***/


    //***** 多人课程学习 ********接口======：,  **********************/
 
//    orguserid: 组织者
//    orgtitle : 组织标题语
//    deptid:    发布的机构（此机构下的学生才能看到此课程组织活动）
//    least:     参与人数最少数量
//    most:      参与人数最多数量
//    isstart:   是否开始学习   DEFAULT '0'   comment '0:未开始， 1：学习中  2：学习完成',
    
//    ing_step_id: 正在进行中步骤的模板ID   ,  “-1”为没有开始学习
//    ing_study_step_id:  正在进行中的步骤  ,  “-1”为没有开始学习

// 1.获取聊天记录。
          ：  url: /study/many/getTalkingHistory
                POST
                参数： starttime  ,  endtime , study_log_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:[
                        {study_log_id, user_id,  account, fullname , txt , sendTime },
                        {study_log_id, user_id,  account, fullname , txt , sendTime },
                        {study_log_id, user_id,  account, fullname , txt , sendTime }

                        ] 
                }



  // 1.多人课程学习的组织。
         开始学习 ：  url: /study/many/orgcourse_many
                POST
                参数： course_child_id ='' , orgtitle ,  deptid  ,least  ,most
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{      :'aaaaaaaa' }
                }


  // 2.多人课程学习--获取正在学习中的信息。
         开始学习 ：  url: /study/many/getlearning_many
                POST
                参数： study_log_id =''
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功，202：课程全队学完了， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{   
                            flag: '0' , '1' ,'2', '3'       //0：角色未选定， 1:角色已选定,但有其它学员未选定。 2:全员角色已定，学习中.  3:全员角色已定，学习也完成，单有其它队员未完成。 
                            is_over:'1'
                            users:[{user_id1:,fullname: },{user_id2 ，fullname: }] ,
                            roles:[]         
                            step_id:'',
                                                     //如果状态为0，1 ， 前端触发socket事件： “getroles”
                            info: {
                                

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
                                        
                                },
                                study_step_info:{
                                    files:[
                                            {study_step_file_id, study_step_id：,step_id, filename ,  filetype} ,
                                            {study_step_file_id, study_step_id：,step_id, filename ,  filetype}
                                    ]    
                                },
                                
                                flow:[{study_task_id:'', task_id:'', study_step_id:'', step_id:'' }]

                            }   


                        }
                }





 // 2.获取学习任务的历史信息。
         开始学习 ：  url: /study/many/gettaskhistory
                POST
                参数： task_id,  study_log_id =''
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功，202：课程全队学完了， 204：返回错误， 205：session未通过
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
                                }   

                                study_step_info：{

                                }
                            }   
                       
                }




 // 2.获取多人课程学习任务的历史信息：老师查看学生历史信息用。
         开始学习 ：  url: /study/many/gettaskhistory_v2 
                POST
                参数： step_id='',  study_log_id ='' , user_id=''
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功，202：课程全队学完了， 204：返回错误， 205：session未通过
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
                                }   

                                study_step_info：{

                                }
                            }   
                       
                }









//=====大厅相关事件==//
   事件一： 获取大厅数据:  getHall
            传输参数：{course_child_id:11111}
            
        触发返回前端： 
            1.单独返回事件, getHall_result
                返回数据：
                {      
                        code: 201 or 204,   205 , 206,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                study_log_id1:  {isStart:'0':未开始,'1':已开始, orgtitle: , least:, most: , users:[ user_id1:{username: ,fullname:'' ,  email:'',headpngpath:''} ,user_id2:{username: ,fullname:'' ,  email:'',headpngpath:''} ] },
                                study_log_id2:  {isStart:'1':未开始,'1':已开始, orgtitle: , least:, most: , users:[ user_id1:{username: ,fullname:'' ,  email:'',headpngpath:''} ,user_id2:{username: ,fullname:'' ,  email:'',headpngpath:''}  ] }

                        }
                }

   事件二： 获取房间数据:  getRoom
            传输参数：{study_log_id:11111}
            
        触发返回前端： 
            1.单独返回事件, getRoom_result
                返回数据：
                {      
                        code: 201 or 204,   205 , 206,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas: [{ isAgree:'0'或'1', user_id1: ,username: ,fullname:'' ,  email:'',headpngpath:''} , { isAgree:'0'或'1', user_id2: ,username: ,fullname:'' ,  email:'',headpngpath:''} ] 
                        
                }




//------//











 

//========  组队 : 多人课程 Socket事件

 1. 占位： join
    传输参数：{course_child_id:'333' ,study_log_id:11111}
    
    触发返回前端： 
                
                1.单独返回事件, join_result
                返回数据：
                {      
                        code: 201 or 203 , 204,   205 , 206,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                }

                2.广播返回事件, broadcast_room_users
                返回占位人员基本信息：
                {
                    {user_id1: {isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'' , headpngpath:'' }, user_id2: {isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'',headpngpath:'' },   }
                }

                3.广播到大厅返回事件, broadcast_hall_user
                返回占位人员基本信息：
                {
   
                  {study_log_id:‘’  , flag:'1'加入, userinfo:{user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:''} }
                }




2. 退出： quit
    传输参数：{study_log_id:11111}
    
    触发返回前端： 
                
                1.单独返回事件, quit_result
                返回数据：
                {      
                        code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                }

                2.广播房间事件, broadcast_room_users
                返回占位人员基本信息：
                {
                    {user_id1:{isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:'' } , user_id2:{isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:'' }  
                }

                3.广播到大厅返回事件, broadcast_hall_user 
                返回占位人员基本信息：
                {
   
                  {study_log_id:‘’  , flag:'0'退出, userinfo:{user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:''} }
                }





  3.同意：agree
      传输参数: {study_log_id:11111}

                1.单独返回事件, agree_result
                返回数据：
                {      
                        code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                }

                2.广播房间事件, broadcast_room_users
                返回占位人员基本信息：
                {
                    {user_id1:{isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:'' } , user_id2:{isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:'' }  
                }



  不同意： disagree
      传输参数: {study_log_id:11111}

                1.单独返回事件, disagree_result
                返回数据：
                {      
                        code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                }


                2.广播房间事件, broadcast_room_users
                返回占位人员基本信息：
                {
                    {user_id1:{isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'', headpngpath:'' } , user_id2:{isAgree:'0' or '1' , user_id:'', account:'' , fullname: '' , image_url:'' , headpngpath:''}  
                }






  4.开始：begin     // 由组长触发 ;  客户端接受到广播信息后，发送开始学习请求
      传输参数：{study_log_id:11111}

                1.单独返回事件, begin_result
                返回数据：
                {      
                        code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                        err:'',
                        datas:
                }

                2.广播返回事件, next_broadcast
                触发全组开始学习：
                {
                        code: 201 or 204,   205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                            flag: '0' , '1' ,'2', '3'       //0：角色未选定， 1:角色已选定,但有其它学员未选定。 2:全员角色已定，学习中.  3:全员角色已定，学习也完成，单有其它队员未完成。 4.此次组织全部完成
                            users:[{user_id1:,fullname: },{user_id2 ，fullname: }] ,
                            roles:[{}，{}]，
                            step_info：{}，
                            active_info:{}  

                              
                                                            //如果状态为0，1 ， 前端触发socket事件： “getroles”
                            info: {
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
                                        
                                },

                                step_info:{

                                }   
                        }
                          
                }
    




//======组队房间结束====



//=======角色分配房间 ====

5.  获取角色： getroles 
        传输参数：{study_log_id:11111 ， step_id:'' }
        1.单独返回事件： getroles_result
        返回数据:
        {
                code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                err:'',
                datas: {
                        roles: {
                                task_id1:{ rolename:'11'}
                                task_id2:{ rolename:'11'}
                               } ,
                        users: {
                                user_id1:{fullname:""}
                                task_id2:{ fullname:"" ,socketid:'11' , }
                                task_id3:{ fullname:"" , socketid:'11' , task_id:'', rolename:'' , headpngpath:''}
                               }
                }
        }


        2.广播返回事件：  roles_broadcast
        返回数据:
        {
             datas: {
                        task_id1: {
                                rolename: '',
                                userinfo:{user_id:'111' , account:'', fullname:'张三'   }
                        } ,
                        
                        task_id2: {
                                rolename: '',
                                userinfo:{user_id:'222' , account:'', fullname:'李四'   }
                        }
                }      
        }


6.选定角色： choose_role
        传输参数：{study_log_id:11111 ， step_id:'' , task_id:'' }
        
        1.错误触发事件： choose_role_result
        返回数据：{
                code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                err:'',   
        }

        2.广播返回事件： roles_broadcast
        {
                 datas: {

                        
                        task_id1: {
                                rolename: '',
                                userinfo:{user_id:'111' , account:'', fullname:'张三' , headpngpath:''  }
                        } ,
                        
                        task_id2: {
                                rolename: '',
                                userinfo:{user_id:'222' , account:'', fullname:'李四' , headpngpath:''   }
                        }
                }    
        }

         8.广播返回 角色分配完成： roles_over
         {
                code:'201'
                datas:{user_id1：{}， user_id2:{}}
         }



7.取消角色： cancel_role
        传输参数：{study_log_id:11111 ， step_id:'' , task_id:'' }
        
        1.错误触发事件： cancel_role_result
        返回数据：{
                code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                err:'',   
        }

        2.广播返回事件：roles_broadcast
        {
                 datas: {
                        task_id1: {
                                rolename: '',
                                userinfo:{user_id:'111' , account:'', fullname:'张三'  , headpngpath:'' }
                        } ,
                        
                        task_id2: {
                                rolename: '',
                                userinfo:{user_id:'222' , account:'', fullname:'李四' , headpngpath:''  }
                        }
                }    
        }

   


//=======角色房间  结束 ====














//====学习房间



8. 进入学习房间： learn_join
        传输参数：{study_log_id:11111 ， step_id:''  }
        1.错误触发事件： learn_join_result
        返回数据：{
                code: 201 or 203 , 204,   205, 206  //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过 ，206:不能重复登入
                err:'',   
        }

        2.广播返回学习房间事件： learn_broadcast   //学员未学完的情况
        {
                 users: {
                         user_id1:{
                                 task_id:{

                                 }
                                 status:'0','1';  //学完与未学完
                         }
                        
                }   

              
        }
        

9. 学完了： learn_finished
        传输参数：{study_log_id:11111 ， step_id:'' ,study_task_id:'' }
        1.错误触发事件： learn_finished_result
        返回数据：{
                code: 201 or 203 , 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过
                err:'',   
        }
       
        2.广播返回学习房间事件： learn_broadcast   //学员未学完的情况
        {
                 users: {
                         user_id1:{
                                 task:{
                                        task_id:'',
                                 }
                                 status:'0','1';  //学完与未学完
                                 user_id：‘’，
                                 fullname：‘’，
                                 account：‘’

                                 socketid''
                        
                        }
                        
                }    
        }
        
       
        3.广播返回事件,  next_broadcast
        触发全组开始学习：
        {
                code: 201 or 204,   205,   //201:返回成功， 204：返回错误， 205：session未通过
                err:'',
                datas:{
                        flag: '0' , '1' ,'2', '3' ，’4‘      //0：角色未选定， 1:角色已选定,但有其它学员未选定。 2:全员角色已定，学习中.  3:全员角色已定，学习也完成，单有其它队员未完成。 4.此次组织全部完成
                        users:[{user_id1:,fullname: },{user_id2 ，fullname: }] ,
                        roles:[{}，{}]，
                        step_info ：{}，
                        //active_info:{}  

                        
                         //如果状态为0，1 ， 前端触发socket事件： “getroles”
                        info: {
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
                                        
                                },

                                step_info:{

                                }   
                       }
                        
        }


//====学习房间结束===//




//---------聊天大厅-------------//


进入聊天大厅：  talking_join 

                传输参数：{study_log_id:11111 }
            1.单独返回当天聊天记录： join_talking_result
        {
                code: 201 or 204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过 ，206:不能重复登入
                datas:[
                        {study_log_id, user_id,  account, fullname , txt , sendTime },
                        {study_log_id, user_id,  account, fullname , txt , sendTime },
                        {study_log_id, user_id,  account, fullname , txt , sendTime }

                ] 
              
        }





发送消息：   talking_sendinfo
         传输参数：{study_log_id:11111 , txt:'' }

            1.单独返回传输结果： talking_sendinfo_result
        {
                code:  204,   205,   //201:返回成功，203:此用户已经占位, 204：返回错误， 205：session未通过 ，206:不能重复登入
                err:
              
        }

            2.广播返回聊天房间事件： talking_broadcast   //学员未学完的情况
        {

                datas: {study_log_id, user_id,  account, fullname , txt , sendDate, sendTime }
              
        }


//---------聊天大厅--END-------//












    //************************************************************************************/






 






