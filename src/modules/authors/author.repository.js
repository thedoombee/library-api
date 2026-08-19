const prisma = require('../../config/database.js');

async function create(data) {
    return prisma.author.create({data});
}

async function findById(id) {
    return prisma.author.findUnique({
        where: {id}
    });
}

async function findAll() {
    return prisma.author.findMany({
        orderBy: {
            name: 'asc'
        }
    });
}

async function update(id, data) {
    return prisma.author.update({
        where: {id},
        data
    });
}

async function remove(id) {
    return prisma.author.remove({
        where: {id}
    });
}

module.exports = {create, findById, findAll, update, remove};