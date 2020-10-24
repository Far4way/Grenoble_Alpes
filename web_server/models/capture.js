const mongoose = require("mongoose");

const Capture = mongoose.model(
    "Capture",
    new mongoose.Schema({
        group: String,
        name: String,
        intensity: Number,
        path: String
    })
);

module.exports = Capture;
