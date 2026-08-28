const userService = require('./user.service');

async function register(req, res, next) {
  try {
    const { user, token } = await userService.register(req.body);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { user, token } = await userService.login(req.body);
    res.status(200).json({ user, token });
  } catch (err) { next(err); }
}

module.exports = { register, login };