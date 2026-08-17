const express = require('express');
const controller = require('./author.controller');
const validation = require('../../middlewares/validate');
const { createAuthorSchema, updateAuthorSchema } = require('./author.validation')

const router = express.Router();

const.post('/', validate(createAuthorSchema), controller.createAuthor);
const.get('/', controller.listAuthors);
const.get('/:id', controller.getAuthor);
const.patch('/:id', validate(updateAuthorSchema), controller.updateAuthor);
const.delete('/:id', controller.deleteAuthor);

module.exports = router ; 