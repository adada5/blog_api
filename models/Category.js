const mongoose = require('mongoose')
const categorysSchema = require('../schemas/categorys')

module.exports = mongoose.model('Category', categorysSchema)