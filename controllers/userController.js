const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync")
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')
const BlacklistedTokens = require('../models/BlacklistedTokensModel');

exports.getAllUsers = catchAsync(async (req,res)=>{

    const users = await User.find();
    res.status(200).json({
        status :'success',
        results: users.length,
        data:{
        users
        }

})
})


exports.getUser = catchAsync(async(req,res)=>{ 
        const user = await User.findById(req.params.id)
       if(!user)  return next(new AppError("no User found with that id", 404))
        res.status(200).json(
            {status :'success', 
            data:{
                user
            }   
        })
})
exports.updateEmail = catchAsync(async(req,res,next)=>{ 
    const {email} = req.user;
    const newEmail = req.body.email
    const {password}= req.body  ;
    if(!password)    return next(new AppError("provide your password", 200))
    if (!newEmail)   return next(new AppError("provide a valid new email adress", 200))  

    const user = await User.findOne({ email: email, verified: true }).select('+password')
    
     if (!user) return next(new AppError("something went wrong, please try later !", 200)) 
     if(!user.password) return next(new AppError("you re logged in with facebook ! you can't change your email!", 200)) 
     if (!await user.correctPassword(password, user.password)) return next(new AppError("Incorrect password !", 403)) 
     
    try {
        const verifCode=user.createEmailResetCode()
        await user.save({ validateBeforeSave: false });

        await sendEmail({
            email: newEmail,
            subject: 'Verification Email (valid for 10 min)',
            message: verifCode+"",
        })

    } catch (err) {
        user.code = undefined;
        user.emailResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        })
        return next(new AppError("there was an error sending the verification code. Try again later !", 500))
    }
    return res.status(200).json({
        status: 'success',
       message:"email sent "
    })
    
    



})


exports.VerifyEmail = catchAsync(async(req,res,next)=>{
    const {code} = req.body;
    const {email} = req.user;
    const user = await User.findOne({ email: email, verified: true }).select("+code")

    if(code*1==user.code*1){

        const updatedUser = await User.findOneAndUpdate({"email":email, emailResetExpires: { $gt: Date.now() } },{email:user.newEmail ,newEmail:"" },{new : true,runValidators:true}) 
        if(!updatedUser)  return next(new AppError("something went wrong !", 500))
        user.code = undefined;
        user.emailResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        })
       return res.status(200).json({
            status: 'success',
            message: 'email updated successfully',
            data: {
                updatedUser
            }
        });
    
}
return next(new AppError("Wrong code !", 401))
 })


exports.updatePassword = catchAsync(async(req,res,next)=>{ 
    const {password,newPassword} = req.body;
    const {email} = req.user;
    if(!password) return next(new AppError("provide your password", 200))
    if (!newPassword)  return next(new AppError("provide a valid new password", 200))
    const user = await User.findOne({ email: email, verified: true }).select('+password')
    if (!user) return next(new AppError("something went wrong, please try later !", 500))
    if(!user.password) return next(new AppError("you re logged in with facebook !", 401))
    if (!await user.correctPassword(password, user.password)) return next(new AppError("Incorrect password !", 401))
    var updatedUser = await User.findOneAndUpdate({"email":email},{"password":newPassword},{new : true,runValidators:true})//new return the updated obj 

    if(!updatedUser) return next(new AppError("Something went wrong try later !", 500))
    const token = user.generetaAuthToken();
    authToken = req.headers.authorization.split(' ')[1];
    const blackList = new BlacklistedTokens({
        token: authToken
    });
    await blackList.save();
    return  res.status(200).json(
        {status :'success', 
        message:'password updated successfully',
        token,
        data:{
           email: updatedUser.email,
           role:updatedUser.role,
        }   
    })
    
}
)

exports.updateLastName = catchAsync(async(req,res,next)=>{ 
    const {LastName} = req.body;
    const {email} = req.user;
    if(!LastName) return next(new AppError("provide your LastName", 200))
    var updatedUser = await User.findOneAndUpdate({"email":email},{"LastName":LastName},{new : true,runValidators:true})//new return the updated obj 
    if(!updatedUser) return next(new AppError("Something went wrong try later !", 500))
    return  res.status(200).json(
        {status :'success', 
        message:'LastName updated successfully',
        data:{
            updatedUser
        }   
    })
    
}
)
exports.updateFirstName = catchAsync(async(req,res,next)=>{ 
    console.log("first")
    const {FirstName} = req.body;
    const {email} = req.user;
    if(!FirstName) return next(new AppError("provide your FirstName", 200))
    var updatedUser = await User.findOneAndUpdate({"email":email},{"FirstName":FirstName},{new : true,runValidators:true})//new return the updated obj 
    if(!updatedUser) return next(new AppError("Something went wrong try later !", 500))
    return  res.status(200).json(
        {status :'success', 
        message:'FirstName updated successfully',
        data:{
            updatedUser
        }   
    })
    
}
)
