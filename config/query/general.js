module.exports = {
  Tweet: {
    UserId: '(SELECT COUNT(*) FROM Tweets WHERE Tweets.UserId = User.id)'
  },
  Like: {
    UserId: '(SELECT COUNT(*) FROM Likes WHERE Likes.UserId = User.id)',
    TweetId: '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)',
    TweetIdUserId: '(SELECT COALESCE(SUM((SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweets.id)),0) FROM Tweets WHERE Tweets.UserId = User.id )'
  },
  FollowShip: {
    FollowerId: '(SELECT COUNT(*) FROM Followships WHERE Followships.followerId = User.id)',
    FollowingId: '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
  },
  Reply: {
    TweetId: '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
  },
  UserIntro: {
    UserId: '(SELECT SUBSTR(introduction, 1, 50) FROM Users WHERE User.id = Users.id)'
  }
}