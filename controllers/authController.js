const catchAsync = require("./../utils/catchAsync")
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken') 
const AppError = require('./../utils/appError')
const {promisify} = require('util');


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


exports.protect = catchAsync(async (req,res,next)=>{ 
   //1) gettibg the token and check if it's there
   let token
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
   }
   if(!token) return next(new AppError('You are not logged in ! Please login to get access',401))//401 unauthorized
   //2) verif token - validate token
   const decoded =   await promisify(jwt.verify)(token,process.env.JWT_SECRET)
   //3) check if user still exists
   const freshUser = await User.findById(decoded.id)
   if(!freshUser) {
       return next(new AppError('the token belonging to this token does no longer exist.'))
   }
   //ACCESS TO PROTECTED ROUTE
   req.user=freshUser //to pass data to next middleware
   next();
});
