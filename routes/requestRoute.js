const express = require('express')
const { sentRequest, getUserRequests, getAllRequests } = require('../controllers/requestController')
const { verifyToken } = require('../middleware/auth')
const router  = express.Router()
router.post('/sentRequest',verifyToken,sentRequest)
router.get('/getUserRequests',verifyToken,getUserRequests)
router.get('/getAllRequests',getAllRequests)
module.exports = router