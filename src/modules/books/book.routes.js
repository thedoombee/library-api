const express = require('express');
const controller = require('./book.controller');
const validate = require('../../middlewares/validate');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const { createBookSchema, listBooksSchema, updateBookSchema } = require('./book.validation');

const router = express.Router();

router.post('/', authenticate, requirePermission('books:create'), validate(createBookSchema), controller.createBook);
router.get('/', validate(listBooksSchema), controller.listBooks);
router.get('/:id', controller.getBook);
router.patch('/:id', authenticate, requirePermission('books:update'), validate(updateBookSchema), controller.updateBook);
router.delete('/:id', authenticate, requirePermission('books:delete'), controller.deleteBook);

module.exports = router;
