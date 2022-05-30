const express = require('express')
const router = express.Router();
const { isAdmin } = require('../Middleware/isAdmin')

const { addOffer,getAllOffers,updateOffer,removeOffer} = require("../controllers/offerController")
 router.patch('/updateOffer/:id', isAdmin,updateOffer)
 router.get('/getAllOffers', getAllOffers)
 router.post('/addOffer', isAdmin,addOffer)
 router.delete('/removeOffer/:id', isAdmin,removeOffer)

module.exports = router;