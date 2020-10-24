const mongoose = require("mongoose");

const Experience = mongoose.model(
    "Experience",
    new mongoose.Schema({
        number: Number,
        name: String,
        startTime: Date,
        stopTime: Date,
        //gfp - mcherry - biofilm - light 
        //0b1111 -> 0b0000
        //15->0
        measures: Number,
        measurementDelay: Number,
        steps: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Step"
            }
        ],
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    })
);

module.exports = Experience;
