const bookRepository = require('./book.repository');
const authorRepository = require('../authors/author.repository');
const { NotFoundError, ConflictError } = require('../../errors');

async function createBook(data) {

  for (const authorId of data.authorIds) {
    const author = await authorRepository.findById(authorId);
    if (!author) throw new NotFoundError(`Author ${authorId} not found`);
  }
  return bookRepository.create(data);
}

async function getBook(id) {
  const book = await bookRepository.findById(id);
  if (!book) throw new NotFoundError('Book not found');
  return book;
}

async function listBooks(query) {
  return bookRepository.findMany(query);
}
async function updateBook(id, data) {
  const book = await getBook(id);

  if (data.authorIds) {
    for (const authorId of data.authorIds) {
      const author = await authorRepository.findById(authorId);
      if (!author) throw new NotFoundError(`Author ${authorId} not found`);
    }
  }

  if (data.totalCopies !== undefined) {
    const borrowedCopies = book.totalCopies - book.availableCopies;
    if (data.totalCopies < borrowedCopies) {
      throw new ConflictError('Total copies cannot be lower than borrowed copies');
    }
    data.availableCopies = data.totalCopies - borrowedCopies;
  }

  return bookRepository.update(id, data);
}

async function deleteBook(id) {
    await getBook(id);
    return bookRepository.remove(id);
}

module.exports = { createBook, getBook, listBooks, updateBook,deleteBook };
