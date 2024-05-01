const { Schema, model } = require('mongoose');

const Order = new Schema({
    products: [{ _id: Schema.Types.ObjectId, count: Number }],
    user: Schema.Types.ObjectId,
    status: String
})

module.exports = model('Order', Order);