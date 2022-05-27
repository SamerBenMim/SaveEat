const mongoose = require('mongoose');
var itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Fresh', 'Canned'],
    }
})

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;