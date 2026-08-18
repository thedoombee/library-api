const bookRepository = require('./book.repository');
const authorRepository = require('../authors/author.repository');
const { NotFoundError } = require('../../errors');

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

async function deleteBook(id) {
    await getBook(id);
    return bookRepository.remove(id);
}

module.exports = { createBook, getBook, listBooks };