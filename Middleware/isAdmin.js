const catchAsync = require("./../utils/catchAsync");

exports.isAdmin = catchAsync(async(req, res, next) => {

    if(req.user.role!=="admin")
    return next(new AppError('You do not have permission to perform this action',403)) //403 not authorized
    next()
})
