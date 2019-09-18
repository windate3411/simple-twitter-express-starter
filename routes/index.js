const userRoute = require('./userRoute')
const tweetRoute = require('./tweetRoute')
const { isAuthUser, isAuthAdmin } = require('../config/auth')

module.exports = (app) => {
  app.get('/', isAuthUser, (req, res) => res.send('Hello World!'))
  app.use('/users', userRoute)
  app.use('/tweets', tweetRoute)
}