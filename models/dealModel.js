const mongoose = require('mongoose');
const Order = require("../models/orderModel");

const dealSchema = new mongoose.Schema({  
    customer:{
        type : mongoose.Schema.ObjectId, ref: 'User',
        required: [true, "please provide a customer"],

    },
    offer:{
        type : mongoose.Schema.ObjectId, ref: 'Offer',
        required: [true, "please provide an offer"],

    },


    customer_phone: {
        type: String,
    },

    customer_address: {
        type: String,
    },

    status :{
        type: String,
        default:"submitted",
        enum: ['submitted', 'confirmed',"declined"],
    },


    quantity: { 
        type : Number,
        default:1,
    },


})
     // validate:{
        //     validator : function(el){ // this only works on save and create
        //         return el===this.password;
        //     },message:"passwords are not the same"
        // },
    /*

    q deals< q offre
    offre crud
    get deals
    get dealas
    get number of orders , get number of deals*/
    dealSchema.pre('save', async function(next) {
        const stock = await this.populate("offer")
        if(this.quantity>stock.offer.stock){
            this.quantity=stock.offer.stock
        }
        next()
    })

const Deal = mongoose.model('Deal', dealSchema)
module.exports = Deal;