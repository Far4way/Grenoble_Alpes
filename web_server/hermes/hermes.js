const usb = require('usb')
const SerialPort = require('serialport');
SerialPort.Binding = require('@serialport/bindings');
const ByteLength = require('@serialport/parser-byte-length');
const request = require('./requests');
let arduinoDevices = [];
let motorsInitialized = false;

init = function () {
    return new Promise(function (resolve) {

        let _id = parseInt("100", 2);
        SerialPort.list().then(function (ports) {
            ports.forEach(device => {

                switch (device.vendorId) {
                case "1a86": //Arduino Nano counterfeit

                    if (device.productId === "7523") arduinoDevices.push(new Arduino(device));
                    break
                case "2341": //Arduino Mega (not counterfeit ?)
                    if (device.productId === "0042") arduinoDevices.push(new Arduino(device));
                    break
                default:
                    break
                }
            });
            arduinoDevices.forEach((element, index) => {
                element.serial.on('open', function () {
                    console.log('Port ' + element.device.path + ' ouvert!');
                });
                element.parser.once('data', function (data) {
                    element.id = getId(element.readBin(data));
                });
                resolve(arduinoDevices);
            });
        });
    });
};

function startControl(humidity, temperature) {
    let id = "001";
    let typeMess = "10";
    let typeReq = "010";
    let varHumidity = "001100" //TODO : to be determined
    let varTemperature = "001101" //TODO: to be determined
    let spacer = "00";
    humidity = parseInt(humidity * 100).toString(2).padStart(16, '0');
    temperature = parseInt(temperature * 100).toString(2).padStart(16, '0');
    //set 1 argument : humidity
    let setHumidity = id + typeMess + typeReq + varHumidity + spacer + humidity;
    //set 1 argument : temperature
    let setTemperature = id + typeMess + typeReq + varTemperature + spacer + temperature;
    //add in the waiting list
    let addFunction = id + typeMess + "100" + "000000" + "00000" + "1" + "000000000000"; //TODO revérifier tout ça



    sendBin(arduinoDevices, setHumidity);
    sendBin(arduinoDevices, setTemperature);
    sendBin(arduinoDevices, addFunction);
}

function stopControl() {
    let id = "011";
    let removeFunction = id + "10" + "" //pareil
    sendBin(arduinoDevices, removeFunction);
    //remove from the waiting list
}



function startMotorsInitialization() {
    return new Promise(function (resolve) {
        sendHex(arduinoDevices, "34001005");
        console.log("Initialization");
        console.log(motorsInitialized);
        function checkInitialization() {
            if (motorsInitialized) {
                console.log(motorsInitialized);
                resolve();
            } else {
                setTimeout(checkInitialization, 500);
                console.log(motorsInitialized);
            }
        }
        checkInitialization();
    });
}

function startAgitation(rpmAgitation) {
    let stringMessage = "3204" + Math.floor(rpmAgitation).toString(16).padStart(4, '0');
    if (!motorsInitialized) {
        startMotorsInitialization().then(function () {
            motorsInitialized = true;
            console.log(stringMessage);
            sendHex(arduinoDevices, stringMessage);
            sendHex(arduinoDevices, "32080000");
            sendHex(arduinoDevices, "32200000");
            sendHex(arduinoDevices, "34041000");
        });
    } else {
        sendHex(arduinoDevices, "32080000");
        sendHex(arduinoDevices, "32200000");
        sendHex(arduinoDevices, "34041000");
    }
}

function stopAgitation() {
    sendHex(arduinoDevices, "36040000");
    motorsInitialized = false
}

function computeAckFunctionMessage(message) {
    let ardId = getId(message);
    let functionNumber = parseInt(getBody(message), 2);

    switch (ardId) {
    case "001": //To verify
        switch (functionNumber) {
        case 0:
            motorsInitialized = true;
            break;
        default:

        }
        break;
    default:

    }
}

function requestParameters() {
    let argsToGet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 23, 24];
    let ardId = "001";
    let type = "10";
    let tType = "000";
    let tInf = "000";
    let numArg = "";
    let endMess = "000000000000000";
    let message = "";
    argsToGet.forEach(arg => {
        numArg = arg.toString(2).padStart(6, '0');
        message = ardId + type + tType + tInf + numArg + endMess;
        sendBin(arduinoDevices, message);
    });
}

