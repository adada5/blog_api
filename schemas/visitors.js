const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  nickname: String,
  email:String,
  img:String
})