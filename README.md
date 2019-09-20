# Simple Twitter
A simple twitter API project built with Node.js, Express, and MySQL.

___

## Installation
The following instructions will get you a copy of the project and all the setting needed to run it on your local machine.


### Prerequisites

- [npm](https://www.npmjs.com/get-npm)
- [Node.js v10.16.0](https://nodejs.org/en/download/)
- [MySQL v8.0.16](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench v8.0.16](https://dev.mysql.com/downloads/workbench/)


### Clone

Clone this repository to your local machine

```
$ git clone https://github.com/smallpaes/simple-twitter-express-starter.git
```

### Setup Datebase

**Create database via MySQL Workbench**

> Run the following code
```
drop database if exists ac_twitter_workspace;
drop database if exists ac_twitter_workspace_test;
create database ac_twitter_workspace;
create database ac_twitter_workspace_test;
```

### Setup App

**1. Enter the project folder**

```
$ cd simple-twitter-express-starter
```

**2. Install packages via npm**

```
$ npm install
```

**3. Create .env file**

```
$ touch .env
```

**4. Store API Key in .env file and save**

```
JWT_SECRET=<YOUR_Client_ID>
```

**5. Edit password in config.json file**

> /config/config.json
```
"development": {
  "username": "root",
  "password": "<YOUR_WORKBENCH_PASSWORD>",
  "database": "ac_twitter_workspace",
  "host": "127.0.0.1",
  "dialect": "mysql"
},
"test": {
    "username": "root",
    "password": "<YOUR_WORKBENCH_PASSWORD>",
    "database": "ac_twitter_workspace_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  },

```

**6. Run migration**

> run the following code in the console
```
$ npx sequelize db:migrate
$ NODE_ENV=test npx sequelize db:migrate
```

**7. Activate the server**

```
$ npm run dev
```

**8. Find the message for successful activation**

```
> Example app listening on port 3000!
```
You may visit the application on browser with the URL: http://localhost:3000


### Run Test

**1. Modify scripts (Only for Widows users using console emulators like Cmder or bash)**

> /package.json
```
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js",
  "test": "set \"NODE_ENV=test\" && mocha test/*/*.js --exit --recursive --timeout 5000"
},
```

**2. Run test for the project**

```
$ npm run test
```

___


## Authors
[Mike Huang](https://github.com/smallpaes)


[DannyWang](https://github.com/windate3411)


[Tao He](https://github.com/cTaohe)