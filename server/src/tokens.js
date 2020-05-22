const { sign } = require('jsonwebtoken');

// sign function takes in payload, secretOrPrivateKey, and options/callback functions
// returns JWT as string
const createAccessToken = userId => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15min'
  });
};

const createRefreshToken = userId => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });
};

const sendAccessToken = (res, req, accessToken) => {
  res.send({
    accessToken,
    email: req.body.email
  });
};

const sendRefreshToken = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    path: '/refresh_token'
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
};
