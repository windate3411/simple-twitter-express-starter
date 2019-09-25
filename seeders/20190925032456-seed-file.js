'use strict';
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      name: 'root',
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', 10),
      avatar: faker.image.avatar(),
      role: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'user1',
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', 10),
      avatar: faker.image.avatar(),
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'user2',
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', 10),
      avatar: faker.image.avatar(),
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})

    return queryInterface.bulkInsert('Tweets',
      Array.from({ length: 20 }).map(data => ({
        UserId: Math.ceil(Math.random() * 3),
        description: faker.lorem.sentence(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    return queryInterface.bulkDelete('Tweets', null, {})
  }
};
