const { Schema, model } = require('mongoose');

const Detail = new Schema({
    title: String,
    categories: [String],
    description: Object,
    view: Number,
    count: Number,
    admin: Schema.Types.ObjectId
})

module.exports = model('Detail', Detail);