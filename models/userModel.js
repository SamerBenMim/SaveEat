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
    adress: {
        type: String,
    },
    birthday: {
        type: Date,
        format: "%d-%m-%Y"
    },
    phoneNumber: {
        type: Number,
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
        if (us.verified === false) {
            await User.deleteOne({ email: email });
        }
    }, 50000)
})

userSchema.pre('findOneAndUpdate', async function() {
    if (this._update.password) {
        this._update.password = await bcrypt.hash(this._update.password, 12);
    }
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

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

const User = mongoose.model('User', userSchema)
module.exports = User;