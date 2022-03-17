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