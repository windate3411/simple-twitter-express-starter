const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like

const tweetController = {
  //瀏覽所有推播
  getTweets: async (req, res) => {
    try {
      const tweets = await Tweet.findAll()
      return res.status(202).json({ status: 'success', tweets, message: 'Successfully getting the tweets' })
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
          Reply, 
          {model: User, include: [
            Tweet,
            Like,
            {model: User, as: 'Followers'},
            {model: User, as: 'Followings'}
          ]}
        ]
      })
      // 如果 tweet 不存在
      if (!tweet) {
        return res.status(400).json({status: 'error', message: 'tweet was not found.'})
      }
      return res.status(200).json(tweet)
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  postReplies: async (req, res) => {
    try {
      if (!req.body.comment) {
        return res.status(400).json({status: 'error', message: 'comment can not be empty.'})
      } else {
        await Reply.create({
          comment: req.body.comment,
          TweetId: req.body.TweetId,
          UserId: req.user.id
        })
        return res.status(201).json({status: 'success', message: 'new tweet has been successfully created.'})
      }
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  }
}

module.exports = tweetController