const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const refreshTokenRepository = require('./refreshToken.repository');

const REFRESH_TOKEN_EXPIRATION_DAYS = 7;
const REFRESH_TOKEN_BYTES = 40;

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.TOKEN_EXPIRATION,
    }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function generateRefreshToken(user, { ip } = {}) {
  const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt,
    createdByIp: ip,
  });

  return rawToken;
}

async function issueTokenPair(user, { ip } = {}) {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, { ip });

  return {
    accessToken,
    refreshToken,
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  issueTokenPair,
};
