const passport = require('./config/passport')

function ensureAuthenticated() {
  return passport.authenticate('jwt', { session: false })
}

function getUser(req) {
  return req.user;
}

module.exports = {
  ensureAuthenticated,
  getUser,
};