const authorRepository = require('./author.repository.js');
const {NotFoundError} = require('../../errors')

async function createAuthor(data) {
    return authorRepository.create(data);
}

async function getAuthor(id) {
    const author = await authorRepository.findById(id);
    if (!author){
        throw new NotFoundError("Author not found");
    }
    return author;
}

async function listAuthors() {
    const authors = await authorRepository.findAll();
    if (authors < 1){
        console.log("Aucun autheur enregistré")
    }
    return authors
}

async function updateAuthor(id, data) {
    await getAuthor(id);
    return authorRepository.update(id, data);
}

async function deleteAuthor(id) {
    await getAuthor(id);
    return authorRepository.remove(id);
}

module.exports = { createAuthor, getAuthor, listAuthors, updateAuthor, deleteAuthor }; 
