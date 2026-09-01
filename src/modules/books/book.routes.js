const express = require('express');
const controller = require('./book.controller');
const validate = require('../../middlewares/validate');
const { authenticate, requirePermission } = require('../../middlewares/authMiddleware');
const { createBookSchema, listBooksSchema } = require('./book.validation');

const router = express.Router();

router.post('/', authenticate, requirePermission('books:create'), validate(createBookSchema), controller.createBook);
router.get('/', validate(listBooksSchema), controller.listBooks);
router.get('/:id', controller.getBook);
router.delete('/:id', authenticate, requirePermission('books:delete'), controller.deleteBook);

module.exports = router;
