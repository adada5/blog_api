const mongoose = require('mongoose')
const aboutSchema = require('../schemas/about')

module.exports = mongoose.model('About', aboutSchema)