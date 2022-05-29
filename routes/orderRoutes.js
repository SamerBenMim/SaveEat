const express = require('express')
const dotenv = require('dotenv');
const router = express.Router();
const { isAdmin } = require('../Middleware/isAdmin')

const { addOrder,getAllOrders,declineOrder,confirmOrder,getMyOrder } = require("../controllers/orderController")
router.post('/addOrder', addOrder)
// router.patch('/updateItem', updateItem)
// router.get('/getAllItems', getAllItems)
router.get('/getAllOrders' ,getAllOrders)
router.get('/getMyOrders' ,getMyOrder)
// router.get('/getMyOrders',      getMyOrders)
router.patch('/declineOrder/:id',isAdmin, declineOrder)
router.patch('/confirmOrder/:id',isAdmin, confirmOrder)

module.exports = router;