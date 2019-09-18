const express = require('express')
const router = express.Router()

const followshipController = require('../controllers/followshipController')

router.post('/', followshipController.addFollowing)
router.delete('/:followingId', followshipController.removeFollowing)

module.exports = router
