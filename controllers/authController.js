const crypto = require('crypto')
const catchAsync = require("./../utils/catchAsync")
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')
const _ = require('lodash');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const BlacklistedTokens = require('../models/BlacklistedTokensModel');
const facebookStrategy = require("passport-facebook").Strategy
const passport = require('passport')


const generateToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}



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
    if (userExist) {
        return res.status(200).json({
            status: 'error',
            error: "This email is already used"
        })
    }
    // save user in the database
    var code = crypto.randomBytes(6).toString('hex');
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
    user = await User.findOne({ 'email': req.decoded.email }).select("+code");
    if (user.code == code) {
        accessToken = req.headers.access.split(' ')[1];
        const blackList = new BlacklistedTokens({
            token: accessToken
        });

        await User.updateOne({ _id: user._id, email: user.email }, { verified: true }, { returnOriginal: false });
        await blackList.save();
        const token = user.generetaAuthToken();
        return res.status(200).json({
            status: 'success',
            message: 'your account is verified',
            token,
            data: {
                user
            }
        });
    } else {
        return res.json({
            status: 'error',
            error: "Wrong code !"
        });
    }
});


exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    //1) check if email & pass exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400)); // return=>to make sure that the fn finishes 
    }
    //2) check if user exist
    const user = await User.findOne({ email: email, verified: true }).select('+password')
    if (!user) {
        return res.status(200).json({
            status: 'error',
            error: "Incorrect Email or password !"
        });
    }
    if (!user.password)
        return res.status(200).json({
            status: 'error',
            error: "Incorrect Email or password !"
        });

    //3) check if pass is correct 
    if (!user || !await user.correctPassword(password, user.password)) {
        return res.status(200).json({
            status: 'error',
            error: "Incorrect Email or password !"
        });
    }

    //4) send token to client
    createSendToken(user, 200, res)
})


exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) get user based on token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest("hex")
    const user = await User.findOne({ PasswordResetToken: hashedToken, PasswordResetExpires: { $gt: Date.now() } }) // check also if the tokenResetPAss has expired
        // 2) if there is a user and token has not expired
    if (!user) {
        return next(new AppError('Token is invalid or has expired ', 400))
    }


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
    if (!user) {
        return res.status(200).json({
            status: 'error',
            error: "There is no account with this email address!"
        });
    }
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

        return res.status(200).json({
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
    return res.status(200).json({
        status: 'success',
        message: 'logged out'

    })
})
exports.test = catchAsync(async(req, res, next) => {
    return res.status(200).json({
        status: 'success',
        message: 'test',
        user: req.user
    })
})