const express = require("express");
const bodyParser = require("body-parser");
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

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.get("*", (req, res) => {
    res.render('admin.html');
});

let hermAs = require('./hermAs/hermAs');
let arduinos;

let server = app.listen(8080, () => {
    console.log(`Server is running on port 8080.`);
});

let io = require("socket.io").listen(server);

io.on('connect', function (socket) {

    socket.on("consoleInput", function (dataSent) {
        console.log("Client sent console input: " + dataSent);

        hermAs.send(arduinos, dataSent);
        dataSent = JSON.stringify(dataSent.toString()).replace(/\\\\n/g, "<br>");
        dataSent = dataSent.substring(1, dataSent.length - 1);
        io.emit("serverResponse", "Guest" + "_::> " + dataSent);
    });

    socket.on('disconnect', function () {
        socket.disconnect(true);
    });
});

hermAs.init().then(function (arduinoDevices) {

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