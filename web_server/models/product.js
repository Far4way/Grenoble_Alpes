const mongoose = require("mongoose");

const Product = mongoose.model(
    "Product",
    new mongoose.Schema({
        name: String,
        volume: String,
        concentration: String
    })
);

module.exports = Product;
