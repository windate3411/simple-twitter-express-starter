const express = require('express')
const router = express.Router()
const { ensureAuthenticated, getUser } = require('../config/auth')
const userController = require('../controllers/userController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })


router.post('/signup', userController.signUp)
router.post('/login', userController.logIn)
router.get('/:id/tweets', ensureAuthenticated, getUser, userController.getUserTweets)
router.get('/:id/edit', ensureAuthenticated, getUser, userController.getEditUserPage)
router.post('/:id/edit', ensureAuthenticated, getUser, upload.single('avatar'), userController.editUser)
router.get('/:id/likes', ensureAuthenticated, getUser, userController.getLikes)
router.get('/:id/followings', userController.getFollowings)
router.get('/current_user', ensureAuthenticated, getUser, userController.getCurrentUser)

module.exports = router