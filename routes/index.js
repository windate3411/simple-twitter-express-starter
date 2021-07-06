const userRoute = require('./userRoute')
const tweetRoute = require('./tweetRoute')
const adminRoute = require('./adminRoute')
const replyRoute = require('./replyRoute')
const followshipRoute = require('./followshipRoute')
const { ensureAuthenticated, isAuthAdmin, getUser } = require('../config/auth')

module.exports = (app) => {
  app.get('/', ensureAuthenticated, getUser, (req, res) => res.send('Hello World!'))
  app.use('/users', userRoute)
  app.use('/tweets', ensureAuthenticated, getUser, tweetRoute)
  app.use('/admin', ensureAuthenticated, getUser, isAuthAdmin, adminRoute)
  app.use('/replies', ensureAuthenticated, getUser, replyRoute)
  app.use('/followships', ensureAuthenticated, getUser, followshipRoute)
}