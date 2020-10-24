const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const app = express();
let corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/public'));
// noinspection JSCheckFunctionSignatures
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
let hermes = require('./hermes/hermes');
let arduinos;
const db = require("./models/index");
const dbConfig = require("./config/db.config");
const Role = db.role;
db.mongoose.set('useFindAndModify', false);
db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();

}).catch(err => {
    console.error("Connection error", err);
    process.exit();
});
const query = require('./database/queries');

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'user' to roles collection");
            });
            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}


require('./routes/routes')(app);
let experienceState = "stopped";
let timerMeasures;
let timerParameters = 1000;
let intervalMeasure;
let intervalParameters;
db.mongoose.connection.once('open', function () {

    let server = app.listen(8080, () => {
        console.log(`Server is running on port 8080.`);
    });
    let io = require("socket.io").listen(server);

    let connectionsCounter = 0;

    io.on('connect', function (socket) {

        socket.on("greetings", function (id, username) {
            console.log("Got greetings from : " + username);
            socket.client.userId = id;
            socket.client.username = username;
            socket.emit("message", "Le client <b>" + socket.client.username + "</b> est bien connecté !");
        });

        socket.on("SOS", function (data) {
            console.log("Le client " + socket.client.username + " a envoyé : " + data);
        });

        socket.on("consoleInput", function (dataSent) {
            console.log("Le client " + socket.client.username + " a envoyé l'input console : " + dataSent);
            // python.stdin.write(dataSent.toString() + '\r\n');
            //hermes.send(python, dataSent);

            //TODO : Vérifier que tout marche, et implémenter ce qu'il manque (LED, BIN ?, etc...)
            hermes.send(arduinos, dataSent);


            dataSent = JSON.stringify(dataSent.toString()).replace(/\\\\n/g, "<br>");
            dataSent = dataSent.substring(1, dataSent.length - 1);
            //socket.broadcast.emit("serverResponse", socket.client.username + "_::> " + dataSent);
            //socket.emit("serverResponse", socket.client.username + "_::> " + dataSent);
            io.emit("serverResponse", socket.client.username + "_::> " + dataSent);
        });


        socket.on('newExperience', function (number, name, startTime, endTime, measures, measurementDelay) {

            query.createExperience(number, name, startTime, endTime, measures, measurementDelay, socket.client.userId)
                .then(function (exp) {
                    //console.log(exp);
                    socket.emit('newExperience', exp);
                    console.log('Experience Added');
                });
        });

        socket.on('newStep', function (temperature, humidity, agitation, endTime, expId) {
            query.getExperience(expId).then(function (experience) {
                if (experience.steps.length === 1) {
                    query.createStep(experience.startTime, agitation, humidity, temperature, endTime, expId).then(function (step) {
                        //console.log(step);
                        socket.emit('newStep', step);
                        console.log("Step Added");
                    });
                } else {
                    let date = new Date();
                    query.createStep(date, agitation, humidity, temperature, endTime, expId).then(function (step) {
                        //console.log(step);
                        socket.emit('newStep', step);
                        console.log("Step Added");
                    });
                }
            });
        });

        socket.on('newWellsGroup', function (stepId, wellList) {
            query.createManyWell(wellList, stepId).then(function (wells) {
                socket.emit('newWellsGroup', wells);
                console.log("Well(s) Added");
                //console.log(wells);
            });
        });

        socket.on('getStateExperience', function () {
            query.getLastExperience().then(function (experience) {
                query.getUser(experience.user).then(function (user) {
                    socket.emit('getStateExperience', experienceState, experience, user.username);
                });
            }).catch(function (reason) {
                socket.emit('firstExperience', experienceState);
            });
        });

        socket.on('newProductWells', function (group, name, concentration, volume, stepId) {
            query.addProductToWells(group, name, concentration, volume, stepId).then(function (product) {
                socket.emit('newProductWells', product);
                console.log("Product Added");
            });
        });

        socket.on('deleteWellsGroups', function (stepId) {
            query.deleteAllWellsByStepId(stepId).then(function (data) {
                socket.emit('deleteWellsGroups');
            });
        });

        socket.on('startExperiment', function (expId) {
            query.startExperience(expId).then(function (experience) {
                query.getUser(experience.user).then(function (user) {
                    experienceState = "running";
                    socket.emit('startExperiment', experience, user.username);
                    timerMeasures = experience.measurementDelay * 60000;
                    intervalMeasure = setInterval(takeMeasures, timerMeasures);
                    intervalParameters = setInterval(getParameters, timerParameters);

                    //TODO: send message to start initialization
                    //Once initialization done, send message to start rotation.

                    //call function that launch control with parameters : temperature, humidity
                    query.getLastStep().then(function (step) {
                        //hermes.startControl(step.humidity, step.temperature);
                        hermes.startAgitation(step.rpmAgitation);
                    });
                });
            });
        });

        socket.on('stopExperiment', function (expId) {
            if (experienceState === "running") {
                query.stopExperimentAndStep(expId).then(function (experience) {
                    experienceState = "stopped";
                    hermes.stopControl();
                    hermes.stopAgitation();
                    clearTimeout(intervalMeasure);
                    clearTimeout(intervalParameters);
                    socket.emit('stopExperiment', experienceState, experience);
                });
            } else {
                query.stopExperiment(expId).then(function (experience) {
                    experienceState = "stopped";
                    hermes.stopControl();
                    hermes.stopAgitation();
                    clearTimeout(intervalMeasure);
                    clearTimeout(intervalParameters);
                    socket.emit('stopExperiment', experienceState, experience);
                });
            }
        });

        socket.on('pauseExperiment', function (expId) {
            query.pauseExperiment(expId).then(function (experience) { //Set EndTime of last step to actual time
                experienceState = "paused";
                clearTimeout(intervalMeasure);
                clearTimeout(intervalParameters);
                socket.emit('pauseExperiment', experienceState, experience);
                hermes.stopControl();
                hermes.stopAgitation();
            });
        });

        socket.on('continueExperiment', function (expId) {
            //Duplicate last step, make a new one, gives the new one startTime actual, gets the duplicated step endtime as endtime if endtime>starttime
            query.continueExperiment(expId).then(function (newStep) {
                query.getLastExperience().then(function (experience) {
                    experienceState = "running";
                    intervalMeasure = setInterval(takeMeasures, timerMeasures);
                    intervalParameters = setInterval(getParameters, timerParameters);
                    socket.emit('continueExperiment', experienceState, experience, newStep);
                    //hermes.startControl(step.humidity, step.temperature);
                    hermes.startAgitation(newStep.rpmAgitation);
                });
            });
        });

        function takeMeasures() {
            //TODO : If paused, make it so its good
            //TODO : implement
            console.log("Je prends une mesure");
        }

        function getParameters() {
           // hermes.requestParameters();
            console.log("Je get les paramètres");
        }

        socket.on('disconnect', function (reason) {
            console.log("A client has disconnected : ", socket.client.username, reason);
            socket.disconnect(true);
        });
    });
    hermes.init().then(function (arduinoDevices) {
        arduinos = arduinoDevices;
        arduinos.forEach(arduino => {
            arduino.parser.on('data', function (data) {
                if ((data !== null) || (data !== "")) {
                    let body = arduino.read(data);
                    if (body === "") return;
                    let head = "Ard" + parseInt(arduino.id, 2);
                    let message = head + "_::> " + body;
                    console.log(message);
                    io.emit("serverResponse", message);
                }
            });
        });
    });

    io.sockets.on("connection", function () {
        connectionsCounter++;
        console.log("Un utilisateur cherche à se connecter ! Total of connections : ", connectionsCounter);
    });
});