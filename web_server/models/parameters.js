const mongoose = require("mongoose");

const Parameters = mongoose.model(
    "Parameters",
    new mongoose.Schema({
        pwmHeater: Number,
        atomiser: Boolean,
        temperatures: [Number],
        humidities: [Number],
        date: Date
    })
);

module.exports = Parameters;
