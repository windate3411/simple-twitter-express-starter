const db = require('../models')
const Tweet = db.Tweet


const tweetController = {
  //瀏覽所有推播
  getTweets: async (req, res) => {
    try {
      const tweets = await Tweet.findAll()
      return res.json({ status: 'success', tweets, message: 'Successfully getting the tweets' })
    } catch (error) {
      return res.json({ status: 'error', message: error })
    }
  },
  //新增一則推播
  postTweet: async (req, res) => {
    try {
      //若推播內容為空或是大於140字元則報錯
      if (!req.body.description || Number(req.body.description.length) > 140) {
        return res.json({ status: 'error', message: "invalid tweet content" })
      } else {
        await Tweet.create({
          description: req.body.description,
          UserId: req.user.id
        });
        return res.json({ status: 'success', message: "new tweet has been successfully created" })
      }
    } catch (error) {
      return res.json({ status: 'error', message: error })
    }
  },
  //編輯一則推播
  putTweet: async (req, res) => {
    try {
      if (!req.body.description || Number(req.body.description.length) > 140) {
        return res.json({ status: 'error', message: "invalid tweet content" })
      } else {

        const tweet = await Tweet.findByPk(req.params.id)

        //若找不到指定的推播則報錯
        if (tweet === null) {
          return res.json({ status: 'error', message: "tweet was not found" })
        }

        //若非本人則報錯
        if (req.user.id != tweet.UserId) {
          return res.json({ status: 'error', message: "you are not authorized to do this action" })
        }

        tweet.update(req.body)
        return res.json({ status: 'success', message: "category was successfully  updated" })
      }

    } catch (error) {
      return res.json({ status: 'error', message: error })
    }
  },
  //刪除一則推播
  deleteTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id)

      //若找不到指定的推播則報錯
      if (tweet === null) {
        return res.json({ status: 'error', message: "tweet was not found" })
      }

      //若非本人則報錯
      if (req.user.id != tweet.UserId) {
        return res.json({ status: 'error', message: "you are not authorized to do this action" })
      }

      tweet.destroy()
      return res.json({ status: 'success', message: "tweet was successfully destoryed" })
    } catch (error) {
      return res.json({ status: 'error', message: error })
    }
  }
}

module.exports = tweetController