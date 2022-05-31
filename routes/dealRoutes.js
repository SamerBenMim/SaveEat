const express = require('express')
const router = express.Router();
const { isAdmin } = require('../Middleware/isAdmin')

const { addDeal,getAllDeals,removeDeal,getMyDeals,declineDeal,confirmDeal} = require("../controllers/dealController")
//  router.patch('/updateOffer/:id', isAdmin,updateOffer)
 router.get('/getAllDeals', isAdmin, getAllDeals)
 router.post('/addDeal',addDeal)
 router.delete('/removeDeal/:id', isAdmin,removeDeal)
 router.get('/getMyDeals', getMyDeals)
 router.patch('/declineDeal/:id',isAdmin, declineDeal)
 router.patch('/confirmDeal/:id',isAdmin, confirmDeal)
module.exports = router;