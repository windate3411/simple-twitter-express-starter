const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Sequelize = require('sequelize')

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
    // serve query based on current environment
    if (process.env.heroku) {
      queryTweet = '(SELECT COUNT(*) FROM "Tweets" WHERE "Tweets"."UserId" = "User"."id")'
      queryLike = '(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."UserId" = "User"."id")'
      queryFollowing = '(SELECT COUNT(*) FROM "Followships" WHERE "Followships"."followerId" = "User"."id")'
      queryFollower = '(SELECT COUNT(*) FROM "Followships" WHERE "Followships"."followingId" = "User"."id")'
    } else {
      queryTweet = '(SELECT COUNT(*) FROM Tweets WHERE Tweets.UserId = User.id)'
      queryLike = '(SELECT COUNT(*) FROM Likes WHERE Likes.UserId = User.id)'
      queryFollowing = '(SELECT COUNT(*) FROM Followships WHERE Followships.followerId = User.id)'
      queryFollower = '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
    }

    try {
      // 確認是否是 admin
      if (req.user.role !== 'Admin') {
        return res.status(401).json({ stauts: 'error', message: 'you are not a admin.' })
      }
      // get user data
      const users = await User.findAll({
        attributes: [
          'name', 'id', 'avatar', 'role',
          [Sequelize.literal(queryTweet), 'tweetCount'],
          [Sequelize.literal(queryLike), 'likeCount'],
          [Sequelize.literal(queryFollowing), 'FollowingCount'],
          [Sequelize.literal(queryFollower), 'followerId']
        ],
        order: Sequelize.literal('tweetCount DESC')
      })
      return res.status(200).json({ status: 'success', users })
    } catch (error) {
      return res.status(500).json({ stauts: 'error', message: error })
    }
  }
}
module.exports = adminController
