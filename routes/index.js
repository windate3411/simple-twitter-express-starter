const userRoute = require('./userRoute')
const { isAuthUser, isAuthAdmin } = require('../config/auth')

module.exports = (app) => {
  app.get('/', isAuthUser, (req, res) => res.send('Hello World!'))
  app.use('/users', userRoute)
}