function Arduino(device) {
    this.device = device;
    this.serial = new SerialPort(device.path, {
        baudRate: 19200
    });
    this.parser = this.serial.pipe(new ByteLength({
        length: 4
    }));

    this.sendHexString = function (data) {
        let arr = Uint8Array.from([parseInt(data.slice(0, 2), 16), parseInt(data.slice(2, 4), 16), parseInt(data.slice(4, 6), 16), parseInt(data.slice(6, 8), 16)]);
        this.serial.write(Buffer.from(arr), 'hex');
    }

    this.sendBinString = function (data) {
        let arr = Uint8Array.from([parseInt(data.slice(0, 8), 2), parseInt(data.slice(8, 16), 2), parseInt(data.slice(16, 24), 2), parseInt(data.slice(24, 32), 2)]);
        this.serial.write(Buffer.from(arr), 'hex');
    }

    this.readHex = function (buffer) {
        return (buffer.readUInt32BE(0).toString(16).padStart(8, '0'));
    }
    this.readBin = function (buffer) {
        return (buffer.readUInt32BE(0).toString(2).padStart(32, '0'));
    }

    this.readInt = function (buffer) {
        return (buffer.readUInt32BE(0));
    }
    this.read = function (data, mode = 0) {
        let response = "";
        let binary = this.readBin(data);
        if (mode >= 1) {
            response += "\tMessage from Arduino " + this.id + ": \n" + "\tMessage: " + this.readHex(data);
        }
        response += interpret(binary, mode);
        return response;
    }
}



function interpret(message, mode) {
    let response = "";
    if (mode >= 2) response += "\n\tArduino " + getId(message) + " says:"
    switch (getType(message)) {
    case "00":
        if (mode >= 1) response += "\n\t____ACK Message____\n";
        response += interpretAck(message, mode);
        break;
    case "01":
        if (mode >= 1) {
            response += "\n\t____Debug Message____";
            response += "\n\t body: " + getBody(message);
        }
        break;
    case "10":
        if (mode >= 1) {
            response += "\n\t____Request Message____";
            response += "\n\t No order to be received from slave";
        }
        break;
    case "11":
        if (mode >= 1) response += "\n\t____Info Message____\n";
        response += interpretInfo(message, mode)
        break;
    default:

    }
    return response;
}

function interpretAck(message, mode) {
    let response = "";
    let tAck = getTType(message).slice(1, 3);
    let ack = getAck(message);
    switch (tAck) {
    case "00":
        if (mode >= 1) response += "\n\tTinf: Success: ";
        switch (ack) {
        case "000":
            response += "Hello!";
            break;
        case "001":
            response += "Ok!";
            break;
        case "010":
            response += "Processing will be done in " + getStringTime(message);
            break;
        case "011":
            response += "Continue";
            break;
        case "100":
            response += "Well executed the " + getStringTypeMessage(message, "10", getBody(message).slice(13, 16));
            break;
        case "101":
            response += "function " + parseInt(getBody(message), 2) + " well executed"
            computeAckFunctionMessage(message);
            break;
        default:
            if (mode >= 2) response += "Ack:" + ack + " doesn't exist for tAck:" + tAck;
        }
        break;
    case "01":
        if (mode >= 1) response += "\n\tTinf: Interpretation Error: ";

        switch (ack) {
        case "000":
            response += "Wrong recipient: " + parseInt(getBody(message), 2).toString(16);
            break;
        case "001":
            response += "Message not understood: " + parseInt(getBody(message), 2);
            break;
        case "010":
            response += "No content for argument number: " + parseInt(getBody(message), 2);
            break;
        case "011":
            response += "No content for method number: " + parseInt(getBody(message), 2);
            break;
        case "100":
            response += "Error removing function in the waiting list, function number: " + parseInt(getBody(message), 2);
            break;
        case "101":
            response += "Number of functions in the waiting list: " + parseInt(getBody(message), 2);
            break;
        default:
            if (mode >= 2) response += "Ack:" + ack + " doesn't exist for tAck:" + tAck;
        }
        break;
    case "10":
        if (mode >= 1) response += "\n\tTinf: Operating Error: ";

        switch (ack) {
        case "000":
            response += "Allocation Error, argument type: " + getStringTypeArgMeth(getBody(message).slice(13, 16));
            break;
        case "001":
            response += "Error function: " + parseInt(getBody(message), 2);
            break;
        case "010":
            response += "Error delay execution, method number " + parseInt(getBody(message), 2);
            break;
        case "011":
            response += "Error calcul, argument number: " + parseInt(getBody(message), 2);
            break;
        case "100":
            response += "Process Error";
            break;
        }
        break;
    default:
        if (mode >= 2) response += "tAck:" + tAck + " doesn't exist";
        break;
    }
    return response;
}

