const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
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
})