const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError')

exports.isAdmin = catchAsync(async(req, res, next) => {

    if(req.user.role!=="admin")
    return next(new AppError('You do not have permission to perform this action',403)) //403 not authorized
    next()
})
