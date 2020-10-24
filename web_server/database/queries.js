const mongoose = require("mongoose");
const db = require('../models/index');
const Well = db.well;
const Step = db.step;
const User = db.user;
const Measure = db.measure;
const Capture = db.capture;
const Product = db.product;
const Parameters = db.parameters;
const Experience = db.experience;

//Get products for one specified well
const createWell = function (group, column, line, stepId) {
    return new Promise(function (resolve) {

        Well.create(
            {
                group: group,
                column: column,
                line: line,
                products: []
            },
            function (err, doc) {
                if (err) console.log(err);
                else {
                    Step.findByIdAndUpdate(stepId, { $push: { wells: doc._id } }, function (err2) {
                        if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                        else resolve(doc);
                    });
                }
            });
    });
};

const createManyWell = function (wellList, stepId) {
    return new Promise(function (resolve) {
        Well.create(wellList, function (err, docs) {
            if (err) console.log(err);
            else {
                let ids = [];
                docs.forEach(function (doc) {
                    ids.push(doc._id)
                });

                Step.findByIdAndUpdate(stepId, { $push: { wells: { $each: ids } } }, function (err2) {
                    if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                    else resolve(docs);
                });

            }
        });
    });
};

const createCapture = function (group, name, intensity, path, measureId) {
    return new Promise(function (resolve) {

        Capture.create(
            {
                group: group,
                name: name,
                intensity: intensity,
                path: path
            },
            function (err, doc) {
                if (err) console.log(err);
                else {
                    switch (group) {
                        case "EColi":
                            Measure.findByIdAndUpdate(measureId, { $push: { capturesEColi: doc._id } }).then(function (err2, doc) {
                                if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                                else resolve(doc);
                            });
                            break;
                        case "Paeru":
                            Measure.findByIdAndUpdate(measureId, { $push: { capturesPaeru: doc._id } }).then(function (err2, doc) {
                                if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                                else resolve(doc);
                            });
                            break;
                        case "Biofilm":
                            Measure.findByIdAndUpdate(measureId, { $push: { capturesBiofilm: doc._id } }).then(function (err2, doc) {
                                if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                                else resolve(doc);
                            });
                            break;
                        case "Light":
                            Measure.findByIdAndUpdate(measureId, { $push: { capturesLight: doc._id } }).then(function (err2, doc) {
                                if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                                else resolve(doc);
                            });
                    }
                }
            });
    });
};

const createMeasure = function (date, stepId) {
    return new Promise(function (resolve) {

        Measure.create(
            {
                date: date,
                capturesEColi: [],
                capturesPaeru: [],
                capturesBiofilm: [],
                capturesLight: []
            },
            function (err, doc) {
                if (err) console.log(err);
                else {
                    Step.findByIdAndUpdate(stepId, { $push: { measures: doc._id } }, function (err2) {
                        if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                        else resolve(doc);
                    });
                }
            });
    });
};

const createParameters = function (pwmHeater, atomiser, temperatures, humidities, stepId) {
    return new Promise(function (resolve) {
        let date = new Date();
        Parameters.create(
            {
                pwmHeater: pwmHeater,
                atomiser: atomiser,
                temperatures: temperatures,
                humidities: humidities,
                date: date
            },
            function (err, doc) {
                if (err) console.log(err);
                else {
                    Step.findByIdAndUpdate(stepId, { $push: { parameters: doc._id } }, function (err2) {
                        if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                        else resolve(doc);
                    });
                }
            });
    });
};

const createExperience = function (number, name, dateStart, stopTime, measures, delay, user) {
    return new Promise(function (resolve) {
        if (stopTime === null) {
            stopTime = new Date();
        }
        Experience.create(
            {
                number: number,
                name: name,
                startTime: dateStart,
                stopTime: stopTime,
                measures: measures,
                measurementDelay: delay,
                user: user
            },
            function (err, doc) {
                if (err) console.log(err);
                else resolve(doc);
            });
    });
};

const createStep = function (startTime, rpmAgitation, humidity, temperature, stopTime, experienceId, wells=[]) {
    return new Promise(function (resolve) {
        if (stopTime === null) {
            stopTime = new Date();
        }
        Step.create(
            {
                startTime: startTime,
                stopTime: stopTime,
                rpmAgitation: rpmAgitation,
                humidity: humidity,
                temperature: temperature,
                wells: wells,
                parameters: [],
                measures: []
            },
            function (err, doc) {
                if (err) console.log(err);
                else {
                    Experience.findByIdAndUpdate(experienceId, { $push: { steps: doc._id } }, function (err2) {
                        if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                        else resolve(doc);
                    });
                }
            });
    });
};

const createProduct = function (name, volume, concentration, wellsIds) {
    return new Promise(function (resolve) {

        Product.create(
            {
                name: name,
                volume: volume,
                concentration: concentration
            },
            function (err, doc) {
                if (err) console.log(err);
                else {
                    Well.updateMany({ '_id': { $in: wellsIds } }, { $push: { products: doc._id } }, function (err2) {
                        if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                        else resolve(doc);
                    });
                }
            });
    });
};

const getWell = function (id) {
    Well.findById(id, function (err, well) {
        if (err) {
            console.log(err);
            return -1;
        } else {
            return well;
        }
    });
};

const getWellProducts = function (id) {
    Well.findById(id, 'products', function (err, well) {
        if (err) {
            console.log(err);
            return -1;
        } else {
            return well;
        }
    });
};

const getWellByCoords = function (stepId, col, line) {
    Well.findOne({ column: col, line: line, step: stepId }, function (err, well) {
        if (err) {
            console.log(err);
            return -1;
        } else {
            return well;
        }
    });
};

