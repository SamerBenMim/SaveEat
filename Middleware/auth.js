const catchAsync = require("./../utils/catchAsync");
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')
const { promisify } = require('util');
const BlacklistedTokens = require('./../models/BlacklistedTokensModel');
exports.auth = catchAsync(async(req, res, next) => {
    //1) gettibg the token and check if it's there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError("Unathorized please log in", 401))
    //2) verif token - validate token
    const blackListed = await BlacklistedTokens.findOne({ token: token });
    if (blackListed) return next(new AppError("Access denied used token", 403))  
    //const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.type == "access")  return next(new AppError("Access denied wrong token", 403))

        //ACCESS TO PROTECTED ROUTE
        user = await User.findById(decoded._id).select("-password");
        if (!user)   return next(new AppError("Access denied", 403))

        req.user = user;
        next();
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError)  return next(new AppError("Access denied invalid token", 403))    
        return next(new AppError("Access denied", 403))
    }
});