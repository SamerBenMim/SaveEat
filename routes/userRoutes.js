const express = require('express')
const router = express.Router();
const {signup,forgotPassword,login,resetPassword,verifyAccount,fb_auth,fb_redirect} = require('../controllers/authController')
const {getAllUsers,getUser} = require('../controllers/userController')
const { auth } = require('../Middleware/auth')
const { access } = require('../Middleware/access')
const facebookStrategy = require("passport-facebook").Strategy
const passport = require('passport')
const User = require('./../models/userModel');
const { cloneWith } = require('lodash');

router.post('/signup', signup)
router.get('/auth/facebook', passport.authenticate('facebook', { session: false, scope : 'email'}))
     
router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false, failureRedirect: "/" }),
    function(req, res) {
      console.log("req", req.user)
      res.json({
        "user": req.user}
      )
    }
  )
  
router.post('/login', login)
router.post('/verifyAccount', access, verifyAccount)
router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)


passport.use(new facebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID        : "819489749010313",
    clientSecret    : "8721121e098a09e2686b5965b3489958",
    callbackURL     : "http://localhost:3000/facebook/callback",
    profileFields: ['email']

},

function(token, refreshToken, profile, done) {
  User.findOne({'email' : profile.emails[0].value}, (err, user) => {
    var newUser= new User();
                    if (err) return done(err, false);
                    if (!user) {
                        newUser.email = profile.emails[0].value; 
                        newUser.verified = true
                        newUser.save({ validateBeforeSave: false })
                        return done(null,newUser)
                    } else {      
                      newUser=user           
                     return done(null,newUser)
                    }
    
}
  )

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
    .get(auth,getAllUsers)

router
    .route('/:id')
    .get(getUser)


module.exports = router;