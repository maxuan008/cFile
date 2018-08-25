

/** 试题组实例化--开始答题 ***/

    //***** 实例化一套试题组 ********接口======：,  **********************/

         添加：  url: /question/study/getmyexam
                POST
                参数： myexam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                info:{ myexam_id, exam_id  , title  iscompleted }

                                questions:[
                                        {question_id1, exam_id,type ,score ,des, degree,parse ,
                                                options:[
                                                        {option_id1,exam_id,question_id,des,des,isanswer,answertxt,parse} ,
                                                         {option_id2,exam_id,question_id,des,des,isanswer,answertxt,parse}
                                                ]

                                        },
                                       {question_id2,exam_id,type,score ,des, degree,parse ,
                                                options:[
                                                        {option_id1,exam_id,question_id,des,des,isanswer,answertxt,parse} ,
                                                         {option_id2,exam_id,question_id,des,des,isanswer,answertxt,parse}
                                                ]
                                        }
                                ]
                         }
                }


     isselected     '0，1' 是否选为答案：用于单选和多选
     

         答题：  url: /question/study/answerquestion
                POST
                参数：
                必选: myquestion_id,  myoption_id ,  type  ;
                 type为'1,2'时, isselecte ： '0,1'   ; type为'3,4' : txt:'作答内容' ； 
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{exam_id:'aaaaaaaa' }
                }


         提交：url: /question/study/completedexam
                POST
                参数：   myexam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



         删除 url: /question/study/delexam
                POST
                参数：  exam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



       是否答题完成  url: /question/study/isexamover
                POST
                参数：  exam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{flag: false or true}
                }














