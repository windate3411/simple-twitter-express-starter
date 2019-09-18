const express = require('express')
const bodyParser = require('body-parser')
if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }
const helpers = require('./_helpers');
const passport = require('./config/passport')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

require('./routes/index')(app)

module.exports = app
