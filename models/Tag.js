const mongoose = require('mongoose')
const tagsSchema = require('../schemas/tags')

module.exports = mongoose.model('Tag', tagsSchema)