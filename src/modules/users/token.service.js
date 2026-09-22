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
async function rotateRefreshToken(rawToken, { ip } = {}) {
  if (!rawToken) throw new UnauthorizedError('Missing refresh token');

  const tokenHash = hashToken(rawToken);
  const stored = await refreshTokenRepository.findByTokenHash(tokenHash);

  if (!stored) throw new UnauthorizedError('Invalid refresh token');

  if (stored.revokedAt) {
    await refreshTokenRepository.revokeAllForUser(stored.userId);
    console.error(`SECURITY: refresh token reuse detected — user=${stored.userId} ip=${ip}`);
    throw new UnauthorizedError('Refresh token revoked due to suspected reuse. Please log in again.');
  }

  if (stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired');
  }

  const user = await userRepository.findById(stored.userId);
  if (!user) throw new UnauthorizedError('User no longer exists');

  const newAccessToken = generateAccessToken(user);
  const newRawRefreshToken = await generateRefreshToken(user, { ip });
  const newStored = await refreshTokenRepository.findByTokenHash(hashToken(newRawRefreshToken));
  await refreshTokenRepository.revoke(stored.id, { replacedByToken: newStored.id });

  return { accessToken: newAccessToken, refreshToken: newRawRefreshToken };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  issueTokenPair,
  rotateRefreshToken,
};
