const express = require('express')
const router = express.Router();
const {signup,login,protect} = require('../controllers/authController')
const {getAllUsers,getUser} = require('../controllers/userController')


router.post('/signup',signup)
router.post('/login',login)
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
