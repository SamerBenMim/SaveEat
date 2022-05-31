const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const { stringify } = require('querystring');
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "please provide an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, ['Please enter a valid email']]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: 8,
        select: false
    },


    // passwordChangedAt: Date,
    PasswordResetToken: {
        type: String,
        select: false

    },
    PasswordResetExpires: {
        type: Date,
        select: false

    },

    code: {
        type: String,
        select: false
    },
    emailResetExpires: {
        type: Date,
        select: false
    },

    newEmail: {
        type: String,
        lowercase: true,
        select: false

    },
    verified: {
        type: Boolean,
        default: false,
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    lastName: {
        type: String,
    },
    firstName: {
        type: String,
    },
    address: {
        type: String,
    },
    birthday: {
        type: Date,
        format: "%d-%m-%Y"
    },
    phone: {
        type: String,
    },

})
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next()
})

userSchema.post('save', async function(next) {
    const { email } = this
    setTimeout(async() => {
        const us = await User.findOne({
            email: email
        }).select('+verified')
        if (us && us.verified === false) {
            await User.deleteOne({ email: email });
        }
    }, 300000)
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) { //we pass user password beaxause we can't use this.password bcause select is set false
    return await bcrypt.compare(candidatePassword, userPassword) //compares password even 1 is a hash and 2 is a string
}


// userSchema.virtual('orders',{ // THE NAME OF THE VIRTUAL FIELDS
//     ref:'Order', // name of the model, 
//     foreignField:'customer', // the reference of the current model in the other model //the name in the other model were this model is saved // connect 2models
//     localField:'_id'  // the reference of the current id in the current model

// })




userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); //create random token
    this.PasswordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    //console.log({resetToken},this.PasswordResetToken);

    this.PasswordResetExpires = Date.now() + 10 * 60 * 1000; //10 min
    return resetToken;
}
userSchema.methods.createEmailResetCode = function() {
    console.log("code done")
    this.code = Math.floor(Math.random() * 1000000);

    this.emailResetExpires = Date.now() + 10 * 60 * 1000; //10 min
    return this.code;
}
userSchema.methods.generetaAuthToken = function() {
    const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
}

userSchema.methods.generetaAccessToken = function(code) {
    const token = jwt.sign({ _id: this._id, role: this.role, email: this.email, code: code, type: "access" }, process.env.JWT_SECRET, {
        expiresIn: '300s'
    });
    return token;
}
userSchema.pre('findOneAndUpdate', async function() {
    if (this._update.password) {
        this._update.password = await bcrypt.hash(this._update.password, 12);
    }
});


const User = mongoose.model('User', userSchema)
module.exports = User;