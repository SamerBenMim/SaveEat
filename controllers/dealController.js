const Deal = require("../models/dealModel");

const catchAsync = require("../utils/catchAsync")



exports.getAllDeals = catchAsync(async(req, res) => {

    const deals = await Deal.find().populate("customer offer");
    res.status(200).json({
        status: 'success',
        results: deals.length,
        data: {
            deals
        }

    })
})


exports.addDeal = catchAsync(async(req, res, next) => {
    const { offer,customer_phone ,customer_address,status,quantity} = req.body;
    const customer=req.user.id
    let deal = new Deal({offer, customer,customer_phone ,customer_address,status,quantity});
    await deal.save();
    res.status(200).json({
        status: 'success',
        data: {
            deal
        }
    })
 })
// exports.updateOffer= catchAsync(async(req, res, next) => {
//     const {id} = req.params;
//     const { restaurant, product,customer_phone ,customer_address,description,stock,old_price,new_price} = req.body;

//     var updatedOffer = await Offer.findByIdAndUpdate(id, { restaurant, product,customer_phone ,customer_address,description,stock,old_price,new_price}, { new: true, runValidators: true }) 
//     res.status(200).json({
//         status: 'success',
//         data: {
//             updatedOffer
//         }
//     })
// })

exports.removeDeal= catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const deal= await Deal.findByIdAndRemove(id);
    if (!deal) return res.status(500).json({
        status: 'error',
        error: "no deal"
    })
    res.status(200).json({
        status: 'success',
        data: {
            deal
        }

    })
})


exports.getMyDeals = catchAsync(async(req, res) => {
    console.log('first')
    const customer = req.user.id
    const deals = await Deal.find({customer:customer}).populate("offer");
    res.status(200).json({
        status: 'success',
        results: deals.length,
        data: {
            deals
        }

    })
})

exports.confirmDeal = catchAsync(async(req, res) => {
    const {id} = req.params
    const confirmedDeal = await Deal.findByIdAndUpdate(id, { status: "confirmed"}, { new: true, runValidators: true }) //new return the updated obj 
    res.status(200).json({
        status: 'success',
        data: {
            confirmedDeal
        }

    })
})
exports.declineDeal = catchAsync(async(req, res) => {
    const {id} = req.params
    const declinedDeal = await Deal.findByIdAndUpdate(id, { status: "declined"}, { new: true, runValidators: true })
    res.status(200).json({
        status: 'success',
        data: {
            declinedDeal
        }

    })
})
