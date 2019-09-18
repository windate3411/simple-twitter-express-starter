const db = require('../models')
const Tweet = db.Tweet
const User = db.User

const adminController = {
  // 看見站內所有的推播 (設為後台首頁)
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll()
      // 確認是否是 admin
      if(req.user.role === 'Admin') {
        return res.status(200).json({ status: 'success', tweets })
      }
      return res.status(401).json({stauts: 'error', message: 'you are not a admin.'})
    } catch (error) {
      return res.status(500).json({stauts: 'error', message: error})
    }
  },
  // 刪除其他使用者的推文
  deleteTweet: async (req, res) => {
    try {
      let tweet = await Tweet.findByPk(req.params.id)
      if (!tweet) {
        return res.status(400).json({stauts: 'error', message: 'tweet was not found.'})
      }
      if (req.user.role !== 'Admin') {
        return res.status(401).json({stauts: 'error', message: 'you are not authorized to do this action.'})
      }
      await tweet.destroy()
      return res.status(202).json({status: 'success', message: 'tweet was successfully destoryed.'})
    } catch (error) {
      return res.status(500).json({stauts: 'error', message: error})
    }
  },
  // 看見站內所有的使用者
  getUsers: async (req, res) => {
    try {
      let users = await User.findAll()
      // 確認是否是 admin
      if (req.user.role !== 'Admin') {
        return res.status(401).json({stauts: 'error', message: 'you are not a admin.'})
      }
      return res.status(200).json({ status: 'success', users })
    } catch (error) {
      return res.status(500).json({stauts: 'error', message: error})
    }
  }
}
module.exports = adminController
