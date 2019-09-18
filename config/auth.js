const helper = require('./_helpers')
const passport = require('./passport')

module.exports = {
  ensureAuthenticated: helper.ensureAuthenticated(),
  getUser: (req, res, next) => {
    req.user = helper.getUser(req)
    next()
  },
  isAuthAdmin: (req, res, next) => {
    if (!req.user) return res.json({ status: 'error', message: 'Permission denied' })
    if (req.user.role !== 'Admin') return res.json({ status: 'error', message: 'Permission denied' })
    next()
  }
}