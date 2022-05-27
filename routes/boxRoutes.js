const express = require('express')
const router = express.Router();

const { getAllboxes,addBox,removeBox,updateBox} = require("../controllers/boxController")
 router.patch('/updateBox/:id', updateBox)
 router.get('/getAllBoxes', getAllboxes)
 router.post('/addBox', addBox)
 router.delete('/removeBox/:id', removeBox)

module.exports = router;