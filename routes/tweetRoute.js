const express = require('express')
const router = express.Router()
const tweetController = require('../controllers/tweetController')

//瀏覽所有推播
router.get('/', tweetController.getTweets)


// 新增一則推播
router.post('/', tweetController.postTweet)

// 編輯一則推播
router.put('/:id', tweetController.putTweet)


//刪除一則推播
router.delete('/:id', tweetController.deleteTweet)

module.exports = router
