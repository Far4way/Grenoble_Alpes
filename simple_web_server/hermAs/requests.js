const util = require('util');
let temperatures = [];
let humidities = [];
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
    //match an Id, and an argnumber to a function to execute
    [{id: "001", argNumber: 0}, "pushHumidity"],
    [{id: "001", argNumber: 5}, "pushTemperature"],
];

var mapArgFunction = new HashTable();

keyValuePair.forEach(element => {
    mapArgFunction.put(element[0], element[1]);
});

const checkAllParameters = function () {
    if ((Object.keys(humidities).length) === 1 && (Object.keys(temperatures).length) === 1) {
        return true;
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

const hello = function (args) {
    let str = ""
    args.forEach(arg => {
        console.log('Hello arg ' + arg);
        str += ('Hello arg ' + arg);
    });
    return str;
};

module.exports = {
    hello,
    exec: function (fn, args) { // string contain the name of the function to call ('a' or 'b' for example)
        return (module.exports[fn](args));
    },
    pushHumidity,
    pushTemperature,
    //Function to be called to execute stuff considering the argument returned by a specific arduino
    computeArg: function ([id, argNumber, argValue]) {
        let key = {id: id, argNumber: parseInt(argNumber)};
        let fn = mapArgFunction.get(key);
        if (fn) {
            return this.exec(fn, [argNumber, argValue]);
        }
        console.log("No function found for key: id-arg:" + util.inspect(key, false, null, true /* enable colors */));
        return false;
    },
};