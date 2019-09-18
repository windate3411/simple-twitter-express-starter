const db = require('../models')
const Followship = db.Followship

module.exports = {
  addFollowing: async (req, res) => {
    try {
      // cannot follow himself or herself
      if (req.user.id.toString() === req.body.userId) return res.json({ status: 'error', message: 'Cannot follow yourself' })

      await Followship.create({
        followerId: req.user.id,
        followingId: req.body.userId
      })
      return res.json({ status: 'success' })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  },
  removeFollowing: async (req, res) => {
    try {
      // cannot unfollow himself or herself
      if (req.user.id.toString() === req.params.followingId) return res.json({ status: 'error', message: 'Cannot unfollow yourself' })

      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.followingId
        }
      })
      // delete following record
      await followship.destroy()
      return res.json({ status: 'success' })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  }
}