const getWellProductsByCoords = function (stepId, col, line) {
    Well.findOne({ column: col, line: line, step: stepId }, 'products', function (err, well) {
        if (err) {
            console.log(err);
            return -1;
        } else {
            return well;
        }
    });

};

const getUser = function (id) {
    return new Promise(function (resolve) {
        resolve(User.findById(id));
    });
};

const getNumberExperience = function () {
    return new Promise(function (resolve) {
        resolve(Experience.estimatedDocumentCount());
    });
};

const getExperience = function (expId) {
    return new Promise(function (resolve) {
        resolve(Experience.findById(expId));
    });
};

const getLastExperience = function () {
    return new Promise(function (resolve, reject) {
        getNumberExperience().then(function (number) {
            if (number !== 0) {
                Experience.findOne({ number: number },function(err,doc){
                    if(err) console.log(err);
                    resolve(doc);
                });
            }
            else reject("Aucune expérience dans la base de donnée.");
        })
    });
};

const getLastStep = function () {
    return new Promise(function (resolve, reject) {
        Step.findOne({}, {}, { sort: { 'startTime': -1 } }, (function (err, doc) {
            if (err) console.log(err);
            resolve(doc);
        }));
    });
};

const deleteManyWell = function (ids) {
    return new Promise(function (resolve) {
        resolve(Well.deleteMany({ '_id': { $in: ids } }));
    });
};

const deleteAllWellsByStepId = function (stepId) {
    return new Promise(function (resolve) {
        Step.findByIdAndUpdate(stepId, { $set: { "wells": [] } }, function (err, step) {
            if (err) console.log(err);
            resolve(deleteManyWell(step.wells));
        });
    });
};

const getStepWells = function (stepId) {
    return new Promise(function (resolve) {
        Step.findById(stepId, 'wells').then(function (step) {
            let wells = step.wells;
            resolve(wells);
        });
    });
};

const addProductToWells = function (group, name, concentration, volume, stepId) {
    return new Promise(function (resolve) {
        getStepWells(stepId).then(function (wellsIds) {
            Well.find({ '_id': { $in: wellsIds }, group: group }, '_id').then(function (wells) {
                let ids = [];
                wells.forEach(function (well) {
                    ids.push(well._id);
                });
                resolve(createProduct(name, volume, concentration, ids));
            });
        });
    });
};

const startExperience = function (expId) {
    return new Promise(function (resolve) {
        let date = new Date();
        Experience.findById(expId,function (err, doc1) {
//, { startTime: date }, { "new": true }
            if (err) console.log(err);
            if (doc1.steps.length === 1){
                doc1.startTime=date;
                doc1.save().then(function (doc) {
                    Step.findOneAndUpdate({ '_id': { $in: doc.steps } }, { startTime: date }, { sort: { 'startTime': -1 } }).then(function (doc2) {
                        resolve(doc);
                    });
                });
            } else {
                Step.findOneAndUpdate({ '_id': { $in: doc1.steps } }, { startTime: date }, { sort: { 'startTime': -1 } }).then(function (doc2) {
                    resolve(doc1);
                });
            }
        });
    });
};

const pushParameters = function (humidities, temperatures, atomiser, pwmHeater) {
    return new Promise(function (resolve) {
        getLastStep().then(function (step) {
            createParameters(pwmHeater, atomiser, temperatures, humidities, step._id).then(function (params) {
                resolve(params);
            });
        });
    });
};


const stopExperimentAndStep = function (expId) {
    return new Promise(function (resolve) {
        let date = new Date();
        Experience.findByIdAndUpdate(expId, { 'stopTime': date }, { "new": true }, function (err, doc) {
            Step.findOneAndUpdate({ '_id': { $in: doc.steps } }, { 'stopTime': date }, { sort: { 'startTime': -1 }, "new": true }, function (err2, doc2) {
                if (err || err2) console.log("err 1 : " + err + "\nerr 2 : " + err2);
                else resolve(doc);
            });
        });
    });

};
const stopExperiment = function (expId) {
    return new Promise(function (resolve) {
        let date = new Date();
        Experience.findByIdAndUpdate(expId, { 'stopTime': date }, { "new": true }, function (err, doc) {
            if (err) console.log(err);
            else resolve(doc);
        });
    });
};

const pauseExperiment = function (expId) {//Set EndTime of last step to actual time
    return new Promise(function (resolve) {
        let date = new Date();
        Step.findOneAndUpdate({}, { 'stopTime': date }, { sort: { 'startTime': -1 } }, (function (err, doc) {
            if (err) console.log(err);
            resolve(getLastExperience());
        }));
    });
};

//Duplicate last step, make a new one, gives the new one startTime actual, gets the duplicated step endtime as endtime if endtime>starttime

const continueExperiment = function (expId) {
    return new Promise(function (resolve) {
        getLastStep().then(function (step) {
            let date = new Date();
            createStep(date, step.rpmAgitation, step.humidity, step.temperature, null, expId, step.wells).then(function (step2) {
                resolve(step2);
            });
        });
    });

};

module.exports = {
    createWell,
    createCapture,
    createMeasure,
    createParameters,
    createExperience,
    createProduct,
    createStep,

    getWell,
    getWellProducts,
    getWellByCoords,
    getWellProductsByCoords,

    getUser,
    getNumberExperience,
    getExperience,
    getLastExperience,
    getLastStep,
    createManyWell,
    deleteManyWell,
    deleteAllWellsByStepId,
    addProductToWells,
    startExperience,

    pushParameters,
    stopExperimentAndStep,
    stopExperiment,
    pauseExperiment,
    continueExperiment,
};