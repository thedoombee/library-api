const express = require('express');
const controller = require('./book.controller');
const validate = require('../../middlewares/validate');
const { createBookSchema, listBooksSchema } = require('./book.validation');

const router = express.Router();

router.post('/', validate(createBookSchema), controller.createBook);
router.get('/', validate(listBooksSchema), controller.listBooks);
router.get('/:id', controller.getBook);
router.delete('/:id', controller.deleteBook);

module.exports = router;