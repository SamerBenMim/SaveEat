const express = require('express')
const dotenv = require('dotenv');
const router = express.Router();

const { addOrder,getAllOrders } = require("../controllers/orderController")
router.post('/addOrder', addOrder)
// router.patch('/updateItem', updateItem)
// router.get('/getAllItems', getAllItems)
router.get('/getAllOrders', getAllOrders)
// router.get('/removeItem/:id', removeItem)
module.exports = router;