const catchAsync = require("./../utils/catchAsync")
const User = require('./../models/userModel')
const AppError = require('./../utils/appError')
const _ = require('lodash');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const BlacklistedTokens = require('../models/BlacklistedTokensModel');

const createSendToken = (user, statusCode, res) => {
    const token = user.generetaAuthToken();
    user.password = undefined
    console.log("user", user)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async(req, res, next) => {
    const user = new User(
        _.pick(req.body, ['email', 'password'])
    );
    const acsessToken = user.generetaAccessToken();
    // save user in the database
    var code = crypto.randomBytes(6).toString('hex');
    user.set({ authCode: code });
    await user.save();
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'lilithsuccubus04@gmail.com',
            pass: 'lilithhellwrath1204'
        }
    }));
    var mailOptions = {
        from: 'lilithsuccubus04@gmail.com',
        to: user.email,
        subject: 'Verification Email',
        text: code
    };
    transporter.sendMail(mailOptions, function(error) {
        if (error) {
            res.send("Error sending email");
        }
    });


    return res.status(200).send(acsessToken + "\nEmail Sent");
});
exports.verifyAccount = catchAsync(async(req, res, next) => {
    const code = req.body.code;
    const user = req.user;
    if (user.authCode == code) {
        token = req.headers.access.split(' ')[1];
        const blackList = new BlacklistedTokens({
            token: token
        });
        await blackList.save();
        return res
            .status(200).send(
                "Successfully logged in", token);
    } else {
        res.send("invalid code");
    }
});


exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    //1) check if email & pass exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400)); // return=>to make sure that the fn finishes 
    }
    //2) check if user exist
    const user = await User.findOne({ email }).select('+password')
        //3) check if pass is correct 
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401))
    }

    //4) send token to client
    createSendToken(user, 200, res)
})