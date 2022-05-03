const express = require('express')
const dotenv = require('dotenv');
const router = express.Router();
const { getAllItems, updateItem, addItem, getItemsCategory, removeItem } = require("../controllers/itemController")
router.post('/addItem', addItem)
router.patch('/updateItem', updateItem)
router.get('/getAllItems', getAllItems)
router.get('/getItemsCategory/:category', getItemsCategory)
router.get('/removeItem/:id', removeItem)
module.exports = router;