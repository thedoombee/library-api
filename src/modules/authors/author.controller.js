const authorService = require('./author.service.js');

async function createAuthor(req, res, next) {
    try {
        const author = await authorService.createAuthor(req.body);
        res.status(201).json(author);
    } catch (error) {
        next(error);
    }
}

async function getAuthor(req, res, next) {
    try {
        const author = await authorService.getAuthor(req.params.id)
        res.status(200).json(author);
    } catch (error) {
        next(error);
    }
    
}

async function listAuthors(req, res, next) {
    try {
        const authors = await authorService.listAuthors();
        res.status(200).json(authors);
    } catch (error) {
        next(err);
    }
}

async function updateAuthor(req, res, next) {
    try {
        const author = await authorService.updateAuthor(req.params.id, req.body);
        res.status(200).json(author);
    } catch (error) {
        next(error);
    }
}

async function deleteAuthor(req, res, next) {
    try {
        await authorService.deleteAuthor(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    } 
}

module.exports = {createAuthor,getAuthor,listAuthors, updateAuthor, deleteAuthor};