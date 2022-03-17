const express = require('express')
const router = express.Router();
const {signup,login,protect} = require('../controllers/authController')


router.post('/signup',signup)
router.post('/login',login)
router.get('/test',protect,(req,res,next)=>{
    res.status(200).json({
        status:'success',
        data:"test auth" }
        )
})

module.exports = router ;
