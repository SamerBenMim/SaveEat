const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync")
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')

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
       if(!user) {
        res.status(404).json({
            status:"fail",
            message:"no User found with that id"
        })
       }
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
    if(!password)   res.status(400).json({
        status:"fail",
        message:"provide your password"
    })
    else if (!newEmail)   res.status(400).json({
        status:"fail",
        message:"provide a valid new email adress"
    })
else{

    const user = await User.findOne({ email: email, verified: true }).select('+password')
     if (!user) {
        res.status(200).json({
            status: 'error',
            error: "something went wrong, please try later !"
        });
    }
   else if(!user.password) res.status(200).json({
        status: 'error',
        error: "you re logged in with facebook ! you can't change your email"
    });
   else if (!await user.correctPassword(password, user.password)) {
        res.status(200).json({
            status: 'error',
            error: "Incorrect password !"
        });
    }
    else{
        
    try {
        const verifCode = Math.floor(Math.random() * 1000000);
        user.set({ newEmail: newEmail });
        user.set({ code: verifCode });
        await user.save();
console.log(user)
        await sendEmail({
            email: newEmail,
            subject: 'Verification Email (valid for 5 min)',
            message: verifCode+"",
        })

    } catch (err) {
        return next(new AppError("there was an error sending the verification code. Try again later !", 500))
    }
    return res.status(200).json({
        status: 'success',
       message:"email sent "
    })
    
    

}}

})


exports.VerifyEmail = catchAsync(async(req,res,next)=>{
    const {code} = req.body;
    const {email} = req.user;
    console.log("rrrrrrrrr")

    const user = await User.findOne({ email: email, verified: true })
    console.log(user)

    if(code*1==user.code*1){
        const updatedUser = await User.findOneAndUpdate({"email":email},{email:user.newEmail ,newEmail:"" },{new : true,runValidators:true}) 
        if(!updatedUser) {
            res.json({
                status: 'error',
                error: " something went wrong !"
            });
   
    }
     else {
        res.status(200).json({
            status: 'success',
            message: 'email updated successfully',
            data: {
                updatedUser
            }
        });
    }
}else res.json({
    status: 'error',
    error: "Wrong code !"
});
 }

 )


exports.updatePassword = catchAsync(async(req,res)=>{ 
    const {password,newPassword} = req.body;
    const {email} = req.user;
    if(!password)   res.status(400).json({
        status:"fail",
        message:"provide your password"
    })
    else if (!newPassword)   res.status(400).json({
        status:"fail",
        message:"provide a valid new password"
    })

    const user = await User.findOne({ email: email, verified: true }).select('+password')
     if (!user) {
        res.status(200).json({
            status: 'error',
            error: "something went wrong, please try later !"
        });
    }
   else if(!user.password) res.status(200).json({
        status: 'error',
        error: "you re logged in with facebook !"
    });
   else if (!await user.correctPassword(password, user.password)) {
        res.status(200).json({
            status: 'error',
            error: "Incorrect password !"
        });
    }
      else {var updatedUser = await User.findOneAndUpdate({"email":email},{"password":newPassword},{new : true,runValidators:true})//new return the updated obj 

    if(!updatedUser) {
    res.status(500).json({
        status:"fail",
        message:"Something went wrong try later"
    })
   }
     else  res.status(200).json(
        {status :'success', 
        message:'password updated successfully',
        data:{
           email: updatedUser.email,
           role:updatedUser.role,
        }   
    })
    
}}
)
