const Box = require("../models/boxModel");

const catchAsync = require("./../utils/catchAsync")
exports.getAllboxes = catchAsync(async(req, res) => {

    const boxes = await Box.find().populate("items");
    res.status(200).json({
        status: 'success',
        results: boxes.length,
        data: {
            boxes
        }

    })
})


exports.addBox = catchAsync(async(req, res, next) => {
    const { category, subCategory,price ,items} = req.body;

    let box = new Box({ category, subCategory,price,items });
    await box.save();
    res.status(200).json({
        status: 'success',
        data: {
            box
        }
    })
})
exports.updateBox= catchAsync(async(req, res, next) => {
    const { id} = req.params;
    const {category,subCategory,price,items}=req.body
    const box = await Box.findById(id);
    if (!box) return res.status(500).json({
        status: 'error',
        error: "no box chosen"
    })
    var updatedbox = await Box.findByIdAndUpdate(box._id, { category: category, subCategory: subCategory , price:price, items:items}, { new: true, runValidators: true }) //new return the updated obj 
    res.status(200).json({
        status: 'success',
        data: {
            updatedbox
        }
    })
})

exports.removeBox= catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const box= await Box.findByIdAndRemove(id);
    if (!box) return res.status(500).json({
        status: 'error',
        error: "no box"
    })
    res.status(200).json({
        status: 'success',
        data: {
            box
        }

    })
})