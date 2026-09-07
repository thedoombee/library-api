const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const authorRoutes = require('./modules/authors/author.routes');
const bookRoutes = require('./modules/books/book.routes');
const usersRoutes = require('./modules/users/user.routes')
const loanRoutes = require('./modules/loans/loan.routes')
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(express.json()); 

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many authentication attempts, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path === '/health',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

app.use(apiLimiter);
app.use('/users/login', authLimiter);
app.use('/users/register', authLimiter);

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);
app.use('/users', usersRoutes);
app.use('/loans', loanRoutes)

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
