const db = require('../models')
const Followship = db.Followship
const User = db.User

module.exports = {
  addFollowing: async (req, res) => {
    try {
      // cannot follow himself or herself
      if (req.user.id.toString() === req.body.userId) return res.status(400).json({ status: 'error', message: 'Cannot follow yourself' })

      // check if user exists
      const user = await User.findByPk(req.body.userId)
      if (!user) return res.status(404).json({ status: 'error', message: 'No such user' })

      // check if followship has already existed
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.body.userId
        }
      })
      if (followship) return res.status(400).json({ status: 'error', message: 'Already followed' })

      await Followship.create({
        followerId: req.user.id,
        followingId: req.body.userId
      })
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: 'error', message: error })
    }
  },
  removeFollowing: async (req, res) => {
    try {
      // cannot unfollow himself or herself
      if (req.user.id.toString() === req.params.followingId) return res.status(400).json({ status: 'error', message: 'Cannot unfollow yourself' })

      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.followingId
        }
      })
      // check if followship exists
      if (!followship) return res.status(404).json({ status: 'error', message: 'Cannot find this followship' })
      // delete following record
      await followship.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error })
    }
  }
}