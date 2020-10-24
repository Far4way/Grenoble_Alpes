const mongoose = require("mongoose");

const Step = mongoose.model(
    "Step",
    new mongoose.Schema({
        startTime: Date,
        stopTime: Date,
        rpmAgitation: Number,
        humidity: Number,
        temperature: Number,
        wells: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Well"
            }
        ],
        parameters: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Parameters"
            }
        ],
        measures: [{
            type: mongoose.Schema.ObjectId,
            ref: "Measure"
        }]
    })
);

module.exports = Step;
