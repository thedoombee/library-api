const express = require('express');
const controller = require('./author.controller');
const validate = require('../../middlewares/validate');
const { createAuthorSchema, updateAuthorSchema } = require('./author.validation')

const router = express.Router();

router.post('/', validate(createAuthorSchema), controller.createAuthor);
router.get('/', controller.listAuthors);
router.get('/:id', controller.getAuthor);
router.patch('/:id', validate(updateAuthorSchema), controller.updateAuthor);
router.delete('/:id', controller.deleteAuthor);

module.exports = router ; 