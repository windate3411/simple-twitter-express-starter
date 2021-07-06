const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models')
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Like = db.Like
const Tweet = db.Tweet
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Followship = db.Followship
const customQuery = process.env.heroku ? require('../config/query/heroku') : require('../config/query/general')

module.exports = {
  signUp: async (req, res) => {
    // check for empty input
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: 'All fields are required' })
    }
    // check if password length is between 8-12
    if (req.body.password.length < 8 || req.body.password.length > 12) {
      return res.json({ status: 'error', message: 'Password should be between 8-12' })
    }
    // validate password
    if (req.body.password !== req.body.passwordCheck) {
      return res.json({ status: 'error', message: 'Two passwords do not match' })
    }

    try {
      // check if it's a unique user name and email
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: req.body.email },
            { name: req.body.name }
          ]
        }
      })

      if (user) {
        return res.json({ status: 'error', message: 'Existing email or user name' })
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
      status: 'success', message: 'Successfully log in', token, user: {
        id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar
      }
    })
  },
  getUserTweets: async (req, res) => {
    //get curentUser data
    const currentUser = req.user
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'name', 'avatar', 'introduction']
      })
      const tweets = await user.getTweets({
        attributes: [
          'id',
          'UserId',
          'createdAt',
          'description',
          [Sequelize.literal(customQuery.Like.TweetId), 'LikesCount'],
          [Sequelize.literal(customQuery.Reply.TweetId), 'RepliesCount']
        ],
        order: [['createdAt', 'DESC']]
      })
      //get counts for user_profile
      const tweetsCount = await user.countTweets()
      const followersCount = await user.countFollowers()
      const followingsCount = await user.countFollowings()
      const likesCount = await user.countLikes()

      //add isFollowing to user data
      const userData = {
        ...user.dataValues,
        isFollowing: currentUser.Followings.map(following => following.id).includes(user.id)
      }

      if (!user) {
        return res.status(400).json({ status: 'error', message: 'cant find the user' })
      }
      return res.status(200).json({ status: 'success', userData, tweets, tweetsCount, followersCount, followingsCount, likesCount, message: 'Successfully get user profile' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  getEditUserPage: async (req, res) => {
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
  editUser: async (req, res) => {
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

      //check for unique user
      try {
        const user_check = await User.findOne({
          where: [{ name: req.body.name }]
        })
        //if name is already in database & not the current user name
        if (user_check && user.name !== req.body.name) {
          return res.json({ status: 'error', message: 'Existing user name' })
        }
      } catch (error) {
        return res.status(500).json({ status: 'error', message: error })
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
      // get user data
      const user = await User.findByPk(req.params.id, {
        attributes: [
          'id', 'avatar', 'introduction', 'name',
          [Sequelize.literal(customQuery.Like.UserId), 'LikesCount'],
          [Sequelize.literal(customQuery.Tweet.UserId), 'TweetsCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowerId), 'FollowingCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowingId), 'FollowerCount'],
        ]
      })

      if (!user) return res.status(404).json({ status: 'error', message: 'No such user' })

      // get liked tweets
      const likes = await Like.findAll({
        where: {
          UserId: req.params.id
        },
        include: [
          {
            model: Tweet,
            include: [
              { model: User, attributes: ['name', 'avatar'] }
            ],
            attributes: [
              'createdAt', 'id', 'createdAt',
              [Sequelize.literal(customQuery.Like.TweetId), 'LikesCount'],
              [Sequelize.literal(customQuery.Reply.TweetId), 'RepliesCount']
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      })
      const isFollowing = req.user.Followings.map(following => following.id).includes(user.id)
      user.dataValues.isFollowing = isFollowing
      return res.json({ status: 'success', likes, user })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  },
  getFollowings: async (req, res) => {
    try {
      // 找 followings
      let user = await User.findByPk(req.params.id, {
        include: [
          {
            model: User, as: 'Followings',
            attributes: [
              'id', 'name', 'avatar',
              [Sequelize.literal(customQuery.UserIntro.UserId), 'introduction']
            ],
          }
        ],
        attributes: [
          'id', 'name', 'avatar', 'introduction',
          [Sequelize.literal(customQuery.Tweet.UserId), 'TweetsCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowerId), 'FollowingCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowingId), 'FollowerCount'],
          [Sequelize.literal(customQuery.Like.UserId), 'LikeCount']
        ],
        // 按照 following 時間排序
        order: [[{ model: User, as: 'Followings' }, Followship, 'createdAt', 'DESC']]
      })
      // check if user exists
      if (!user) return res.status(404).json({ status: 'error', message: 'No such user' })
      // retrieve user profile data
      const { Followings, ...userData } = user.dataValues
      // check if user has been followed
      const followshipData = user.Followings.map(followship => ({
        ...followship.dataValues,
        isFollowed: req.user.Followings.map(data => data.id).includes(followship.id)
      }))
      const isFollowing = req.user.Followings.map(following => following.id).includes(user.id)
      userData.isFollowing = isFollowing
      return res.status(200).json({ status: 'success', userData, followshipData, message: 'successfully get the information.' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  getFollowers: async (req, res) => {
    try {
      // 找 followings
      let user = await User.findByPk(req.params.id, {
        include: [
          {
            model: User, as: 'Followers',
            attributes: [
              'id', 'name', 'avatar',
              [Sequelize.literal(customQuery.UserIntro.UserId), 'introduction']
            ],
          }
        ],
        attributes: [
          'id', 'name', 'avatar', 'introduction',
          [Sequelize.literal(customQuery.Tweet.UserId), 'TweetsCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowerId), 'FollowingCount'],
          [Sequelize.literal(customQuery.FollowShip.FollowingId), 'FollowerCount'],
          [Sequelize.literal(customQuery.Like.UserId), 'LikeCount']
        ],
        // 按照 following 時間排序
        order: [[{ model: User, as: 'Followers' }, Followship, 'createdAt', 'DESC']]
      })
      // check if user exists
      if (!user) return res.status(404).json({ status: 'error', message: 'No such user' })
      // retrieve user profile data
      const { Followers, ...userData } = user.dataValues
      // check if user has been followed
      const followshipData = user.Followers.map(followship => ({
        ...followship.dataValues,
        isFollowed: req.user.Followings.map(data => data.id).includes(followship.id)
      }))
      const isFollowing = req.user.Followings.map(following => following.id).includes(user.id)
      userData.isFollowing = isFollowing
      return res.status(200).json({ status: 'success', userData, followshipData, message: 'successfully get the information.' })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error })
    }
  },
  getCurrentUser: (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role
    })
  }
}