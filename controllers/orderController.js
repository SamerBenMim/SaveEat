// confirm order

// submit order

// decline

//list order //declined
const Order = require("../models/orderModel");
const catchAsync = require("./../utils/catchAsync")

exports.addOrder = catchAsync(async(req, res, next) => {
    console.log("orrder")
    const { boxes , customer_phone,customer_address } = req.body;
    const customer = req.user.id
    
    let order = new Order({customer,customer_phone, customer_address,boxes});

    await order.save({runValidators:false});
    res.status(200).json({
        status: 'success',
        data: {
            order
        }

    })
})

exports.getAllOrders = catchAsync(async(req, res) => {
    const orders = await Order.find().populate("boxes customer");
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }

    })
})