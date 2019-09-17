const passport = require('./passport')

module.exports = {
  isAuthUser: passport.authenticate('jwt', { session: false }),
  isAuthAdmin: (req, res, next) => {
    if (!req.user) return res.json({ status: 'error', message: 'Permission denied' })
    if (req.user.role !== 'Admin') return res.json({ status: 'error', message: 'Permission denied' })
    next()
  }
}