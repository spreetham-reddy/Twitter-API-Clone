const isUserFollowing = async (request, response, next) => {
  const { username } = request;
  const { tweetId } = request.params;
  const user_id = await getUserID(username);

  const followingQuery = `SELECT 1
    FROM follower JOIN tweet ON follower.following_user_id = tweet.user_id
    WHERE follower.follower_user_id = ${user_id} AND tweet.tweet_id = ${tweetId};`;
  const following = await db.get(followingQuery);

  if (following === undefined) {
    response.status(401);
    response.send("Invalid Request");
    return;
  }

  next();
};

module.exports = isUserFollowing;
