const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    restaurant:{
     type: String,
     required: [true, "please provide a restaurant"],

    },
    product:{
        type: String,
        required: [true, "please provide a product"],
        
    },

    customer_phone: {
        type: String,
        default: 0,
    },

    customer_address: {
        type: String,
        default: 0,
    },

    description :{
        type: String,
        required: [true, "please provide a description"],

    },


    stock: { 
        type : Number,
        default:0
    },

    old_price:{
        type : Number,
        required: [true, "please provide a old_price"],

    },
    new_price:{
        type : Number,
        required: [true, "please provide a new_price"],

    },


})


const Offer = mongoose.model('Offer', offerSchema)
module.exports = Offer;
