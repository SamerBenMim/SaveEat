const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "please provide a customer"],

    },
    total: {
        type: Number,
    },

    customer_phone: {
        type: String,
        default: 0,
    },

    customer_address: {
        type: String,
        default: 0,
    },

    status: {
        type: String,
        default: "submitted",
        enum: ['submitted', 'confirmed', "declined"],
    },


    boxes: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Box',
    },


})


const Order = mongoose.model('Order', orderSchema)
module.exports = Order;