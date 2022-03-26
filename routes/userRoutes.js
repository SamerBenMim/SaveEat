const express = require('express')
const router = express.Router();
const {signup,forgotPassword,login,resetPassword,verifyAccount} = require('../controllers/authController')
const {getAllUsers,getUser} = require('../controllers/userController')
const { auth } = require('../Middleware/auth')
const { access } = require('../Middleware/access')


router.post('/signup', signup)
router.post('/login', login)
router.post('/verifyAccount', access, verifyAccount)
router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)

//for sys admin
router
    .route('/')
    .get(getAllUsers)

router
    .route('/:id')
    .get(getUser)


module.exports = router;