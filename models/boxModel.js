const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, "please provide a category"],
        lowercase: true,
        default:"mixed",
        enum: ['mixed', 'canned','fresh'],
    },

    subCategory: {
        type: String,
        required: [true, "please provide a subcategory"],
        lowercase: true,
        default:"regular",
        enum: ['special', 'regular'],

    },

    price: {
        type: Number,
        default: 0,
    },
    stock:{
        type: Number,
        default: 1,
    },

    items: { type : [mongoose.Schema.ObjectId], ref: 'Item' },


})



const Box = mongoose.model('Box', boxSchema)
module.exports = Box;