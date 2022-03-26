const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt =  require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name:{
        type :String,
        required : [true,'please tell us your name!']
    },
    email : {
        type:String,
        required:[true,"please provide an email"],
        unique : true,
        lowercase:true ,
        validate : [validator.isEmail,['Please enter a valid email']]
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user',
    },
    password:{
        type:String,
        required : [true,'please provide a password'],
        minlength:8,
        select : false
    },
    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password'],
        validate:{
            validator : function(el){ // this only works on save and create
                return el===this.password;
            },message:"passwords are not the same"
        },
        select : false 

    },

   // passwordChangedAt: Date,
    PasswordResetToken:String,
    PasswordResetExpires: Date,

    active:{
        type:Boolean,
        default:true,
        select:false
    }

})
userSchema.pre('save', async function(next){
    if(this.isModified('password')){    
        this.password  = await bcrypt.hash(this.password,12); 
        this.passwordConfirm = undefined 
    }
    next()
})


userSchema.methods.correctPassword= async function(candidatePassword,userPassword){ //we pass user password beaxause we can't use this.password bcause select is set false
    return await bcrypt.compare(candidatePassword,userPassword)//compares password even 1 is a hash and 2 is a string
   }

userSchema.methods.createPasswordResetToken=function(){
    const resetToken = crypto.randomBytes(32).toString('hex');//create random token
    this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    //console.log({resetToken},this.PasswordResetToken);

    this.PasswordResetExpires=Date.now()+10*60*1000;  //10 min
    return resetToken; 
}

userSchema.methods.generetaAuthToken = function() {
    const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
}

userSchema.methods.generetaAccessToken = function(code) {
    const token = jwt.sign({ _id: this._id, role: this.role, email: this.email, password: this.password, authCode: code, type: "access" }, process.env.JWT_SECRET, {
        expiresIn: '300s'
    });
    return token;
}
   
const User = mongoose.model('User',userSchema)
module.exports = User;
