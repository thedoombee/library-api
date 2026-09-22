const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('./user.repository');
const { ConflictError, UnauthorizedError } = require('../../errors');
const env = require('../../config/env');
const SALT_ROUNDS = 10;
const tokenService = require('./token.service.js')


async function register({ email, password, name }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ email, passwordHash, name });

  const tokens = await tokenService.issueTokenPair(user, { ip });
  return { user, ...tokens };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await tokenService.issueTokenPair(user, { ip });
  const { passwordHash, ...safeUser } = user; 
  return { user: safeUser, ...token };
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const stored = await refreshTokenRepository.findByTokenHash(tokenService.hashToken(rawRefreshToken));
  if (stored && !stored.revokedAt) {
    await refreshTokenRepository.revoke(stored.id);
  }
}

module.exports = { register, login };