function interpretInfo(message, mode) {
    let response = "";
    let tInfo = getTType(message)
    let numArg;
    let tArg;
    switch (tInfo) {
    case "000":
        tArg = message.slice(14, 16);
        numArg = message.slice(8, 14);
        response += "\nArgument number: " + parseInt(numArg, 2) + " (" + getStringTypeArgMeth(tArg.padStart(3, '0')) + ") ";
        let numArgDec = parseInt(numArg, 2);
        let value = getBody(message);
        switch (tArg) {
        case "00":
            value = parseInt(value, 2) / 100.0;
            response += "Value: " + value;
            request.computeArg([getId(message), numArgDec, value]);
            break;
        case "11": //uint32_t
            //TODO: wait for next message, read it if possible etc....
            let id = getId(message);
            arduinoDevices.forEach(arduino => {
                if (arduino.id === id) {
                    if (arduino.wait32) {
                        value = arduino.wait32 + value;
                        arduino.wait32 = false;
                        response += "Value: " + parseInt(value, 2);
                        request.computeArg([getId(message), numArgDec, value]);
                    } else {
                        arduino.wait32 = parseInt(value, 2);
                        response = "";
                    }
                }
            });
            break;
        default:
            response += "Value: " + parseInt(value, 2);
            request.computeArg([getId(message), numArgDec, parseInt(value, 2)]);
            break;
        }
        break;
    case "001": //2 arg
        numArg = parseInt(message.slice(8, 14), 2);
        tArg = getStringTypeArgMeth(14, 16);
        response += "Argument number: " + numArg + " (" + tArg + ") Value: " + message.slice(16, 24);
        response += "\nArgument number: " + numArg + 1 + " (" + tArg + ") Value: " + message.slice(24, 32);
        request.computeArg([getId(message), numArg, parseInt(message.slice(16, 24), 2)]);
        request.computeArg([getId(message), numArg + 1, parseInt(message.slice(24, 32), 2)]);
        break;
    case "010": //count methods/arguments
        response += "I have " + parseInt(message.slice(8, 14), 2) + " methods";
        response += "\nI have " + parseInt(message.slice(14, 18), 2) + " float arguments";
        response += "\nI have " + parseInt(message.slice(18, 23), 2) + " uint8_t arguments";
        response += "\nI have " + parseInt(message.slice(23, 28), 2) + " uint16_t arguments";
        response += "\nI have " + parseInt(message.slice(28, 32), 2) + " uint32_t arguments";
        response += "\nin my operating class";
        break;
    case "011": //waiting list
        response += "Function in the waiting list: ";
        response += "\nNumber: " + parseInt(message.slice(8, 14), 2) + ", Parameter: " + parseInt(message.slice(14, 19), 2);
        if (message.slice(19, 20) === "1")
            response += "\nLoop function: " + getStringTime(message) + " per loop";
        else response += "\nFunction will be executed in: " + getStringTime(message);
    default:
        if (mode >= 2) response += ("tInf: " + Tinf + " doesn't exist");
        break;
    }
    return response;
}


function getId(data) {
    return data.slice(0, 3).padStart(3, '0');
}

function getType(data) {
    return data.slice(3, 5);
}

function getTType(data) {
    return data.slice(5, 8);
}

function getAck(data) {
    return data.slice(8, 11);
}

function getBody(data) {
    return data.slice(16, 32);
}

function getStringTime(data) {
    let unit = data.slice(20, 22);
    let time = data.slice(22, 32);
    switch (unit) {
    case "00":
        return parseInt(time, 2) + " ms";
        break;
    case "01":
        return parseInt(time, 2) + " s";
        break;
    case "10":
        return parseInt(time, 2) + " min";
        break;
    case "11":
        return parseInt(time, 2) + " h";
        break;
    }
    return "";
}

