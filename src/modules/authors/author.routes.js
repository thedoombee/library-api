const express = require('express');
const controller = require('./author.controller');
const validate = require('../../middlewares/validate');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const { createAuthorSchema, updateAuthorSchema } = require('./author.validation')

const router = express.Router();

router.post('/', authenticate, requirePermission('authors:create'), validate(createAuthorSchema), controller.createAuthor);
router.get('/', controller.listAuthors);
router.get('/:id', controller.getAuthor);
router.patch('/:id', authenticate, requirePermission('authors:update'), validate(updateAuthorSchema), controller.updateAuthor);
router.delete('/:id', authenticate, requirePermission('authors:delete'), controller.deleteAuthor);

module.exports = router;
