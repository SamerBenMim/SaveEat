const mongoose = require('mongoose');
var BlacklistedTokensSchema = new mongoose.Schema({
    token: String,
    createdAt: {
        default: Date.now(),
        type: Date
    }
})

const BlacklistedTokens = mongoose.model('BlacklistedTokens', BlacklistedTokensSchema);
module.exports = BlacklistedTokens;