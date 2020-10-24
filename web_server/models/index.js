const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user");
db.role = require("./role");
db.capture = require("./capture");
db.experience = require("./experience");
db.measure = require("./measure");
db.parameters = require("./parameters");
db.product = require("./product");
db.step = require("./step");
db.well = require("./well");

db.ROLES = ["user", "admin"];

module.exports = db;