'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define('Tweet', {
    description: DataTypes.TEXT,
    UserId: DataTypes.INTEGER
  }, {});
  Tweet.associate = function (models) {
    Tweet.belongsTo(models.User)
    Tweet.hasMany(models.Like, { onDelete: 'cascade', hooks: true })
    Tweet.hasMany(models.Reply, { onDelete: 'cascade', hooks: true })
  };
  return Tweet;
};