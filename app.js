const express = require("express")
const app = express(); // add methods to app
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp') //http params pollution.
const morgan = require('morgan')
const UserRouter = require('./routes/userRoutes')

app.use(helmet())
app.use(express.json({ limit:'10kb'})) 
app.use(mongoSanitize()) /
app.use(xss()) 
app.use(hpp({whitelist:[]})) 

app.use((req,res,next)=>{req.requestTime = new Date().toISOString(); next()})

if( (process.env.NODE_ENV==='development') ) app.use(morgan('dev'))

app.use('/api/users',   UserRouter)
app.use('/api/testRoute',UserRouter) 
app.all('*',(req,res,next)=>{ 
    const err = new Error(`can't find ${req.originalUrl}`)
    err.status='fail';
    err.statusCode= 404;
    next(err); 
    })
        
module.exports = app;