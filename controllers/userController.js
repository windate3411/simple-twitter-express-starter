const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../models')
const User = db.User
const Like = db.Like

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
  }
}