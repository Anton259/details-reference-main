const { Schema, model } = require('mongoose');

const User = new Schema({
    login: String,
    password: String,
    phone: String,
    busket: [{ product: Schema.Types.ObjectId, count: Number }],
    admin: Boolean
})

module.exports = model('User', User);