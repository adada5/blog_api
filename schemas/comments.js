const mongoose = require('mongoose')


module.exports = new mongoose.Schema({
  data:{type: mongoose.Schema.Types.ObjectId, ref:'Article'}, //Article数据表,此处存博客数据id
  from:{type: mongoose.Schema.Types.ObjectId, ref:'Visitor'}, //Visitor用户表，此处存用户id
  createTime:{type: Number,default: Date.now},                //Date.now()获取的时间有问题，Date.now才是正常的
  content: String,                                            //
  replay:[
     {
         from: {type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'},  //来着visitor的评论
         to: {type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'},    //回复给visitor的评论 当无回复者时 为第一条评论
         createTime:{type: Number,default: Date.now},
         content: String
     }
  ]
})