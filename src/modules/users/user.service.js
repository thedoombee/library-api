const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('./user.repository');
const { ConflictError, UnauthorizedError } = require('../../errors');
const env = require('../../config/env');

const SALT_ROUNDS = 10;


async function register({ email, password, name }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ email, passwordHash, name });

  const token = generateToken(user);
  return { user, token };
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

  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user; 
  return { user: safeUser, token };
}

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role }, 
    env.JWT_SECRET,
    { expiresIn: env.TOKEN_EXPIRATION }
  );
}

module.exports = { register, login };