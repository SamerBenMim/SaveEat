const express = require("express");
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const morgan = require('morgan')
const UserRouter = require('./routes/userRoutes')
const app = express();
const cors = require('cors');
app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(mongoSanitize()) /
    app.use(xss())
app.use(hpp({ whitelist: [] }))
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})
app.use(cors())

if ((process.env.NODE_ENV === 'development')) app.use(morgan('dev'))

app.use('/api/users', UserRouter)

app.all('*', (req, res, next) => {
    const err = new Error(`can't find ${req.originalUrl}`)
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
})

module.exports = app;