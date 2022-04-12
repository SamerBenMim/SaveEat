
const sendErrorDev= (err,res)=>{
    if(err.isOperational)
    res.status(err.statusCode).json({
        message:err.message,
        error:err,
        stack:err.stack

       })
       else {
           console.log(err)
           res.status(500).json( {
            status:'error',
            message:"something went wrong ! "
        })
       }
}




module.exports = (err,req ,res ,next)=>{ 
    err.statusCode = err.statusCode || 500 ;
    err.status=err.status||"error";

    //if(process.env.NODE_ENV ==='development')
     sendErrorDev(err,res)
    
}

