const express = require("express");
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp') //http params pollution.
const morgan = require('morgan')
const UserRouter = require('./routes/userRoutes')

const app = express(); // add methods to app
app.use(helmet()) //protections


//dev logging
if ((process.env.NODE_ENV === 'development')) app.use(morgan('dev'))

//body Parser
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json({ limit: '10kb' }))

//data sanitization against nosql query injection && against xss
app.use(mongoSanitize()) // clean req from $ and . ====>try yo login without providing an email instead use a query injection {"$gt":""} //alawas true 

app.use(xss()) //clean  user input from html which may contain javascript 
    //prevent params pollution
app.use(hpp({
    whitelist: []
}))


app.use('/api/users', UserRouter)

app.all('*', (req, res, next) => {
    const err = new Error(`can't find ${req.originalUrl}`)
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
})

module.exports = app;