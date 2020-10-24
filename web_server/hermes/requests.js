/**const db = require('../models/index');
const Step = db.step;
const Measure = db.measure;
const Capture = db.capture;
const Parameters = db.parameters;
const Experience = db.experience;
*/
const query = require('../database/queries');
const util = require('util');
let temperatures = [];
let humidities = [];
let atomiser = null;
let pwmHeater = null;
let getParam = true;
function HashTable() {
    this.hashes = {};
}

HashTable.prototype = {
    constructor: HashTable,

    put: function (key, value) {
        this.hashes[JSON.stringify(key)] = value;
    },

    get: function (key) {
        return this.hashes[JSON.stringify(key)];
    }
};
//
let keyValuePair = [
    //Arduino 011 :
    /** humidity args */
    [{ id: "001", argNumber: 0 }, "pushHumidity"],
    [{ id: "001", argNumber: 1 }, "pushHumidity"],
    [{ id: "001", argNumber: 2 }, "pushHumidity"],
    [{ id: "001", argNumber: 3 }, "pushHumidity"],
    [{ id: "001", argNumber: 4 }, "pushHumidity"],
    /** temperature args */
    [{ id: "001", argNumber: 5 }, "pushTemperature"],
    [{ id: "001", argNumber: 6 }, "pushTemperature"],
    [{ id: "001", argNumber: 7 }, "pushTemperature"],
    [{ id: "001", argNumber: 8 }, "pushTemperature"],
    [{ id: "001", argNumber: 9 }, "pushTemperature"],

    [{ id: "001", argNumber: 23 }, "pushPwmHeater"],
    [{ id: "001", argNumber: 24 }, "pushAtomiser"],
];

var mapArgFunction = new HashTable();

keyValuePair.forEach(element => {
    mapArgFunction.put(element[0], element[1]);
});

const checkAllParameters = function () {
    if ((Object.keys(humidities).length) === 5 && (Object.keys(temperatures).length) === 5 && atomiser !== null && pwmHeater !== null) {
        query.pushParameters(humidities, temperatures, atomiser, pwmHeater).then(function (parameters) {
            temperatures = [];
            humidities = [];
            atomiser = null;
            pwmHeater = null;
            return true;
        });
    } else {
        return "Parameter pushed but list is incomplete";
    }
};

const pushHumidity = function ([argNumber, argValue]) {
    if (!getParam) return;
    let index = argNumber;
    humidities[index] = argValue;
    return checkAllParameters();
};

const pushTemperature = function ([argNumber, argValue]) {
    if (!getParam) return;
    let index = argNumber - 5;
    temperatures[index] = argValue;
    return checkAllParameters();
};

    const pushAtomiser = function ([argNumber, argValue]) {
        if (!getParam) return;
        atomiser = argValue;
        return checkAllParameters();
};

const pushPwmHeater = function ([argNumber, argValue]) {
    if (!getParam) return;
    pwmHeater = argValue;
    return checkAllParameters();
};

const salut = function (args) {
    let str = ""
    args.forEach(arg => {
        console.log('Salut arg ' + arg);
        str += ('Salut arg ' + arg);
    });
    return str;
};

module.exports = {
    salut,
    exec: function (fn, args) { // string contain the name of the function to call ('a' or 'b' for example)
        return (module.exports[fn](args));
    },
    pushHumidity,
    pushAtomiser,
    pushTemperature,
    pushPwmHeater,
    computeArg: function ([id, argNumber, argValue]) {
        let key = { id: id, argNumber: parseInt(argNumber) };
        let fn = mapArgFunction.get(key);
        if (fn) {
            return this.exec(fn, [argNumber, argValue]);
        }
        console.log("No function found for key: id-arg:" + util.inspect(key, false, null, true /* enable colors */));

        return false;
    },
} 