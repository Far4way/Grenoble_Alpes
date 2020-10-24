const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        password: String,
        roles: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Role"
            }
        ]
    })
);

module.exports = User;
