const express = require('express')
const Article = require('../models/Article');
const Tag = require('../models/Tag')
const Category = require('../models/Category')
const Moment = require('../models/Moment')
const About = require('../models/About')
const Token = require('../utils/token')
const router = express.Router()

// 定义统一返回格式
let reponseData;
router.use((req,res,next)=>{
    reponseData = {
        data: {},
        meta: {
          msg: '',
          status: 200
        }
    }
    next()   
});

//添加文章
router.post('/add',(req,res,next)=>{
  const body = req.body
  const content = body.content
  body.words = content.replace(/\s/g,"").length
  body.readTime = Math.ceil(body.words/300)
  console.log(body)

  console.log(req.headers.authorization)
  let data = Token.decrypt(req.headers.authorization)
  console.log(data)
  if(data.token){
    new Article(body).save(function (err, user) {
      if (err) {
        reponseData.meta.msg = 'err'
        res.status(200).json(reponseData)
      }
      reponseData.meta.msg = 'success'
      res.status(200).json(reponseData)
    })
  }  
})

//查询文章
router.get('/articles',async (req,res,next)=>{
  //查询参数
  const query = req.query.query
  //当前页码
  let pagenum = req.query.pagenum
  //每页显示条数
  const pagesize = req.query.pagesize

  console.log(query,pagenum,pagesize)

  console.log(req.headers.authorization)
  
  Article.countDocuments({}, function (err, count) {
    console.log('there are %d jungle adventures', count)
    //总页数
    const pages = Math.ceil( count/pagesize )
    //当前页码
    pagenum = Math.min( pagenum, pages )

    pagenum = Math.max( pagenum, 1 )
    //跳过页数
    const skip = (pagenum-1)*pagesize

    console.log(pages,pagenum,skip)

    
    
    Article.find({},{},{sort:{'_id':-1}}).limit( + pagesize ).skip( skip ).then((articles)=>{
      reponseData.data = {
        articles,
        totalpage:count,
        pagenum
      }  
      res.status(200).json(reponseData)
    }) 
  })

  // if(query){
  //   let regex = new RegExp(query,'i')
  //   Article.find({'title':regex})
  // }

  // res.status(200).json(reponseData)
})

//删除文章
router.delete('/articles',(req,res,next)=>{
  const query = req.query
  console.log(query) 

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    Article.remove({
      _id: query.id
    }, function(err, ret) {
      if (err) {
        console.log('删除失败');
      } else {
        console.log('删除成功');
        reponseData.meta.msg = 'success'
        res.status(200).json(reponseData)
      }
    })
  }  
})

//根据id获得文章
router.get('/article',(req,res,next) => {
  const query = req.query
  console.log(query)
  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    Article.find({ 
      _id : query.id 
    }, function(err,ret){
      if(err){
        console.log('查询失败');
      }else{
        console.log(ret);
        reponseData.data = ret[0]
        res.status(200).json(reponseData)
      }
    });
  }
})

//根据id编辑文章
router.put('/edit',(req,res,next) => {
  const query = req.query
  const body = req.body
  const contentTemplate = body.contentTemplate
  const descriptionTemplate = body.descriptionTemplate
  const words = contentTemplate.replace(/\s/g,"").length
  const readTime = Math.ceil(words/300)
  const newTime = Date.now()
  console.log(query,body)

  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    Article.findByIdAndUpdate(query.id, {
      title: body.title,
      description: body.description,
      content: body.content,
      category: body.category,
      tag: body.tag,
      updateTime: newTime,
      words,
      readTime,
      contentTemplate,
      descriptionTemplate
    }, function(err, ret) {
      if (err) {
        reponseData.meta.status = 303
        reponseData.meta.msg = 'error'
        console.log('更新失败');
        res.status(200).json(reponseData)
      } else {
        console.log(ret);
        reponseData.meta.msg = 'success'
        console.log('更新成功');
        res.status(200).json(reponseData)
      }
    });
  }
})

//添加分类
router.post('/categoryadd',(req,res,next)=>{
  const body = req.body
 

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    new Category(body).save(function (err, tag) {
      if (err) {
        reponseData.meta.status = 303
        reponseData.meta.msg = 'err'
        res.status(200).json(reponseData)
      }
      // console.log('-')
      reponseData.meta.msg = 'success'
      res.status(200).json(reponseData)
    })
  }
})

