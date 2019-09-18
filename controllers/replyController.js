const db = require('../models')
const Reply = db.Reply

const replyController ={
  // reply 的 user 可以修改 reply
  putReply: async (req, res) => {
    try {
      //找到 reply
      let comment = await Reply.findByPk(req.params.reply_id)
      // 確認是否是 reply 的發布者
      if (req.user.id !== comment.UserId) {
        return res.status(400).json({ status: 'error', message: 'you are not authorized to do this action.' })
      }
      //如果不是空白就可以修正
      if (!req.body.comment) {
        return res.status(400).json({ status: 'error', message: 'comment can not be empty.' })
      }
      await comment.update({comment: req.body.comment})
      return res.status(201).json({ status: 'success', message: 'reply has been successfully edited.' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  // 刪除 reply
  deleteReply: async (req, res) => {
    try {
      // 找 reply
      let comment = await Reply.findByPk(req.params.reply_id)
      // 確認是否有權限刪除
      if ((req.user.id !== comment.UserId) && (req.user.role !== 'Admin')) {
        return res.status(400).json({ status: 'error', message: 'you are not authorized to do this action.' })
      }
      await comment.destroy()
      return res.status(202).json({status: 'success', message: 'reply was successfully destroyed'})
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  }
}

module.exports = replyController