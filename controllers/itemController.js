const Item = require("../models/item");
const catchAsync = require("./../utils/catchAsync")

exports.getAllItems = catchAsync(async(req, res) => {

    const items = await Item.find();
    res.status(200).json({
        status: 'success',
        results: items.length,
        data: {
            items
        }

    })
})

exports.getItemsCategory = catchAsync(async(req, res) => {
    const { category } = req.params
    const items = await Item.find({ category: category }).exec();
    res.status(200).json({
        status: 'success',
        results: items.length,
        data: {
            items
        }

    })
})
exports.addItem = catchAsync(async(req, res, next) => {
    const { name, category } = req.body;
    let item = new Item({ name, category });
    itemExist = await Item.findOne({ 'name': name });
    if (itemExist) {
        return res.status(200).json({
            status: 'error',
            error: "This item exists already"
        })
    }
    await item.save();
    res.status(200).json({
        status: 'success',
        data: {
            item
        }

    })
})
exports.updateItem = catchAsync(async(req, res, next) => {
    const { id, name, category } = req.body;
    const item = await Item.findById(id);
    if (!item) return res.status(500).json({
        status: 'error',
        error: "no item chosen"
    })
    var updatedItem = await Item.findByIdAndUpdate(item._id, { name: name, category: category }, { new: true, runValidators: true }) //new return the updated obj 
    res.status(200).json({
        status: 'success',
        data: {
            updatedItem
        }

    })
})

exports.removeItem = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const item = await Item.findByIdAndRemove(id);
    if (!item) return res.status(500).json({
        status: 'error',
        error: "no item "
    })
    res.status(200).json({
        status: 'success',
        data: {
            item
        }

    })
})