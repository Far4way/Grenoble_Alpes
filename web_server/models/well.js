const mongoose = require("mongoose");

const Well = mongoose.model(
    "Well",
    new mongoose.Schema({
        group: String,
        column: Number,
        line: Number,
        products: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Product"
            }
        ]
    })
);

module.exports = Well;
