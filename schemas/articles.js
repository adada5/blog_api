const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  title: String,
  category: {
    type: String,
    default: ''
  },
  tag:{
    type: String,
    default: ''
  },
  addTime: {
    type: Number,
    default: Date.now
  },
  updateTime: {
    type: Number,
    default: Date.now
  },
  view: {
      type: Number,
      default: 0
  },
  description: {
      type: String,
      default: ''
  },  
  descriptionTemplate: {
    type: String,
    default: ''
  },
  content: {
      type: String,
      default: ''
  },
  contentTemplate: {
    type: String,
    default: ''
  },
  words: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,
    default: 0
  },
})