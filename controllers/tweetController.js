const db = require('../models')
const User = db.User
const Reply = db.Reply
const Like = db.Like
const Tweet = db.Tweet
const Sequelize = require('sequelize')
const customQuery = process.env.heroku ? require('../config/query/heroku') : require('../config/query/general')

const tweetController = {
  //瀏覽所有推播
  getTweets: async (req, res) => {
    const currentUser = req.user
    try {
      const tweets = await Tweet.findAll({
        include: [{
          model: User,
          attributes: [
            'name',
            'id',
            'avatar',
          ]
        }],
        attributes: [
          'id',
          'createdAt',
          'description',
          [Sequelize.literal(customQuery.Like.TweetId), 'LikesCount'],
          [Sequelize.literal(customQuery.Reply.TweetId), 'RepliesCount']
        ],
        order: [['createdAt', 'DESC']]
      })

      let popularUsers = await User.findAll({
        attributes: [
          'name',
          'avatar',
          'introduction',
          [Sequelize.literal(customQuery.FollowShip.FollowingId), 'FollowerCount'],
          'id'
        ],
        order: [[Sequelize.literal(customQuery.FollowShip.FollowingId), 'DESC']],
        limit: 10
      })
      const popularUsersData = popularUsers.map(user => ({
        ...user.dataValues,
        isFollowing: currentUser.Followings.map(following => following.id).includes(user.id)
      }))

      return res.status(202).json({ status: 'success', tweets, popularUsersData, message: 'Successfully getting the tweets' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  //新增一則推播
  postTweet: async (req, res) => {
    try {
      //若推播內容為空或是大於140字元則報錯
      if (!req.body.description || Number(req.body.description.length) > 140) {
        return res.status(400).json({ status: 'error', message: "invalid tweet content" })
      } else {
        const tweet = await Tweet.create({
          description: req.body.description,
          UserId: req.user.id
        });
        //存下tweet_id以便前端使用
        const tweet_id = tweet.id
        return res.status(201).json({ status: 'success', tweet_id, message: "new tweet has been successfully created" })
      }
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  //編輯一則推播
  putTweet: async (req, res) => {
    try {
      if (!req.body.description || Number(req.body.description.length) > 140) {
        return res.status(400).json({ status: 'error', message: "invalid tweet content" })
      } else {

        const tweet = await Tweet.findByPk(req.params.tweet_id)

        //若找不到指定的推播則報錯
        if (tweet === null) {
          return res.status(404).json({ status: 'error', message: "tweet was not found" })
        }

        //若非本人則報錯
        if (req.user.id != tweet.UserId) {
          return res.status(401).json({ status: 'error', message: "you are not authorized to do this action" })
        }

        try {
          await tweet.update(req.body)
          return res.status(202).json({ status: 'success', message: "category was successfully  updated" })
        } catch (error) {
          return res.status(500).json({ status: 'error', message: error })
        }
      }

    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  //刪除一則推播
  deleteTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.tweet_id)

      //若找不到指定的推播則報錯
      if (tweet === null) {
        return res.status(404).json({ status: 'error', message: "tweet was not found" })
      }

      //若非本人則報錯
      if (req.user.id != tweet.UserId) {
        return res.status(401).json({ status: 'error', message: "you are not authorized to do this action" })
      }

      try {
        await tweet.destroy()
        return res.status(200).json({ status: 'success', message: "tweet was successfully destoryed" })
      } catch (error) {
        return res.status(500).json({ status: 'error', message: error })
      }

    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  // 取得 tweet 的 replies
  getReplies: async (req, res) => {
    try {
      // 取得 tweet 和 replies
      let tweet = await Tweet.findByPk(req.params.tweet_id, {
        include: [
          {
            model: Reply,
            include: [{ model: User, attributes: ['name', 'avatar'] }]
          },
          {
            model: User,
            attributes: [
              'id',
              'name',
              'avatar',
              'introduction',
              [Sequelize.literal(customQuery.Tweet.UserId), 'TweetsCount'],
              [Sequelize.literal(customQuery.FollowShip.FollowerId), 'FollowingCount'],
              [Sequelize.literal(customQuery.FollowShip.FollowingId), 'FollowerCount'],
              [Sequelize.literal(customQuery.Like.UserId), 'LikeCount']
            ]
          }
        ],
        attributes: [
          'id',
          'UserId',
          'description',
          [Sequelize.literal(customQuery.Like.TweetId), 'LikesCount'],
          [Sequelize.literal(customQuery.Reply.TweetId), 'RepliesCount']
        ]
      })
      // 如果 tweet 不存在
      if (!tweet) {
        return res.status(400).json({ status: 'error', message: 'tweet was not found.' })
      }
      const { User: userData, ...tweetData } = tweet.dataValues
      const isFollowing = req.user.Followings.map(following => following.id).includes(userData.id)
      userData.dataValues.isFollowing = isFollowing
      return res.status(200).json({ status: 'success', tweetData, userData, message: 'successfully get tweet and replies.' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  postReplies: async (req, res) => {
    try {
      if (!req.body.comment) {
        return res.status(400).json({ status: 'error', message: 'comment can not be empty.' })
      }
      const tweet_id = req.params.tweet_id

      // check if the tweet exists
      const tweet = await Tweet.findByPk(req.params.tweet_id)
      if (!tweet) return res.status(404).json({ status: 'error', message: 'No such tweet' })
      // create new reply to the tweet
      await Reply.create({
        comment: req.body.comment,
        TweetId: tweet_id,
        UserId: req.user.id
      })
      return res.status(201).json({ status: 'success', tweet_id, message: 'new reply has been successfully created.' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  // like tweet
  addLike: async (req, res) => {
    try {
      // check if tweet exists
      const tweet = await Tweet.findByPk(req.params.tweetId)
      if (!tweet) return res.status(404).json({ status: 'error', message: 'Cannot find the tweet' })

      // check if it's a duplicate like
      const likeRecord = await Like.findOne({
        where: {
          UserId: req.user.id,
          TweetId: req.params.tweetId
        }
      })
      if (likeRecord) return res.status(400).json({ status: 'error', message: 'Already liked this tweet' })

      // add new like record
      await Like.create({
        UserId: req.user.id,
        TweetId: req.params.tweetId
      })
      return res.status(201).json({ status: 'success', message: 'Successfully liked the tweet!' })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  },
  // unlike tweet
  removeLike: async (req, res) => {
    try {
      const likeRecord = await Like.findOne({
        where: {
          UserId: req.user.id,
          TweetId: req.params.tweetId
        }
      })

      // check if like record exists
      if (!likeRecord) return res.status(404).json({ status: 'error', message: 'Cannot find this like record' })

      // destroy record
      await likeRecord.destroy()
      return res.status(200).json({ status: 'success', message: "Successfully unlike the tweet" })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  }
}

module.exports = tweetController