const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const authorRoutes = require('./modules/authors/author.routes');
const bookRoutes = require('./modules/books/book.routes');
const usersRoutes = require('./modules/users/user.routes')

const app = express();

app.use(express.json()); 

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);
app.use('/users', usersRoutes)

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;