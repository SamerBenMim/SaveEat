const express = require('express')
const router = express.Router();
const {signup,forgotPassword,login,resetPassword} = require('../controllers/authController')
const {protect} =require('./../middlewares/protection')
const {getAllUsers,getUser} = require('../controllers/userController')


router.post('/signup',signup)
router.post('/login',login)
router.post('/forgotPassword',forgotPassword)
router.patch('/resetPassword/:token',resetPassword)

router.get('/test',protect,(req,res,next)=>{
    res.status(200).json({
            status:'success',
        data:"test auth" }
        )
})

//for sys admin
router
  .route('/')
  .get(getAllUsers) 

router 
  .route('/:id')
  .get(getUser)


module.exports = router ;
