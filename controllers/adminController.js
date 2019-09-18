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
        return res.json(tweets)
      }
      return res.json({stauts: 'error', message: 'you are not a admin.'})
    } catch (error) {
      console.log(error)
    }
  },
  // 刪除其他使用者的推文
  deleteTweet: async (req, res) => {
    try {
      let tweet = await Tweet.findByPk(req.params.id)
      if (!tweet) {
        return res.json({stauts: 'error', message: 'tweet was not found.'})
      }
      if (req.user.role !== 'Admin') {
        return res.json({stauts: 'error', message: 'you are not authorized to do this action.'})
      }
      await tweet.destroy()
      return res.json({status: 'success', message: 'tweet was successfully destoryed.'})
    } catch (error) {
      console.log(error)
    }
  },
  // 看見站內所有的使用者
  getUsers: async (req, res) => {
    try {
      let users = await User.findAll()
      // 確認是否是 admin
      if (req.user.role !== 'Admin') {
        return res.json({stauts: 'error', message: 'you are not a admin.'})
      }
      return res.json(users)
    } catch (error) {
      console.log(error)
    }
  }
}
module.exports = adminController