//根据id编辑分类
router.put('/categoryedit',(req,res,next)=>{
  const body = req.body
  const query = req.query

  //为了存储根据id查询到的分类名称
  var obj = null

  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    //查询修改前的分类名称
    Category.find({_id:query.id}
    , function(err, ret) {
      if (err) {
        console.log('查询失败');
      } else {
        obj = ret
        // console.log("OOOO")
        // console.log(ret,'1')
        
        //根据id修改分类名称
        Category.findByIdAndUpdate(query.id, {
          name: body.name,
        }, function(err, ret) {
          //修改出差，发送错误信息
          if (err) {
            reponseData.meta.status = 303
            reponseData.meta.msg = 'error'
            console.log('更新失败');
            res.status(200).json(reponseData)
          } else {
            //分类修改成功，将博客带有旧分类的替换成新分类
            Article.updateMany({category:obj[0].name},  
              {category:body.name}, function (err, docs) { 
              if (err){ 
                  console.log(err) 
              } 
              else{ 
                  console.log("Updated Docs:", docs); 
              } 
            })
            //最后发送成功信息
            reponseData.meta.msg = 'success'
            console.log('更新成功');
            res.status(200).json(reponseData)
          }
        });
      }
    });
  }
  
})

//根据id删除分类
router.delete('/categorydelete',(req,res,next)=>{
  const query = req.query
  console.log(query)
  //obj为了储存根据id查询的分类名称
  var obj = null

  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    //获取被删除分类的名字
    Category.find({_id:query.id}
    , function(err, ret) {
      if (err) {
        console.log('查询失败');
      } else {
        obj = ret
        //根据获取到分类名字查找带有该标签的博客数量
        Article.countDocuments({category:obj[0].name}, function (err, count) {
          console.log('有分类的有',count)
          //如果有博客带有该分类，不可删除
          if(count){
            reponseData.meta.status = 303
            console.log('删除失败');
            reponseData.meta.msg = '有博客带有该分类，不可删除'
            res.status(200).json(reponseData)
          }else{
            //如果有博客不带有该分类，可删除
            Category.remove({
              _id: query.id
            }, function(err, ret) {
              if (err) {
                reponseData.meta.status = 303
                console.log('删除失败');
                reponseData.meta.msg = 'error'
                res.status(200).json(reponseData)
              } else {
                console.log('删除成功');
                reponseData.meta.msg = 'success'
                res.status(200).json(reponseData)
              }
            })
          }
        })
      }
    })
  }

  
})

//添加标签
router.post('/tagadd',(req,res,next)=>{
  const body = req.body
  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    new Tag(body).save(function (err, tag) {
      if (err) {
        reponseData.meta.msg = 'err'
        res.status(200).json(reponseData)
      }
      console.log('-')
      reponseData.meta.msg = 'success'
      res.status(200).json(reponseData)
    })
  }
})

//根据id删除标签
router.delete('/tagdelete',(req,res,next)=>{
  const query = req.query
  console.log(query)
  //obj为了储存根据id查询的标签名称
  var obj = null

 

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    //获取被删除标签的名字
    Tag.find({_id:query.id}
    , function(err, ret) {
      if (err) {
        console.log('查询失败');
      } else {
        obj = ret
        const regex = new RegExp(obj[0].name,'i')
        //根据获取到标签名字查找带有该标签的博客数量
        Article.countDocuments({tag:regex}, function (err, count) {
          console.log('有标签的有',count)
          //如果有博客带有该标签，不可删除
          if(count){
            reponseData.meta.status = 303
            console.log('删除失败');
            reponseData.meta.msg = '有博客带有该标签，不可删除'
            res.status(200).json(reponseData)
          }else{
            //如果有博客不带有该标签，可删除
            Tag.remove({
              _id: query.id
            }, function(err, ret) {
              if (err) {
                reponseData.meta.status = 303
                console.log('删除失败');
                reponseData.meta.msg = 'error'
                res.status(200).json(reponseData)
              } else {
                console.log('删除成功');
                reponseData.meta.msg = 'success'
                res.status(200).json(reponseData)
              }
            })
          }
        })
      }
    })
  }
})

