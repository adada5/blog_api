const mongoose = require('mongoose')
const visitorsSchema = require('../schemas/visitors')

module.exports = mongoose.model('Visitor', visitorsSchema)