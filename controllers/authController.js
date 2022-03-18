const crypto = require('crypto')
const catchAsync = require("./../utils/catchAsync")
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken') 
const AppError = require('./../utils/appError')
const {promisify} = require('util');
const sendEmail = require('./../utils/email')

const generateToken = id =>{
    return  jwt.sign({id},process.env.JWT_SECRET,{
          expiresIn: process.env.JWT_EXPIRES_IN
      })   
  }
  
  const createSendToken = (user,statusCode,res)=>{
    const token = generateToken(user._id)
    user.password = undefined
    console.log("user",user)
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user 
        }
    })
}

exports.signup = catchAsync(async(req,res ,next)=>{
    console.log(req.body)
        let newUser
                newUser = await User.create({
                name: req.body.name,
                email:req.body.email,
                password:req.body.password,
                passwordConfirm:req.body.passwordConfirm,
            })
        
        createSendToken(newUser,201,res)
    
    })



exports.login= catchAsync(async (req,res,next)=>{
    const {email,password} = req.body;
    //1) check if email & pass exist
    if(!email||!password){
       return next(new AppError('Please provide email and password',400)); // return=>to make sure that the fn finishes 
    }
    //2) check if user exist
    const user =await User.findOne({email}).select('+password')
    //3) check if pass is correct 
     if(!user || ! await user.correctPassword(password,user.password)){ 
        return next(new AppError('Incorrect email or password',401))
    }
   
    //4) send token to client
    createSendToken(user,200,res)
})



exports.forgotPassword = catchAsync(async(req,res,next)=>{
    // 1) get user based on posted email
    const user = await User.findOne({
        email:req.body.email
    })
    if(!user){
        return next(new AppError('there is no user with that email adress',404))
    } 
    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false}); 

    // 3) send tho token to that email
    const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}.\n If you didn't forget your password please ignore this  `
    
    try{
 
        await sendEmail({
            email:user.email,
            subject:'Your pass reset token (valid for 10 min)',
            message
        }) 

        res.status(200).json({
            status:'success',
            message:'token sent to email!'
            
        })
    }catch(err){
        user.PasswordResetToken=undefined;
        user.PasswordResetExpires=undefined;
        await user.save({
            validateBeforeSave:false
        })
        console.log(err);
        return next(new AppError("there was an error sending the email. Try again later !",500))
    }

    })



exports.resetPassword = catchAsync( async(req,res,next)=>{
        // 1) get user based on token 
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest("hex") 
        const user = await User.findOne({PasswordResetToken:hashedToken, PasswordResetExpires:{$gt: Date.now()} }) // check also if the tokenResetPAss has expired
        // 2) if there is a user and token has not expired
        if(!user){
            return next( new AppError('Token is invalid or has expired ',400))
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        
        user.PasswordResetToken =undefined
        user.PasswordResetExpires=undefined
        await user.save()
    
        // 3) log the user in ,send JWT
        createSendToken(user,200,res)
    
    })
    