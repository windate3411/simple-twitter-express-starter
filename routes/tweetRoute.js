const express = require('express')
const router = express.Router()
const { isAuthUser } = require('../config/auth')
const tweetController = require('../controllers/tweetController')

//瀏覽所有推播
router.get('/', isAuthUser, tweetController.getTweets)

// 新增一則推播
router.post('/', isAuthUser, tweetController.postTweet)

// 編輯一則推播
router.put('/:id', isAuthUser, tweetController.putTweet)

//刪除一則推播
router.delete('/:id', isAuthUser, tweetController.deleteTweet)

module.exports = router