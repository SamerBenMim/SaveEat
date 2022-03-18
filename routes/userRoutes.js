const express = require('express')
const router = express.Router();
const { signup, login, verifyAccount } = require('../controllers/authController')
const { auth } = require('../Middleware/auth')
const { access } = require('../Middleware/access')
const { getAllUsers, getUser } = require('../controllers/userController')


router.post('/signup', signup)
router.post('/login', login)
router.post('/verifyAccount', access, verifyAccount)
router.get('/test', auth, (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: "test auth"
    })
})

//for sys admin
router
    .route('/')
    .get(getAllUsers)

router
    .route('/:id')
    .get(getUser)


module.exports = router;