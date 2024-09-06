# Twitter API Clone

This project is a backend clone of Twitter, built using Node.js, Express, SQLite, and JSON Web Tokens (JWT). It provides RESTful APIs for user registration, authentication, and various Twitter-like functionalities such as tweeting, following users, liking, replying, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [License](#license)

## Features

- **User Registration & Authentication**: Users can register, log in, and get authenticated using JWT tokens.
- **Follow/Unfollow Users**: Users can follow and unfollow other users.
- **Tweeting**: Users can create tweets, view tweets from people they follow, and manage their own tweets.
- **Likes and Replies**: Users can like and reply to tweets, and view who liked or replied to tweets.
- **CORS Support**: The server is configured to allow Cross-Origin Resource Sharing (CORS) to enable secure cross-origin requests.

## Tech Stack

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for creating API routes and handling middleware.
- **SQLite**: Lightweight, file-based relational database for storing user and tweet data.
- **bcrypt**: Library for hashing passwords.
- **jsonwebtoken (JWT)**: Used for user authentication and authorization.
- **cors**: Middleware to handle CORS issues.

## Setup

### Prerequisites

- **Node.js** and **npm** installed on your machine.
- **SQLite3** installed.

### Run the Server

Make sure you have SQLite3 installed, and run the server using Node.js. The server will start on `http://localhost:3000` (or the specified `PORT` in your environment).

### Database Initialization

The server uses an SQLite database named `twitterClone.db` located in the root directory. Ensure this file is present, or the application will create one during startup.

## Deployment

The Node.js project has been deployed at: [https://twitter-api-clone-demo.vercel.app/](https://twitter-api-clone-demo.vercel.app/).

Since there is no frontend for this project, you can use **Postman** or any API testing tool to interact with the API endpoints. You can log in with the demo credentials to view or test other APIs:

- **Username**: `JoeBiden`
- **Password**: `biden@123`

## API Endpoints

### User Authentication

- **POST** `/register/`: Register a new user.
- **POST** `/login/`: Login for existing users.

### User Actions

- **GET** `/user/tweets/feed/`: Returns the latest tweets of users followed by the authenticated user.
- **GET** `/user/following/`: Returns a list of users the authenticated user is following.
- **GET** `/user/followers/`: Returns a list of users who follow the authenticated user.
- **POST** `/user/tweets/`: Creates a new tweet for the authenticated user.
- **GET** `/user/tweets/`: Returns all tweets of the authenticated user.

### Tweet Actions

- **GET** `/tweets/:tweetId/`: Returns the details of a specific tweet.
- **GET** `/tweets/:tweetId/likes`: Returns a list of users who liked the tweet.
- **GET** `/tweets/:tweetId/replies`: Returns all replies on the tweet.
- **DELETE** `/tweets/:tweetId/`: Deletes a tweet created by the authenticated user.

## Middleware

- **Authentication Middleware**: Validates JWT tokens for protected routes.
- **Authorization Middleware**: Checks if the authenticated user is following the tweet's owner for certain routes.

## Error Handling

- Proper error messages and status codes are sent for invalid user input, unauthorized actions, and other errors.
