const express = require("express");
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const morgan = require('morgan')
const UserRouter = require('./routes/userRoutes')
const ItemRouter = require('./routes/itemRoutes')
const BoxRouter = require('./routes/boxRoutes')
const orderRoutes = require('./routes/orderRoutes')
const app = express();
const cors = require('cors');
const passport = require('passport')
const globalErrorHandler = require("./Middleware/globalErrorHandler")
const { auth } = require('./Middleware/auth')
const { isAdmin } = require('./Middleware/isAdmin')
app.use(passport.initialize());

app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(mongoSanitize())
app.use(xss())
app.use(hpp({ whitelist: [] }))
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})
app.use(cors())
const jwt = require('jsonwebtoken')


if ((process.env.NODE_ENV === 'development')) app.use(morgan('dev'));



app.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: '/failure'
    }), (req, res) => {
        console.log("profile : ", req.user)
        const { email, role, id } = req.user
        const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET, {

            expiresIn: process.env.JWT_EXPIRES_IN
        })
        res.status(200).json({
            status: 'success',
            email: req.user.email,
            role: req.user.role,
            token
        });


    });





// // Facebook authentication strategy
// app.use('/api/auth/facebook', passport.authenticate('facebook', {scope: [ "email" ]}))

// app.get('/api/facebook/callback', loginFacebook)
// app.get('/api/facebook/delete', deleteFacebookData)





// const JWTStrategy = passportJWT.Strategy
// const ExtractJWT = passportJWT.ExtractJwt


// // Call this from app.js using passportAuth.initPassport(app)
// module.exports.initPassport = function (app) {
//   app.use(passport.initialize());

// passport.use('jwt', new JWTStrategy({
//   jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.JWT_SECRET // Specify a JWT secret in .env file
// },
//   function (jwtPayload, done) {
//     // find the user in db if needed.
//     // This functionality may be omitted if you store everything you'll need in JWT payload.
//     return done(null, jwtPayload);
//   }
// ));

// Passport Strategy for login via email
//   passport.use('local',
//     new LocalStrategy(
//       {
//         usernameField: "email",
//         passwordField: "password",
//         session: false // Use JWT and not session
//       },
//       async (email, password, done) => {
//         var user = await User.findOne(
//           {
//             where: { email: email },
//           })
//         if (!user) {
//           // Username doesn't exist
//           return done(null, false, { message: 'Incorrect email or password' })
//         }
//         if (!user.validPassword(password)) {
//           // Password doesn't match
//           return done(null, false, { message: 'Incorrect email or password' })
//         }
//         if (!user.isVerified) {
//             return done(null, false, { resend_email: true, message: 'Email is not Verified' })
//         }
//         // Login is successful
//         done(null, { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email });
//       }
//     )
//   )
// }

// // Passport strategy for login via facebook
//   passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: process.env.BASE_SERVER_URL + '/api/facebook/callback',
//     profileFields: ['id', 'first_name', 'last_name', 'email', 'picture'],
//     passReqToCallback: true
//   },
//     function (req, accessToken, refreshToken, profile, done) {
//       process.nextTick(async function () {
//         console.log("Facebook authentication triggered")
//         try {
//           // Check if the fb profile has an email associated. Sometimes FB profiles can be created by phone
//           // numbers in which case FB doesn't have an email - If email is not present, we fail the signup 
//           // with the proper error message
//           if (!profile._json.email) {
//             return done(null, false,
//               { message: 'Facebook Account is not registered with email. Please sign in using other methods' })
//           }
//           let data = await utils.getOrCreateNewUserWithMedium(
//             accessToken,
//             profile.id,
//             profile._json.first_name,
//             profile._json.last_name,
//             profile._json.picture.data.url,
//             profile._json.email,
//             'facebook',
//             parseInt(req.query.state)) // An optional param you can pass to the request 
//           if(data.alreadyRegisteredError){
//             // You can also support logging the user in and overriding the login medium
//             done(null, false, {
//               message: `Email is alredy registered with ${data.medium} account. Please login with email.`
//             });
//           } else {
//             done(null, { id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName });
//           }
//         } catch (err) {
//           return done(null, null, {message: 'Unknown error'})
//         }
//       });
//     }
//   ));











app.get('/success', (req, res) => res.send('success'));
app.get('/failure', (req, res) => res.send('failure'));
app.use('/api/users', UserRouter)
app.use('/api/items', ItemRouter)
app.use('/api/boxes', auth,
isAdmin,
BoxRouter)
app.use('/api/orders', auth,orderRoutes)
app.all('*', (req, res, next) => {
    const err = new Error(`can't find ${req.originalUrl}`)
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
})

app.use(globalErrorHandler)


module.exports = app;