const { Schema, model } = require('mongoose');

const Category = new Schema({
    _id: String
})

module.exports = model('Category', Category);