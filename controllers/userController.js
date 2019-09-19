const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Like = db.Like
const Tweet = db.Tweet
const Reply = db.Reply
const Sequelize = require('sequelize')

module.exports = {
  signUp: async (req, res) => {
    // check for empty input
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: 'All fields are required' })
    }
    // validate password
    if (req.body.password !== req.body.passwordCheck) {
      return res.json({ status: 'error', message: 'Two passwords do not match' })
    }

    try {
      // check if it's a unique user
      const user = await User.findOne({ where: { email: req.body.email } })
      if (user) {
        return res.json({ status: 'error', message: 'Existing email account' })
      }

      // create user
      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        role: 'User'
      })
      return res.json({ status: 'success', message: 'Successfully sign up' })
    } catch (error) {
      res.json({ status: 'error', message: error })
    }
  },
  logIn: async (req, res) => {
    // check for empty field
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: 'Email and password are required' })
    }
    // check if user exists and password is correct
    const { email: userName, password: password } = req.body
    const user = await User.findOne({ where: { email: userName } })
    if (!user) return res.status(401).json({ status: 'error', message: 'User does not exist' })
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: 'error', message: 'Incorrect password' })
    }
    // generate and provide user with a token
    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    return res.json({
      status: 'success', message: 'Successfully sign up', token, user: {
        id: user.id, name: user.name, email: user.email, role: user.role
      }
    })
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, { include: [Tweet] })
      const tweets = user.Tweets
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'cant find the user' })
      }
      return res.status(200).json({ status: 'success', user, tweets, message: 'Successfully get user profile' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  getUserPage: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id)

      //if user not found
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'cant find the user' })
      }

      //if not current user
      if (req.user.id != user.id) {
        return res.status(401).json({ status: 'error', message: "you are not authorized to do this action" })
      }

      return res.status(200).json({
        status: 'success',
        user: { id: user.id, name: user.name, introduction: user.introduction, avatar: user.avatar },
        message: 'Successfully get to edit profile page'
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  editUserPage: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id)

      //if user not found
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'cant find the user' })
      }

      //if not current user
      if (req.user.id != user.id) {
        return res.status(401).json({ status: 'error', message: "you are not authorized to do this action" })
      }

      // check for empty field
      if (!req.body.name) {
        return res.status(400).json({ status: 'error', message: 'you must enter your name' })
      }

      try {
        const { file } = req
        //if a file is uploaded
        if (file) {
          imgur.setClientID(IMGUR_CLIENT_ID);
          imgur.upload(file.path, async (err, img) => {
            await user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.avatar
            })
            return res.status(200).json({
              status: 'success',
              message: 'Successfully update the profile page'
            })
          })
        } else {
          await user.update(req.body)
          return res.status(200).json({
            status: 'success',
            message: 'Successfully update the profile page'
          })
        }
      } catch (error) {
        return res.status(500).json({ status: 'error', message: error })
      }
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  getLikes: async (req, res) => {
    try {
      if (process.env.heroku) {
        queryLike = '(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."TweetId" = "Tweet"."id")'
        queryReply = '(SELECT COUNT(*) FROM "Replies" WHERE "Replies"."TweetId" = "Tweet"."id")'
      } else {
        queryLike = '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
        queryReply = '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
      }


      let likes = await Like.findAll({
        where: {
          UserId: req.params.userId
        },
        include: [
          {
            model: Tweet,
            include: [
              User
            ],
            attributes: [
              [Sequelize.literal(queryLike), 'LikesCount'],
              [Sequelize.literal(queryReply), 'RepliesCount']
            ]
          }
        ]
      })
      return res.json({ status: 'success', likes })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  }
}