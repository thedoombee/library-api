const bookService = require('./book.service.js')

async function createBook(req, res, next) {
    try {
        const book = await bookService.createBook(req.body);
        res.status(201).json(book);
    } catch (error) {
        next(err);
    }
}

async function getBook(req, res, next) {
    try {
        const book = await bookService.getBook(req.params.id);
        res.status(200).json(book);
    } catch (error) {
        next(err);
    }
}

async function listBooks(req, res, next) {
    try {
        const books = await bookService.listBooks(req.query);
        res.status(200).json(books);
    } catch (error) {
        next(error);   
    }
}
async function deleteBook(req, res, next) {
    try {
        await bookService.deleteBook(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(err);
    }
}

module.exports = { createBook, getBook, listBooks, deleteBook }