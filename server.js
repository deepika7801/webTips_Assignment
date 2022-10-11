/**
 *Render all the files after starting the server
 *Handle the request and response for fetching the data from timeZone.js
 *Handle invalid request
 *
 */
const PORT = 8000;
const { fork } = require("child_process");

//Middleware for handling JSON and URL encoded
let bodyParser = require("body-parser");
let express = require("express");
let app = express();
let startTime = new Date();
let dayCheck = 144000;
let weatherResult = [];

//Render Html page using get request
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//Use body parser for handling incoming request and convert the raw data into object when extended is false
app.use(bodyParser.urlencoded({ extended: false }));

//convert into JSON object
app.use(bodyParser.json());

//Passing directory name and render all the files using express.static middleware
app.use(express.static(__dirname));

//Get the data of all the cities from allTimeZones function
app.get("/all-timezone-cities", function (req, res) {
  let currentTime = new Date();
  if (currentTime - startTime > dayCheck) {
    const forkedFile = fork("./js/child.js");
    startTime = new Date();
    //Send the parameters from parent to child process using fork
    forkedFile.send({
      msgContent: "all-timezone-cities",
      msgBody: "",
    });
    //Get the data from child process by registering an event
    forkedFile.on("message", (msg) => {
      weatherResult = msg;
      res.json(weatherResult);
    });
  } else {
    if (weatherResult.length === 0) {
      const forkedFile = fork("./js/child.js");
      //Send the parameters from parent to child process using fork
      forkedFile.send({
        msgContent: "all-timezone-cities",
        msgBody: "",
      });
      //Get the data from child process by registering an event
      forkedFile.on("message", (msg) => {
        weatherResult = msg;
        res.json(weatherResult);
      });
    } else {
      res.json(weatherResult);
    }
  }
});

//Get the date, time and city name of the selected city from timeForOneCity function by passing the city name
app.get("/getCity", function (req, res) {
  const forkedFile = fork("./js/child.js");

  //Get city name from getCity Url using req.query
  let city = req.query.city;
  if (city) {
    //Send the parameters from parent to child process using fork
    forkedFile.send({ msgContent: "getCity", msgBody: city });
    //Get the data from child process by registering an event
    forkedFile.on("message", (msg) => {
      res.json(msg);
    });
  } else {
    res.status(404).json({ Error: "Not a valid end point .check API Doc" });
  }
});

//Get the temperature for next N hours from nextNhoursWeather function
app.post("/hourly-forecast", function (req, res) {
  let cityDateTime = req.body.city_Date_Time_Name;
  let hours = req.body.hours;
  const forkedFile = fork("./js/child.js");
  if (cityDateTime && hours && weatherResult) {
    let obj = {
      msgContent: "hourly-forecast",
      msgBody: {
        cityDateTime: `${cityDateTime}`,
        hours: `${hours}`,
        weatherResult: `${JSON.stringify(weatherResult)}`,
      },
    };
    //Send the parameters from parent to child process using fork
    forkedFile.send(obj);
    //Get the data from child process by registering an event
    forkedFile.on("message", (msg) => {
      res.json(msg);
    });
  } else {
    res.status(404).json({ Error: "Not a valid end point .check API Doc" });
  }
});

//Handle error for invalid request
app.use((req, res, next) => {
  res.status(404).send({
    status: 404,
    error: "Not found",
  });
});
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
