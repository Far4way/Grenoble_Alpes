const piCamera = require("pi-camera-connect"); 
const exposures = piCamera.ExposureMode;
const awbModes = piCamera.AwbMode;

const files = require("fs");
const runApp = async () => {
    let date = Date.now();
    console.log("Start" );
    
    const stillCamera = new piCamera.StillCamera({
        shutter: 800000,
        sharpness: 80, //-100 100 0
        contrast: 85, //-100 100 0 
        brightness: 30, //0 50 50
        saturation: 0, //-100 100 0
        //iso: Auto, //Default: Auto
        exposureCompensation: 0, //Default: 0
        exposureMode: exposures.Auto, //Default: Auto
        awbMode: awbModes.Auto, //Default: Auto
        analogGain: 0, //Default: 0
        digitalGain: 0 //Default: 0
    });

    const image = await stillCamera.takeImage().then(image => {
        let millis = Date.now() - date;
        console.log("End : " + millis);
        
        files.writeFileSync("still-image.jpeg", image);

    });

};


runApp();
