module.exports = {
  Tweet: {
    UserId: '(SELECT COUNT(*) FROM Tweets WHERE Tweets.UserId = User.id)'
  },
  Like: {
    UserId: '(SELECT COUNT(*) FROM Likes WHERE Likes.UserId = User.id)',
    TweetId: '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
  },
  FollowShip: {
    FollowerId: '(SELECT COUNT(*) FROM Followships WHERE Followships.followerId = User.id)',
    FollowingId: '(SELECT COUNT(*) FROM Followships WHERE Followships.followingId = User.id)'
  },
  Reply: {
    TweetId: '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
  }
}