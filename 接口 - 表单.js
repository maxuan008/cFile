
//--- 表单编辑

     添加：  url: /form/develop/addform
                POST
                参数：       'html代码'
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{html_id:'aaaaaaaa' }
                }

     查询：  url: /form/develop/getform
                POST
                参数： html_id 
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{code:'' }
                }


         更改：url: /form/develop/updateform
                POST
                参数： code  html_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }



         删除 url: /form/develop/delexam
                POST
                参数：  html_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


         发布 url: /form/develop/completedform
                POST
                参数：  html_id
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }

//--- 表单项编辑

     添加：  url: /form/develop/addformele
                POST
                参数：
                必选: html_id,  name ,  type  ;
                非必选：value , title  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{html_ele_id:'aaaaaaaa' }
                }



     添加数组类型：  url: /form/develop/addformeles
                POST
                参数：
                必选:eles: [{html_id,  name ,  type ,title, value } , { html_id,  name ,  type ,title, value }]  ;
                非必选：
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{html_ele_id:'aaaaaaaa' }
                }




     查询表单下的表单项： 
          url: /form/develop/getformeles
                POST      
                参数： html_id 
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 sor 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:[{ name ,  type , value , title} ,{ name ,  type , value , title} ]
                }                



         更改：url: /form/develop/updateformele
                POST
                参数： 
                必选: html_ele_id ;
                非必选： name ,  type , value , title    ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


         更改：url: /form/develop/updateformele_v2
                POST
                参数： 
                必选: html_id , name ;
                非必选： name ,  type , value , title    ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


         删除 url: /form/develop/delexamele_v2
                POST
                参数：  
                必选:   html_id , name;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }


         删除 url: /form/develop/delexamele
                POST
                参数：  
                必选:  html_ele_id;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }
 


 
//---表单实例化



     查询实例化了的表单：  url: /form/study/getstudyform
                POST
                参数： study_html_id 
                必选:  ;
                非必选：  ;
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                        datas:{
                            forminfo:{
                               html_id:'',
                               code:''
                            } ,

                            eles:[
                                {name:'', sid:'' , type:'' , value:'' , title:'' },
                                {name:'', sid:'' , type:'' , value:'' , title:'' },
                                {name:'', sid:'' , type:'' , value:'' , title:'' }
                            ]
                        }

                }



         更改：url: /form/study/updatestudyformele
                POST
                参数： 
                必选: study_html_ele_id ,  value  ;
                
                返回数据：
                {      
                        code: 201 or 204,205,   //201:返回成功， 204：返回错误， 205：session未通过
                        err:'',
                }









