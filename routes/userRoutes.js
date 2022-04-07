const express = require('express')
const dotenv = require('dotenv');

const router = express.Router();
<<<<<<< HEAD
const {signup,forgotPassword,login,resetPassword,verifyAccount,fb_auth,fb_redirect} = require('../controllers/authController')
const {UpdateEmail} = require('../controllers/userController')

const {getAllUsers,getUser} = require('../controllers/userController')
=======
const { signup, forgotPassword, login, resetPassword, verifyAccount, logout, test, fb_auth, fb_redirect } = require('../controllers/authController')
const { getAllUsers, getUser } = require('../controllers/userController')
>>>>>>> b487d15058a0dc42e81e6d121b8b25ff62e8b072
const { auth } = require('../Middleware/auth')
const { access } = require('../Middleware/access')
const facebookStrategy = require("passport-facebook").Strategy
const passport = require('passport')
const User = require('./../models/userModel');
dotenv.config({ path: './config.env' })

router.post('/signup', signup)
router.get('/auth/facebook', passport.authenticate('facebook', { session: false, scope: 'email' }))

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false, failureRedirect: "/" }),
    function(req, res) {
        console.log("req", req.user)
        res.json({
            "user": req.user
        })
    }
)

router.get('/test', auth, test)
router.post('/login', login)
router.post('/logout', auth, logout)
router.post('/verifyAccount', access, verifyAccount)
<<<<<<< HEAD
router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)
router.patch('/updateEmail',auth,UpdateEmail)
router.patch('/updatePassword',auth,UpdateEmail)

=======
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
>>>>>>> b487d15058a0dc42e81e6d121b8b25ff62e8b072

passport.use(new facebookStrategy({
        clientID: process.env.CLIENT_ID_FB,
        clientSecret: process.env.CLIENT_SECRET_FB,
        callbackURL: "http://localhost:3000/facebook/callback",
        profileFields: ['email']

    },

    function(token, refreshToken, profile, done) {
        User.findOne({ 'email': profile.emails[0].value }, (err, user) => {
            var newUser = new User();
            if (err) return done(err, false);
            if (!user) {
                newUser.email = profile.emails[0].value;
                newUser.verified = true
                newUser.save({ validateBeforeSave: false })
                return done(null, newUser)
            } else {
                newUser = user
                return done(null, newUser)
            }

        })

    }

))

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


//for sys admin
router
    .route('/')
<<<<<<< HEAD
    .get(getAllUsers)
=======
    .get(auth, getAllUsers)
>>>>>>> b487d15058a0dc42e81e6d121b8b25ff62e8b072

router
    .route('/:id')
    .get(getUser)


module.exports = router;