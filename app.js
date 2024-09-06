const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const path = require("path");
const dbPath = path.join(__dirname, "twitterClone.db");
let db = null;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;

// Initializing Database and Server
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => {
      console.log(`Server is Running at Port ${PORT}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

// API - 1: Register a new user
app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const getUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const previousUser = await db.get(getUserQuery);

  if (previousUser !== undefined) {
    response.status(400);
    response.send("User already exists");
    return;
  }

  if (password.length < 6) {
    response.status(400);
    response.send("Password is too short");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const addUserQuery = `INSERT INTO 
  user (name,username,password,gender)
  VALUES ('${name}','${username}','${hashedPassword}','${gender}');`;
  await db.run(addUserQuery);
  response.status(200);
  response.send("User created successfully");
});

// API - 2: Login
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const getUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const userDetails = await db.get(getUserQuery);

  if (userDetails === undefined) {
    response.status(400);
    response.send("Invalid user");
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    userDetails.password
  );

  if (!isPasswordCorrect) {
    response.status(400);
    response.send("Invalid password");
    return;
  }

  const payload = {
    username: username,
  };
  const jwtToken = jwt.sign(payload, "MY_SECRET_KEY");
  response.send({ jwtToken });
});

// GET Middleware functions
const getUserID = async (username) => {
  const get_userIdQuery = `SELECT user_id FROM user WHERE username = '${username}';`;
  const userId = await db.get(get_userIdQuery);
  if (!userId) {
    throw new Error(`User with username ${username} not found`);
  }
  return userId.user_id;
};

const authenticateToken = require("./middlewares/authenticateToken");
const isUserFollowing = require("./middlewares/isUserFollowing");

// API - 3: Latest Tweets of people whom the user follows
app.get("/user/tweets/feed/", authenticateToken, async (request, response) => {
  const { username } = request;
  const user_id = await getUserID(username);

  const getLatestTweetsQuery = `SELECT user.username, tweet.tweet, tweet.date_time AS dateTime
  FROM tweet JOIN follower ON tweet.user_id = follower.following_user_id
  JOIN user ON tweet.user_id = user.user_id
  WHERE follower.follower_user_id = ${user_id}
  ORDER BY tweet.date_time DESC
  LIMIT 4;`;
  const latestTweets = await db.all(getLatestTweetsQuery);
  response.send(latestTweets);
});

// API - 4: Names of People whom the user follow
app.get("/user/following/", authenticateToken, async (request, response) => {
  const { username } = request;
  const user_id = await getUserID(username);

  const getFollowingQuery = `SELECT user.name
  FROM user JOIN follower ON user.user_id = follower.following_user_id
  WHERE follower.follower_user_id = ${user_id};`;

  const followingList = await db.all(getFollowingQuery);
  response.send(followingList);
});

// API - 5: Names of People who follow the user
app.get("/user/followers/", authenticateToken, async (request, response) => {
  const { username } = request;
  const user_id = await getUserID(username);

  const getFollowersQuery = `SELECT user.name 
  FROM user JOIN follower ON user.user_id = follower.follower_user_id
  WHERE follower.following_user_id = ${user_id};`;

  const followersList = await db.all(getFollowersQuery);
  response.send(followersList);
});

// API - 6: Request Tweets
app.get(
  "/tweets/:tweetId/",
  authenticateToken,
  isUserFollowing,
  async (request, response) => {
    const { tweetId } = request.params;
    const getTweetDetails = `SELECT tweet.tweet AS tweet, 
    COUNT(DISTINCT like.like_id) AS likes,
    COUNT(DISTINCT reply.reply_id) AS replies,
    tweet.date_time AS dateTime
    FROM tweet LEFT JOIN like ON tweet.tweet_id = like.tweet_id
    LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
    WHERE tweet.tweet_id = ${tweetId};`;

    const tweetDetails = await db.get(getTweetDetails);
    response.send(tweetDetails);
  }
);

// API -7: Returns List of usernames who liked the tweet
app.get(
  "/tweets/:tweetId/likes",
  authenticateToken,
  isUserFollowing,
  async (request, response) => {
    const { tweetId } = request.params;
    const getUsersLiked = `SELECT user.username
    FROM like JOIN user ON like.user_id = user.user_id
    WHERE like.tweet_id = ${tweetId}`;
    const likesData = await db.all(getUsersLiked);
    const array = likesData.map((each) => each.username);
    response.send({ likes: array });
  }
);

// API - 8: Returns all replies on the tweet
app.get(
  "/tweets/:tweetId/replies",
  authenticateToken,
  isUserFollowing,
  async (request, response) => {
    const { tweetId } = request.params;
    const getRepliesQuery = `SELECT user.name as name, reply.reply as reply
    FROM user JOIN reply ON user.user_id = reply.user_id
    WHERE reply.tweet_id = ${tweetId};`;
    const replyData = await db.all(getRepliesQuery);

    const repliesList = replyData.map((each) => ({
      name: each.name,
      reply: each.reply,
    }));

    response.send({ replies: repliesList });
  }
);

// API - 9: Return list of all tweets of user
app.get("/user/tweets/", authenticateToken, async (request, response) => {
  const { username } = request;
  const user_id = await getUserID(username);

  const getAllTweetsQuery = `SELECT tweet.tweet as tweet,
  COUNT(DISTINCT like.like_id) AS likes,
  COUNT(DISTINCT reply.reply_id) AS replies,
  tweet.date_time AS dateTime
  FROM tweet LEFT JOIN like ON tweet.tweet_id = like.tweet_id
  LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
  WHERE tweet.user_id = ${user_id}
  GROUP BY tweet.tweet_id;`;

  const tweets = await db.all(getAllTweetsQuery);
  response.send(tweets);
});

// API - 10: CREATE a tweet in the tweet table
app.post("/user/tweets/", authenticateToken, async (request, response) => {
  const { username } = request;
  const { tweet } = request.body;
  const user_id = await getUserID(username);

  if (!tweet) {
    response.status(400);
    response.send("Tweet content cannot be empty");
    return;
  }

  const createTweetQuery = `INSERT INTO
  TWEET (tweet, user_id, date_time)
  VALUES ('${tweet}', ${user_id}, datetime('now'));`;

  await db.run(createTweetQuery);
  response.send("Created a Tweet");
});

// API - 11: DELETE a tweet
app.delete(
  "/tweets/:tweetId/",
  authenticateToken,
  async (request, response) => {
    const { username } = request;
    const { tweetId } = request.params;

    const user_id = await getUserID(username);

    const checkTweetOwner = `SELECT user_id FROM tweet WHERE tweet_id = ${tweetId};`;
    const tweet = await db.get(checkTweetOwner);

    if (tweet.user_id !== user_id) {
      response.status(401);
      response.send("Invalid Request");
      return;
    }

    const deleteTweetQuery = `DELETE FROM tweet WHERE tweet_id = ${tweetId};`;
    await db.run(deleteTweetQuery);
    response.send("Tweet Removed");
  }
);

module.exports = app;