//根据id编辑标签
router.put('/tagedit',(req,res,next)=>{
  const body = req.body
  const query = req.query

  //为了存储根据id查询到的分类名称
  var obj = null

  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    //查询修改前的分类名称
    Tag.find({_id:query.id}
    , function(err, ret) {
      if (err) {
        console.log('查询失败');
      } else {
        obj = ret
        const regex = new RegExp(obj[0].name,'i')
        // console.log("OOOO")
        // console.log(ret,'1')
        
        //根据id修改分类名称
        Tag.findByIdAndUpdate(query.id, {
          name: body.name,
        }, function(err, ret) {
          //修改出差，发送错误信息
          if (err) {
            reponseData.meta.status = 303
            reponseData.meta.msg = 'error'
            console.log('更新失败');
            res.status(200).json(reponseData)
          } else {
            //标签修改成功，将博客带有旧标签的替换成新标签
            //先查找出所有带旧标签的博客
            Article.find({tag:regex}).then((blogs)=>{
              // console.log(blogs)
              //保存需要修改的博客id
              let ids = []
              //保存修改完的博客tag参数
              let arrs = []
              let temp = ''
              const num = blogs.length
              blogs.map((item) => {
                ids.push(item._id)
                temp = item.tag
                //regex带有旧标签的正则表达式,body.name是修改后的标签
                temp = temp.replace(regex,body.name)
                arrs.push(temp)
              })
              //根据ids数组中的id修改博客的tag属性
              for(let i = 0; i < num; i++){
                Article.findByIdAndUpdate(ids[i], {
                  tag: arrs[i],
                }, function(err, ret) {
                  //修改出差，发送错误信息
                  if (err) {
                    console.log("---------------")
                  } else {
                    console.log("+++++++++++++++")
                  }
                });
              }
            }) 
            //最后发送成功信息
            reponseData.meta.msg = 'success'
            console.log('更新成功');
            res.status(200).json(reponseData)
          }
        });
      }
    });
  }
})

//添加动态
router.post('/momentadd',(req,res,next)=>{
  const body = req.body
  console.log(body)

  console.log(req.headers.authorization)
  let data = Token.decrypt(req.headers.authorization)
  console.log(data)
  if(data.token){
    new Moment(body).save(function (err, data) {
      if (err) {
        reponseData.meta.msg = 'err'
        res.status(200).json(reponseData)
      }
      reponseData.meta.msg = 'success'
      res.status(200).json(reponseData)
    })
  }  
})

//删除动态
router.delete('/momentdelete',(req,res,next)=>{
  const query = req.query
  console.log(query) 

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    Moment.remove({
      _id: query.id
    }, function(err, ret) {
      if (err) {
        console.log('删除失败');
      } else {
        console.log('删除成功');
        reponseData.meta.msg = 'success'
        res.status(200).json(reponseData)
      }
    })
  }  
})

//根据id获得动态
router.get('/moment',(req,res,next) => {
  const query = req.query
  console.log(query)
  

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    Moment.find({ 
      _id : query.id 
    }, function(err,ret){
      if(err){
        console.log('查询失败');
      }else{
        console.log(ret);
        reponseData.data = ret[0]
        res.status(200).json(reponseData)
      }
    });
  }
})

//根据id编辑动态
router.put('/momentedit',(req,res,next) => {
  const query = req.query
  const body = req.body
  
  const newTime = Date.now()
  console.log(query,body)

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    Moment.findByIdAndUpdate(query.id, {
      content: body.content,
      contentTemplate: body.contentTemplate,
      updateTime: newTime
    },function(err, ret) {
      if (err) {
        reponseData.meta.status = 303
        reponseData.meta.msg = 'error'
        console.log('更新失败');
        res.status(200).json(reponseData)
      } else {
        console.log(ret);
        reponseData.meta.msg = 'success'
        console.log('更新成功');
        res.status(200).json(reponseData)
      }
    });
  }
})

//根据id编辑关于我页面
router.put('/aboutedit',(req,res,next) => {
  const query = req.query
  const body = req.body
  const newTime = Date.now()

  let data = Token.decrypt(req.headers.authorization)
  if(data.token){
    About.findByIdAndUpdate(query.id, {
      content: body.content,
      contentTemplate: body.contentTemplate,
      updateTime: newTime
    },{new:true}, function(err, ret) {
      if (err) {
        reponseData.meta.status = 303
        reponseData.meta.msg = 'error'
        console.log('更新失败');
        res.status(200).json(reponseData)
      } else {
        console.log(ret);
        reponseData.meta.msg = 'success'
        reponseData.data = ret
        console.log('更新成功');
        res.status(200).json(reponseData)
      }
    });
  }
})


module.exports = router