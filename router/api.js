const express = require('express')
const User = require('../models/User')
const Article = require('../models/Article')
const Tag = require('../models/Tag')
const Category = require('../models/Category')
const Comment = require('../models/Comment')
const Visitor = require('../models/Visitor')
const Moment = require('../models/Moment')
const Token = require('../utils/token')
const About = require('../models/About')

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
    next();
});
//登录
router.post('/login',async (req, res, next) => {

  // 1. 获取表单数据
  // 2. 查询数据库用户名密码是否正确
  // 3. 发送响应数据
  const body = req.body

  const user = await User.findOne({
    username: body.username,
    password: body.password
  })
  // 如果邮箱和密码匹配，则 user 是查询到的用户对象，否则就是 null
  if(user){
    console.log(user)
    const token = Token.encrypt({username:user.username})
    
    
    // res.send(token)
    reponseData.data.token = token
    reponseData.meta.msg = 'success'

    res.status(200).json(reponseData)
  }else{
    
    reponseData.meta.msg = 'fail'
    reponseData.meta.status = 303

    res.status(200).json(reponseData)
  }
})

//查询博客列表
router.get('/blogs',async (req,res,next)=>{
  //查询参数
  const query = req.query.query
  //当前页码
  let pagenum = req.query.pagenum
  //每页显示条数
  const pagesize = req.query.pagesize
  //分类查询
  const category = req.query.category
  //小标签查询
  const tag = req.query.tag
  // console.log(req.query)

  //查询参数
  let obj = {}
  if(category){
    obj = {category}
  } 
  if(tag){
    const regex = new RegExp(tag,'i')
    obj.tag = regex
  }
  if(query){
    const regex = new RegExp(query,'i')
    obj.title = regex
  }
  // console.log(obj)

  // console.log(query,pagenum,pagesize)
    
  Article.countDocuments(obj, function (err, count) {
    // console.log('there are %d jungle adventures', count)
    //总页数
    const pages = Math.ceil( count/pagesize )
    //当前页码
    pagenum = Math.min( pagenum, pages )

    pagenum = Math.max( pagenum, 1 )
    //跳过页数
    const skip = (pagenum-1)*pagesize

    // console.log(pages,pagenum,skip)
       
    Article.find(obj,{},{sort:{'_id':-1}}).limit( + pagesize ).skip( skip ).then((blogs)=>{
      reponseData.data = {
        blogs,
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

//根据id获得文章
router.get('/blog',(req,res,next) => {
  const query = req.query
  console.log(query)

  Article.find({ 
    _id : query.id 
  }, function(err,ret){
    if(err){
      console.log('查询失败');
    }else{
      // 浏览数加1
      let data = ret[0].view + 1
      Article.findByIdAndUpdate(query.id,{view:data},{new:true},function(err,ret){
        if(err){
          console.log('查询失败');
        }else{
          console.log(ret);
          reponseData.data = ret
          res.status(200).json(reponseData)
        }
      })
    }
  });
})

//获取tag列表
router.get('/tag',async (req,res,next)=> {
  const tag = await Tag.find({},{"name":1})
  reponseData.data = tag
  reponseData.meta.msg = 'success'
  // console.log('请求tag')
  res.status(200).json(reponseData)
})

//获取category列表
router.get('/category',async (req,res,next)=> {
  const category = await Category.find({},{"name":1})
  reponseData.data = category
  reponseData.meta.msg = 'success'
  // console.log('请求tag')
  res.status(200).json(reponseData)
})

//获取归档博客列表
router.get('/archive',(req,res,next)=> {

  var formatData = function(data){
    var arr = [];
    data.forEach(function(item, i){
        var tmpDate = new Date(item.addTime);
        var month = tmpDate.getMonth() + 1;
        var year = tmpDate.getFullYear();
        var tmpMonth = tmpDate.getMonth() + 1;
        if(i === 0){
            var tmpObj = {};
            tmpObj.date = year + '年' + month + '月';
            tmpObj.data = [];
            tmpObj.data.push(item);
            arr.push(tmpObj);
        }else{
            if(arr[arr.length-1]['date'] === (year + '年' + month + '月')){
                arr[arr.length-1]['data'].push(item);
            }else{
                var tmpObj = {};
                tmpObj.date = year + '年' + month + '月';
                tmpObj.data = [];
                tmpObj.data.push(item);
                arr.push(tmpObj);
            }
        }
  
    });
    return arr;
  }

  Article.find({},{},{sort:{'_id':-1}},function(err, docs) { 
    let arr = formatData(docs)
    console.log(docs)
    reponseData.data.count = docs.length
    reponseData.data.map = arr
    reponseData.meta.msg = 'success'
    res.status(200).json(reponseData)
  });
})

//根据文章id获取评论
router.get('/comment',(req,res,next) => {
  const query = req.query

  Comment.find({data:query.id},{},{sort:{'_id':-1}}).populate([{path: 'data', select: 'title'},{path: 'from', select: 'nickname img'},{path: 'replay.from', select: 'nickname img'},{path: 'replay.to', select: 'nickname img'}]).exec().then((comments)=>{
    reponseData.data = comments
    reponseData.meta.msg = "查询评论成功"
    res.status(200).json(reponseData)
  })   
})

//添加评论
router.post('/addcomment',(req,res,next) => {
  const body = req.body
  const query = req.query
  let img = body.img || 'http://127.0.0.1:2020/public/1.jpg'
  console.log(query)
  console.log(body)

  Visitor.find({email:body.email},function(err,ret){
    if(err){
      console.log('查询失败');
    }else{
      console.log(ret);
      //游客没有评论记录
      if(ret.length === 0){
        new Visitor({
          nickname:body.nickname,
          email:body.email,
          img
        }).save(function (err, from) {
      
          console.log(from)
          //如果传了评论的id就是回复评论
          if(query.id !== '-1'){
            //找到带有id的评论,拿到回复数组replay，向数组添加最新回复
            Comment.findOne({_id:query.id},function(err, ret) {
              if (err) {
                reponseData.meta.status = 303
                reponseData.meta.msg = 'error'
                console.log('查询失败');
                res.status(200).json(reponseData)
              } else {
                console.log(ret);
                //保存回复数组replay
                let replay = ret.replay
                //replay添加最新的回复
                replay.push({from:from._id,to:body.to,content:body.content})
      
                //更新数组replay
                Comment.findByIdAndUpdate({_id:query.id},{replay},function(err, ret) {
                  if (err) {
                    reponseData.meta.status = 303
                    reponseData.meta.msg = 'error'
                    console.log('查询失败');
                    res.status(200).json(reponseData)
                  } else {
                    reponseData.data = ret
                    reponseData.meta.msg = 'success'
                    console.log('查询成功');
                    res.status(200).json(reponseData)
                  }
                })       
              }
            })
          // 没传评论id就是普通评论  
          }else{
            new Comment({
              data:body.blogId,
              from:from._id,
              content:body.content,
            }).save(function (err, ret) {
              if (err) {
                reponseData.meta.msg = 'err'
                res.status(200).json(reponseData)
              }
              reponseData.meta.msg = 'success'
              res.status(200).json(reponseData)
            })
          }
        })
      }else{

        //游客曾经评论过，保存游客最新的信息
        Visitor.findByIdAndUpdate(ret[0]._id, {
          nickname:body.nickname,
          img
        }, function(err, from) {
          console.log('游客曾经评论过')

          console.log(from)
          const time = Date.now()
          console.log(from)
          //如果传了评论的id就是回复评论
          if(query.id !== '-1'){
            //找到带有id的评论,拿到回复数组replay，向数组添加最新回复
            Comment.findOne({_id:query.id},function(err, ret) {
              if (err) {
                reponseData.meta.status = 303
                reponseData.meta.msg = 'error'
                console.log('查询失败');
                res.status(200).json(reponseData)
              } else {
                console.log(ret);
                //保存回复数组replay
                let replay = ret.replay
                //replay添加最新的回复
                replay.push({from:from._id,to:body.to,content:body.content})
      
                //更新数组replay
                Comment.findByIdAndUpdate({_id:query.id},{replay},function(err, ret) {
                  if (err) {
                    reponseData.meta.status = 303
                    reponseData.meta.msg = 'error'
                    console.log('查询失败');
                    res.status(200).json(reponseData)
                  } else {
                    reponseData.data = ret
                    reponseData.meta.msg = 'success'
                    console.log('查询成功');
                    res.status(200).json(reponseData)
                  }
                })       
              }
            })
          // 没传评论id就是普通评论  
          }else{
            new Comment({
              data:body.blogId,
              from:from._id,
              content:body.content,
            }).save(function (err, ret) {
              if (err) {
                reponseData.meta.msg = 'err'
                res.status(200).json(reponseData)
              }
              reponseData.meta.msg = 'success'
              res.status(200).json(reponseData)
            })
          }
        })
      }
    }
  })
})

//添加visitor
router.post('/visitor',(req,res,next) => {
  const body = req.body
  new Visitor(body).save(function (err, ret) {
    if (err) {
      reponseData.meta.msg = 'err'
      res.status(200).json(reponseData)
    }
    console.log(ret)
    reponseData.meta.msg = 'success'
    res.status(200).json(reponseData)
  })
})

//查询动态
router.get('/moments',(req,res,next) => {
  //查询参数
  const query = req.query.query
  //当前页码
  let pagenum = req.query.pagenum
  //每页显示条数
  const pagesize = req.query.pagesize

  console.log(query,pagenum,pagesize)

  console.log(req.headers.authorization)
  
  Moment.countDocuments({}, function (err, count) {
    console.log('there are %d jungle adventures', count)
    //总页数
    const pages = Math.ceil( count/pagesize )
    //当前页码
    pagenum = Math.min( pagenum, pages )

    pagenum = Math.max( pagenum, 1 )
    //跳过页数
    const skip = (pagenum-1)*pagesize

    console.log(pages,pagenum,skip)

    
    
    Moment.find({},{},{sort:{'_id':-1}}).limit( + pagesize ).skip( skip ).then((moments)=>{
      reponseData.data = {
        moments,
        totalpage:count,
        pagenum
      }  
      res.status(200).json(reponseData)
    }) 
  })
})

//点赞动态
router.post('/like',(req,res,next) => {
    //点赞参数
    const query = req.query
    Moment.find({ 
      _id : query.id 
    }, function(err,ret){
      if(err){
        console.log('查询失败');
      }else{
        // 点赞数加1
        let data = ret[0].likes + 1
        Moment.findByIdAndUpdate(query.id,{likes:data},function(err,ret){
          if(err){
            console.log('查询失败');
          }else{
            console.log(ret);
            reponseData.data = ret
            res.status(200).json(reponseData)
          }
        })
      }
    });
})

//收索查询博客列表
router.get('/querysearch',(req,res,next)=>{
  //查询参数
  const query = req.query.query

  //查询参数
  let obj = {}

  if(query){
    const regex = new RegExp(query,'i')
    obj.title = regex
  }

  Article.find(obj,{},{sort:{'_id':-1}},function(err,ret){
    if(err){
      console.log('查询失败');
    }
    reponseData.data = ret 
    res.status(200).json(reponseData)
  }) 
})

//关于我页面
router.get('/about',async (req,res,next)=>{
  const data = await About.find()
  reponseData.data = data[0]
  reponseData.meta.msg = 'success'
  res.status(200).json(reponseData)
})

//添加user
router.post('/user',(req,res,next) => {
  const body = req.body
  new User(body).save(function (err, ret) {
    if (err) {
      reponseData.meta.msg = 'err'
      res.status(200).json(reponseData)
    }
    console.log(ret)
    reponseData.meta.msg = 'success'
    res.status(200).json(reponseData)
  })
})


module.exports = router
