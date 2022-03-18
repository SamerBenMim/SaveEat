const catchAsync = require("./../utils/catchAsync")
const {promisify} = require('util');


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