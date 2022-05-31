const Offer = require("../models/offerModel");

const catchAsync = require("../utils/catchAsync")
exports.getAllOffers = catchAsync(async(req, res) => {

    const offers = await Offer.find({ stock: { $gt: 0 } } );
    res.status(200).json({
        status: 'success',
        results: offers.length,
        data: {
            offers
        }

    })
})


exports.addOffer = catchAsync(async(req, res, next) => {
    const { restaurant, product,description,stock,old_price,new_price} = req.body;

    let offer = new Offer({restaurant, product ,description,stock,old_price,new_price});
    await offer.save();
    res.status(200).json({
        status: 'success',
        data: {
            offer
        }
    })
})
exports.updateOffer= catchAsync(async(req, res, next) => {
    const {id} = req.params;
    const { restaurant, product,description,stock,old_price,new_price} = req.body;

    var updatedOffer = await Offer.findByIdAndUpdate(id, { restaurant, product ,description,stock,old_price,new_price}, { new: true, runValidators: true }) 
    res.status(200).json({
        status: 'success',
        data: {
            updatedOffer
        }
    })
})

exports.removeOffer= catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const offer= await Offer.findByIdAndRemove(id);
    if (!offer) return res.status(500).json({
        status: 'error',
        error: "no offer"
    })
    res.status(200).json({
        status: 'success',
        data: {
            offer
        }

    })
})