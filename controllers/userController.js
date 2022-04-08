const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync")

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

exports.updateEmail = catchAsync(async(req,res)=>{ 
    const email = req.user.email;
    const newEmail = {
        email: req.body.email
    } 
    const updatedUser = await User.findOneAndUpdate({"email":email},newEmail,{new : true,runValidators:true}) 

console.log(updatedUser)
    if(!updatedUser) {
    res.status(500).json({
        status:"fail",
        message:"Something went rong try later"
    })
   }
    res.status(200).json(
        {status :'success', 
        message:'email updated successfully',
        data:{
            email: updatedUser.email,
            role:updatedUser.role, 
        }   
    })
})




exports.updatePassword = catchAsync(async(req,res)=>{ 
    const {password,newPassword} = req.body;
    const {email} = req.user;
    if(!password)   res.status(400).json({
        status:"fail",
        message:"provide your password"
    })
    if(!newPassword)   res.status(400).json({
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
    if(!user.password) res.status(200).json({
        status: 'error',
        error: "you re logged in with facebook !"
    });
    if (!await user.correctPassword(password, user.password)) {
        res.status(200).json({
            status: 'error',
            error: "Incorrect password !"
        });
    }
    const updatedUser = await User.findOneAndUpdate({"email":email},{"password":newPassword},{new : true,runValidators:true})//new return the updated obj 

    if(!updatedUser) {
    res.status(500).json({
        status:"fail",
        message:"Something went wrong try later"
    })
   }
    res.status(200).json(
        {status :'success', 
        message:'password updated successfully',
        data:{
           email: updatedUser.email,
           role:updatedUser.role,
        }   
    })
})
