const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, "please provide a category"],
        lowercase: true,
    },

    subCategory: {
        type: String,
        required: [true, "please provide a subcategory"],
        lowercase: true,
    },

    price: {
        type: Number,
        default: 0,
    },

    items: { type : [mongoose.Schema.ObjectId], ref: 'Item' },


})



const Box = mongoose.model('Box', boxSchema)
module.exports = Box;