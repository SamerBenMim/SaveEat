const crypto = require('crypto')
const catchAsync = require("./../utils/catchAsync")
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')
const _ = require('lodash');
const BlacklistedTokens = require('../models/BlacklistedTokensModel');

const createSendToken = (user, statusCode, res) => {
    const token = user.generetaAuthToken();
    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async(req, res, next) => {
    let user = new User(
        _.pick(req.body, ['email', 'password'])
    );
    userExist = await User.findOne({ 'email': user.email });
    if (userExist)  return next(new AppError("This email is already used", 200)) 
    // save user in the database
    var code = crypto.randomBytes(6).toString('hex');
    user.set({  verified : false });
    user.set({ code: code });
    await user.save();
    const accessToken = user.generetaAccessToken(code);

    try {
        await sendEmail({
            email: user.email,
            subject: 'Verification Email (valid for 5 min)',
            message: code,
        })

    } catch (err) {

        return next(new AppError("there was an error sending the verification code. Try again later !", 500))
    }

    user = _.pick(user, ['email', 'role', '_id']);
    return res.status(200).json({
        status: 'success',
        accessToken,
        data: {
            user
        }
    })
});



exports.verifyAccount = catchAsync(async(req, res, next) => {
    const code = req.body.code;
    user = await User.findOne({ 'email': req.decoded.email });
    if (! user) return next(new AppError("there is no user with this email adress", 404))

    if (user.code == code) {
        accessToken = req.headers.access.split(' ')[1];
        const blackList = new BlacklistedTokens({
            token: accessToken
        });

        await User.updateOne({ _id: user._id, email: user.email }, { verified: true }, { returnOriginal: false });
        await blackList.save();
        const token = user.generetaAuthToken();
        res.status(200).json({
            status: 'success',
            message: 'your account is verified',
            token,
            data: {
                user
            }
        });
    } else {
        return next(new AppError("Wrong code !", 403))
    }
});


exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    //1) check if email & pass exist
    if (!email || !password) return next(new AppError('Please provide email and password', 400)); // return=>to make sure that the fn finishes 
    //2) check if user exist
    const user = await User.findOne({ email: email, verified: true }).select('+password')
    if (!user) return next(new AppError("Incorrect Email or password ! ", 200))
    if (!user.password) return next(new AppError("your logged in with facebook ", 200))
    //3) check if pass is correct 
    if (!user || !await user.correctPassword(password, user.password)) return next(new AppError("Incorrect Email or password ! ", 200))
    //4) send token to client
    createSendToken(user, 200, res)
})


exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) get user based on token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest("hex")
    const user = await User.findOne({ PasswordResetToken: hashedToken, PasswordResetExpires: { $gt: Date.now() } }) // check also if the tokenResetPAss has expired
        // 2) if there is a user and token has not expired
    if (!user) return next(new AppError('Token is invalid or has expired ', 400))
    

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.PasswordResetToken = undefined
    user.PasswordResetExpires = undefined
    await user.save()

    // 3) log the user in ,send JWT
    createSendToken(user, 200, res)
})



exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) get user based on posted email
    const user = await User.findOne({
        email: req.body.email
    })
    if (!user)  return next(new AppError('There is no account with this email address!', 200))
    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) send tho token to that email
    const resetURL = `${req.get('origin')}/resetPassword/${resetToken}`
    const message = `<div style="display:flex;align-items:center; flex-direction:column"> Forgot your password ? click: <a href="${resetURL}">HERE<a/>. <div>If you didn't forget your password please ignore this</div> </div> `

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your pass reset token (valid for 10 min)',
            message,
            type: "passwordReset"
        })

        res.status(200).json({
            status: 'success',
            message: 'token sent to email!'

        })
    } catch (err) {
        user.PasswordResetToken = undefined;
        user.PasswordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        })
        return next(new AppError("there was an error sending the email. Try again later !", 500))
    }

})
exports.logout = catchAsync(async(req, res, next) => {
    authToken = req.headers.authorization.split(' ')[1];
    const blackList = new BlacklistedTokens({
        token: authToken
    });
    await blackList.save();
    res.status(200).json({
        status: 'success',
        message: 'logged out'

    })
})
exports.test = catchAsync(async(req, res, next) => {

    res.status(200).json({
        status: 'success',
        message: 'test'

    })
})
