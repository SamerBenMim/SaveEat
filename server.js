const mongoose = require('mongoose')
const dotenv=require('dotenv'); 
const app= require("./app")

dotenv.config({path :'./config.env'})




process.on('uncaughtException',err=>{
    console.log("unhandled Exception ,shutting down",err.name,err.message)
    console.log(err)
    if(server)
    server.close(()=>{
    process.exit(1); 
   }) 
})

var server = app.listen(process.env.PORT||3000,()=>{
    console.log('app running on port '+ process.env.PORT);
});




const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB).then(() => {
    console.log("db connexion successful !!");
})

process.on('unhandledRejection',err =>{ 
    console.log('unhandled Rejection',err.name,err.message)
    server.close(()=>{
        process.exit(1); 
       }) })


