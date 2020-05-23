require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const { hash, compare } = require('bcryptjs');
const { fakeDB } = require('./fakeDB');
const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
} = require('./tokens');
const { isAuth } = require('./isAuth');

// 1. Register an user
// 2. Login an user
// 3. Logout an user
// 4. Set up a protected route
// 5. Get a new accesstoken with a refresh token

const app = express();

//Use express middleware for easier cookie handling
app.use(cookieParser());

// Setting origin = only requests from that specific origin will be allowed
// Setting credentials to true, means that headers will be passed
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

// Need to be able to read body data
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // supports url-encoded bodies

// Register an user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log(fakeDB);
  try {
    // Check if User exists
    const user = fakeDB.find(user => user.email === email);

    //If User exists, throw an error
    if (user) {
      throw new Error('User already exists');
    }
    // if User doesn't exist, hash the password
    const hashedPassword = await hash(password, 10);
    // insert User in the "database"
    fakeDB.push({ id: fakeDB.length, email, password: hashedPassword });
    res.status(200).send({ message: 'User Created!' });
    console.log(fakeDB);
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
  }
});

//Login an user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in "database", and if user doesn't exist, send an error
    const user = fakeDB.find(user => user.email === email);
    if (!user) {
      throw new Error('Invalid email');
    }
    // Compare crypted password and see if it checks out, send error if it doesn't
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid email/password');
    }
    // If email and password are correct, create refresh and access token
    const accesstoken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    // Put the refresh token in the "database"
    user.refreshToken = refreshToken;
    console.log(user);
    // console.log(fakeDB);

    // Send refresh token as a cookie, and accesstoken as a regular response
    sendRefreshToken(res, refreshToken);
    sendAccessToken(res, req, accesstoken);
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
  }
});

// Logout an user
app.post('/logout', (_req, res) => {
  // clear refresh token from the cookie
  res.clearCookie('refreshToken', { path: '/refresh_token' });

  res.status(200).send({
    message: 'Logged Out!'
  });
});

// Protected Router

app.post('/protected', async (req, res) => {
  try {
    const userID = isAuth(req);
    if (userID !== null) {
      res.send({
        data: 'This is protected data.'
      });
    }
  } catch (err) {
    res.status(400).send({
      message: err.message
    });
  }
});

// Get a new access token with a refresh token
app.post('/refresh_token', (req, res) => {
  // Possible because of cookie parser
  const token = req.cookies.refreshToken;
  // console.log(req.cookies)
  // If we don't have a token in our request
  if (!token) {
    // console.log('NO TOKEN IN REQUEST');
    return res.send({ accesstoken: '' });
  }
  // otherwise we have a token, so need to verify
  let payload = null;

  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    res.send({
      accesstoken: ''
    });
  }

  // at this point, the token is valid
  const user = fakeDB.find(user => user.id === payload.userId);
  if (!user) {
    res.send({ accesstoken: '' });
  }
  // User exists, check if refreshtoken exists on user
  console.log(user);
  if (user.refreshToken !== token) {
    return res.send({ accesstoken: '' });
  }

  // Token exists, create new refresh and access token
  const accesstoken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  user.refreshToken = refreshToken;

  // Send new refreshtoken and access token
  sendRefreshToken(res, refreshToken);

  return res.status(200).send({
    accesstoken
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
