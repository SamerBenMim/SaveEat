const catchAsync = require("./../utils/catchAsync");
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const AppError = require('./../utils/appError')
const { promisify } = require('util');
const BlacklistedTokens = require('../models/BlacklistedTokensModel');

exports.access = catchAsync(async(req, res, next) => {
    //1) gettibg the token and check if it's there
    let token
    if (req.headers.access && req.headers.access.startsWith('Bearer')) {
        token = req.headers.access.split(' ')[1];
    }
    if (!token) return next(new AppError('You have no authorization to this link please sign up first', 401)) //401 unauthorized
        //2) verif token - validate token

    const blackListed = await BlacklistedTokens.findOne({ token: token });
    if (blackListed) {
        return res.status(403).send("Access denied");
    }
    //3) send user and blacklist token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    user = await User.findById(decoded._id).select("-password");
    req.user = user;
    next();

});