const mongoose = require('mongoose')
const dotenv = require('dotenv');

//handle unhandled exception globally
process.on('uncaughtException', err => {
    console.log("unhandled Exception ,shutting down", err.name, err.message)
    console.log(err)
    if (server)
        server.close(() => {
            process.exit(1); // we should terminate the app because instable state
        })
})

dotenv.config({ path: './config.env' })
const app = require("./app")


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB).then(() => {
    console.log("db connexion successful !!");
})


var server = app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`)
});

//handle unhandled rejection globally ( example : wrong password bd)
process.on('unhandledRejection', err => { //subscribe to that event 'unhandledRejection'
    console.log('unhandled Rejection', err.name, err.message)
    server.close(() => {
        process.exit(1); // 0 sucess  /  1 uncaught exception
    })
})