function getStringTypeMessage(message, type = -1, tType = -1) {
    let response = "";
    if (type == -1) type = getType(message);
    if (tType == -1) tType = getTType(message);
    switch (type) {
    case "00":
        switch (tType) {
        case "000":
            response += "success message"
            break;
        case "001":
            response += "interpretation error message"
            break;
        case "010":
            response += "operating error message"
            break;
        }
        break;
    case "01":
        response += "debug message"
        break;
    case "10":
        switch (tType) {
        case "000":
            response += "request message: get 1 information"
            break;
        case "001":
            response += "request message: get 2 informations"
            break;
        case "010":
            response += "request message: set 1 argument"
            break;
        case "011":
            response += "request message: set 2 arguments"
            break;
        case "100":
            response += "request message: add in the waiting list"
            break;
        case "101":
            response += "request message: resend a message"
            break;
        case "110":
            response += "request message: remove a function in the waiting list"
            break;
        }
        break;
    case "11":
        switch (tType) {
        case "000":
            response += "information message: 1 argument"
            break;
        case "001":
            response += "information message: 2 arguments"
            break;
        case "010":
            response += "information message: number method / arguments"
            break;
        case "011":
            response += "information message: waiting list"
            break;
        }
        break;
    }
    return response;
}

function getStringTypeArgMeth(type) {
    let response = "";
    switch (type) {
    case "000":
        response += "float";
        break;
    case "001":
        response += "uint8_t";
        break;
    case "010":
        response += "uint16_t";
        break;
    case "011":
        response += "uint32_t";
        break;
    case "100":
        response += "method";
        break;
    default:
        response += "";
        break;
    }
    return response;
}

function sendHex(arduinos, message) {
    arduinos.forEach(arduino => {
        let data = message;
        if ((parseInt(data.slice(0, 1), 16).toString(2).padStart(4, '0').slice(0, 3) === arduino.id) || (parseInt(data.slice(0, 1), 16).toString(2).padStart(4, '0').slice(0, 3) === "111")) {
            data = arduino.id + parseInt(data, 16).toString(2).padStart(32, '0')[3] + parseInt(data, 16).toString(2).padStart(32, '0').substring(4, 32);
            console.log("Message sent : "+message);
            arduino.sendHexString(parseInt(data, 2).toString(16).padStart(8, '0'));
        }
    });
}

function sendBin(arduinos, message) {
    arduinos.forEach(arduino => {
        let data = message;
        if ((data.slice(0, 3) === arduino.id) || (data.slice(0, 3) === "111")) {
            data = arduino.id + data.substring(3);
            arduino.sendBinString(data);
        }
    });
}

function sendLED(arduinos, array) {

    let dico = {
        posX: "000011",
        posY: "000100",
        colorR: "000101",
        colorG: "000110",
        colorB: "000111"
    }

    let ardId = "010"; //ID of led controling arduino's
    let typeMess = "10";
    let typeReq = "010"
    let header = ardId + typeMess + typeReq;

    arduinos.forEach(arduino => {
        if (ardId === arduino.id) {

            let posX = (+((parseInt(header + dico.posX + "00", 2) << 16) | array[0])).toString(16);
            let posY = (+((parseInt(header + dico.posY + "00", 2) << 16) | array[1])).toString(16);
            let colorR = (+((parseInt(header + dico.colorR + "00", 2) << 16) | array[2])).toString(16);
            let colorG = (+((parseInt(header + dico.colorG + "00", 2) << 16) | array[3])).toString(16);
            let colorB = (+((parseInt(header + dico.colorB + "00", 2) << 16) | array[4])).toString(16);
            arduino.sendHexString(posX);
            arduino.sendHexString(posY);
            arduino.sendHexString(colorR);
            arduino.sendHexString(colorG);
            arduino.sendHexString(colorB);
            arduino.sendHexString("54040000");
            console.log('Led allumée');
        }
    });
}

function send(arduinos, data) {
    let dataArray = data.split(":");
    switch (dataArray[0]) {
    case "HEX":
        sendHex(arduinos, dataArray[1]);
        break;
    case "BIN":
        sendBin(arduinos, dataArray[1]);
        break;
    case "LED":
        sendLED(arduinos, dataArray.slice(1));
        break;
    case "EXEC":
        console.log(request.exec(dataArray[1], dataArray.slice(2)));
        break;
    default:

    }
}

//init();
module.exports = {
    init,
    send,
    sendBin,
    sendHex,
    sendLED,
    stopControl,
    startControl,
    startAgitation,
    stopAgitation,
    requestParameters
}