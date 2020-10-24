const mongoose = require("mongoose");

const Measure = mongoose.model(
    "Measure",
    new mongoose.Schema({
        date: Date,
        plateEColi: String,
        platePaeru: String,
        plateBiofilm: String,
        plateLight: String,
        capturesEColi: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Capture"
            }
        ],
        capturesPaeru: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Capture"
            }
        ],
        capturesBiofilm: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Capture"
            }
        ],
        capturesLight: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Capture"
            }
        ]
    })
);

module.exports = Measure;
