const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  nickname: {
    type: String,
    default: '5'
  },
  avatar: {
    type: String,
    default: 'http://127.0.0.1:2020/public/869343762461114766.jpg'
  },
  createTime: {
    type: Number,
    default: Date.now
  },
  updateTime: {
    type: Number,
    default: Date.now
  },
  content: {
    type: String,
    default: ''
  },
  contentTemplate: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  }
})