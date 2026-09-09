const express = require('express');
const controller = require('./user.controller');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('./user.validation');

const router = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     description: Create a new user account and return a JWT token.
 *     operationId: register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Azerty123
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Alice Dupont
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request payload
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', validate(registerSchema), controller.register);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login
 *     description: Authenticate a user and return a JWT token.
 *     operationId: login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Azerty123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', validate(loginSchema), controller.login);

module.exports = router;