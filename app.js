const express = require("express")
const app = express(); // add methods to app
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp') //http params pollution.
const morgan = require('morgan')
app.use(helmet()) //protections


    //dev logging
    if( (process.env.NODE_ENV==='development') ) app.use(morgan('dev'))

    //body Parser
    app.use(express.json({ limit:'10kb'})) 
    
    //data sanitization against nosql query injection && against xss
    app.use(mongoSanitize()) // clean req from $ and . ====>try yo login without providing an email instead use a query injection {"$gt":""} //alawas true 
   
    app.use(xss()) //clean  user input from html which may contain javascript 
    //prevent params pollution
    app.use(hpp({          
        whitelist:[]
    })) 


    app.use((req,res,next)=>{
        req.requestTime = new Date().toISOString(); //adds time to req
        next()
    })
    
    // app.use('/api/v1/tours',TourRouter)
    // app.use('/api/v1/users',UserRouter)
   /* 
    app.all('*',(req,res,next)=>{ // all methods get post .. & all routers // to catch errors
        // res.status(404).json({
            //     status:"fail",
            //     message:`can't find ${req.originalUrl}`
            // })
            
            const err = new Error(`can't find ${req.originalUrl}`)
            err.status='fail';
            err.statusCode= 404;
            next(err); // if we pass anything to next it is an error it will neglegt other middlewares  and goes to Error middlware
        })
        */
//app.use(globalErrorHandler)
    module.exports = app;