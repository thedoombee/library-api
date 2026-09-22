const userService = require('./user.service');
const env = require('../../config/env.js')


const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/users',
};

async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await userService.register(req.body, { ip: req.ip });
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({ user, accessToken });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await userService.login(req.body, { ip: req.ip });
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ user, accessToken });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const tokenService = require('./token.service');
    const tokens = await tokenService.rotateRefreshToken(req.cookies?.refreshToken, { ip: req.ip });
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await userService.logout(req.cookies?.refreshToken);
    res.clearCookie('refreshToken', { path: '/users' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout };