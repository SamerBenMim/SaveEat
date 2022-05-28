// confirm order

// submit order

// decline

//list order //declined
const Order = require("../models/orderModel");
const catchAsync = require("./../utils/catchAsync")

exports.addOrder = catchAsync(async(req, res, next) => {
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
exports.confirmOrder = catchAsync(async(req, res) => {
    const {id} = req.params
    const confirmedOrder = await Order.findByIdAndUpdate(id, { status: "confirmed"}, { new: true, runValidators: true }) //new return the updated obj 
    res.status(200).json({
        status: 'success',
        data: {
            confirmedOrder
        }

    })
})
exports.declineOrder = catchAsync(async(req, res) => {
    const {id} = req.params
    const declinededOrder = await Order.findByIdAndUpdate(id, { status: "declined"}, { new: true, runValidators: true })
    res.status(200).json({
        status: 'success',
        data: {
            declinededOrder
        }

    })
})