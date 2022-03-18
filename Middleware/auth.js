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
    if (!token) return next(new AppError('You are not logged in ! Please login to get access', 401)) //401 unauthorized
        //2) verif token - validate token
    const blackListed = await BlacklistedTokens.findOne({ token: token });
    if (blackListed) {
        return res.status(403).send("Access denied used token");
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    if (decoded.type == "access") {
        return res.status(403).send("Access denied wrong token");
    }

    //ACCESS TO PROTECTED ROUTE
    user = await User.findById(decoded._id).select("-password");
    req.user = user;
    const blackList = new BlacklistedTokens({
        token: token
    });
    await blackList.save();
    next();
});