const express = require('express')
const router = express.Router()
const { ensureAuthenticated, getUser } = require('../config/auth')
const userController = require('../controllers/userController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })


router.post('/signup', userController.signUp)
router.post('/login', userController.logIn)
router.get('/:id/tweets', ensureAuthenticated, getUser, userController.getUser)
router.get('/:id/edit', ensureAuthenticated, getUser, userController.getUserPage)
router.post('/:id/edit', ensureAuthenticated, getUser, upload.single('avatar'), userController.editUserPage)
router.get('/:userId/likes', ensureAuthenticated, getUser, userController.getLikes)
router.get('/current_user', ensureAuthenticated, getUser, userController.getCurrentUser)

module.exports = router