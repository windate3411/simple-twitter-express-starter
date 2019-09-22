const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Sequelize = require('sequelize')
const customQuery = process.env.heroku ? require('../config/query/heroku') : require('../config/query/general')

const adminController = {
  // 看見站內所有的推播 (設為後台首頁)
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll()
      // 確認是否是 admin
      if (req.user.role === 'Admin') {
        return res.status(200).json({ status: 'success', tweets })
      }
      return res.status(401).json({ stauts: 'error', message: 'you are not a admin.' })
    } catch (error) {
      return res.status(500).json({ stauts: 'error', message: error })
    }
  },
  // 刪除其他使用者的推文
  deleteTweet: async (req, res) => {
    try {
      let tweet = await Tweet.findByPk(req.params.id)
      if (!tweet) {
        return res.status(400).json({ stauts: 'error', message: 'tweet was not found.' })
      }
      if (req.user.role !== 'Admin') {
        return res.status(401).json({ stauts: 'error', message: 'you are not authorized to do this action.' })
      }
      await tweet.destroy()
      return res.status(202).json({ status: 'success', message: 'tweet was successfully destoryed.' })
    } catch (error) {
      return res.status(500).json({ stauts: 'error', message: error })
    }
  },
  // 看見站內所有的使用者
  getUsers: async (req, res) => {
    try {
      // 確認是否是 admin
      if (req.user.role !== 'Admin') {
        return res.status(401).json({ stauts: 'error', message: 'you are not a admin.' })
      }
      // get user data
      const users = await User.findAll({
        include: [
          {
            model: Tweet,
            attributes: [
              'id',
              'description',
              [Sequelize.literal('(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweets.id)'), 'countLike']
            ]
          }
        ],
        attributes: [
          'name', 'id', 'avatar', 'role',
          [Sequelize.literal(customQuery.Tweet.UserId), 'tweetCount'],
          [Sequelize.literal(customQuery.Like.UserId), 'likeCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowerId), 'FollowingCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowingId), 'followerId'],
          [Sequelize.literal('(SELECT SUM((SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweets.id)) FROM Tweets  WHERE Tweets.UserId = User.id )'), 'totalLikes']
        ],
        order: Sequelize.literal('tweetCount DESC')
      })
      return res.status(200).json({ status: 'success', users })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ stauts: 'error', message: error })
    }
  }
}
module.exports = adminController
