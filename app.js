const express = require('express')
const bodyParser = require('body-parser')
if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }
const helpers = require('./_helpers');
const passport = require('./config/passport')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

// cors 的預設為全開放
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// setting upload-images dir
app.use('/upload', express.static(__dirname + '/upload'))

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

require('./routes/index')(app)

module.exports = app
