const mongoose = require('mongoose')
const momentsSchema = require('../schemas/moments')

module.exports = mongoose.model('Moments', momentsSchema)