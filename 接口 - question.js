

/** 试题组开发 ***/

    //***** 创建新的试题组 ********接口======：,  **********************/

         添加：  url: /question/develop/getexam
                POST
                参数： exam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                                info:{exam_id  , title  iscompleted }

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




         添加：  url: /question/develop/addexam
                POST
                参数： title
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{exam_id:'aaaaaaaa' }
                }


         更改：url: /question/develop/updateexam
                POST
                参数： title  exam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



         删除 url: /question/develop/delexam
                POST
                参数：  exam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


         发布 url: /question/develop/completedexam
                POST
                参数：  exam_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



    //***** 创建新的试题 ********接口======：,  **********************/
              
         添加：  url: /question/develop/addquestion
                POST
                参数： exam_id ='',  type='', '1':单选题， '2':多选题 , '3':问答题  '4'：填空
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{question_id:'aaaaaaaa' , options:[id1,id2]}
                }


         更改：url: /question/develop/updatequestion
                POST
                参数：  
                  必选       question_id='', 
                 非必选：     score ='分值', des='问题描述',   degree='', parse='问题解析'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



         删除 url: /question/develop/delquestion
                POST
                参数：   
                必选: question_id ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }




    //***** 创建试题的选项 ********接口======：,  **********************/
              
         添加：  url: /question/develop/addoption
                POST
                必选: question_id ='' ;
                非必选： answertxt='用于存储填空的答案'   ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{option_id:'aaaaaaaa' }
                }


         更改：url: /question/develop/updateoption
                POST
                参数：  
                  必选       option_id='', type='', 
                 非必选：    isanswer='0,1' des=''  answertxt='问题描述',  parse='选项解析'
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



         删除 url: /question/develop/deloption
                POST
                参数：   
                必选: option_id ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


         删除填空的选项 url: /question/develop/deloption_blank
                POST
                参数：   
                必选: question_id ;

                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }





设置选项答案   url: /question/develop/answerquestion
                POST
                参数：    //isanswer 用于 多选 ,  
                必选: question_id, myoption_id, type 
                isanswer='0,1', txt='' ;

                返回数据：
                {      
                        code:      or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }







/** 试题组开发 ***/

    //***** 创建新的试题组 ********接口======：,  **********************/






