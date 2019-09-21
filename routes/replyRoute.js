const express = require('express')
const router = express.Router()

const replyController = require('../controllers/replyController.js')

router.put('/:reply_id', replyController.putReply) //修改 reply
router.delete('/:reply_id', replyController.deleteReply) //刪除 reply

module.exports = router