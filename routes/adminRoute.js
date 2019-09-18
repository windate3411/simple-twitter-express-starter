const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/tweets', adminController.getTweets) // get tweets
router.delete('/tweets/:id', adminController.deleteTweet) // delete tweet
router.get('/users', adminController.getUsers) // get users

module.exports = router