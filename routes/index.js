const userRoute = require('./userRoute')
const { ensureAuthenticated, isAuthAdmin, getUser } = require('../config/auth')

module.exports = (app) => {
  app.get('/', ensureAuthenticated, getUser, (req, res) => res.send('Hello World!'))
  app.use('/users', userRoute)
}