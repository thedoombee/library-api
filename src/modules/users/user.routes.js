const express = require('express');
const controller = require('./user.controller');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./user.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

module.exports = router;