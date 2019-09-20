const express = require('express')
const router = express.Router()
const { ensureAuthenticated, isAuthAdmin, getUser } = require('../config/auth')
const userController = require('../controllers/userController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })


router.post('/signup', userController.signUp)
router.post('/login', userController.logIn)
router.get('/:id/tweets', ensureAuthenticated, userController.getUser)
router.get('/:id/edit', ensureAuthenticated, userController.getUserPage)
router.post('/:id/edit', ensureAuthenticated, upload.single('avatar'), userController.editUserPage)
router.get('/:userId/likes', userController.getLikes)
router.get('/likes', ensureAuthenticated, userController.getLikeCount)

module.exports = router