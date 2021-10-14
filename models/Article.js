const mongoose = require('mongoose')
const articlesSchema = require('../schemas/articles')

module.exports = mongoose.model('Article', articlesSchema)