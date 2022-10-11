/*Get the data from npm package using child process
 *Fork method Handles multiple requests per second
 *
 */

//Import npmtimezone package from node_modules using require
const allTimeZone = require("npmtimezone");
const fs = require("fs");
process.on("message", (msg) => {
  try {
    let msgContent = msg.msgContent;

    //Throw an error if the msgContent is null
    if (!msgContent) {
      throw new Error(
        "Message content is null, generated at " +
          getCurrentDateAndTimeForError()
      );
    } else {
      if (msg.msgContent == "all-timezone-cities") {
        //Get the allTimeZones data and send the data to parent process
        process.send(allTimeZone.allTimeZones());

        //To exit from current process
        process.exit();
      } else if (msg.msgContent == "getCity") {
        //Throws an error if the city name is null
        if (!msg.msgBody) {
          throw new Error(
            "city name is null, generated at " + getCurrentDateAndTimeForError()
          );
        }

        //Get the city date and time object and send the object to parent
        process.send(allTimeZone.timeForOneCity(msg.msgBody));
        process.exit();
      } else if (msg.msgContent == "hourly-forecast") {
        //Throws an error if city date and time is null
        if (!msg.msgBody.cityDateTime) {
          throw new Error(
            "City date and time is null generated at " +
              getCurrentDateAndTimeForError()
          );
        }

        //Throws an error if the value of hour is null
        if (!msg.msgBody.hours) {
          throw new Error(
            "Hours is null generated at " + getCurrentDateAndTimeForError()
          );
        }

        //Throws an error if the weatherResult object is null
        if (!msg.msgBody.weatherResult) {
          throw new Error(
            "Weather result is null generated at" +
              getCurrentDateAndTimeForError()
          );
        }

        //Send the next N hours weather data to parent process
        process.send(
          allTimeZone.nextNhoursWeather(
            msg.msgBody.cityDateTime,
            msg.msgBody.hours,
            JSON.parse(msg.msgBody.weatherResult)
          )
        );
        process.exit();
      } else {
        throw new Error(
          "Not a valid message content generated at " +
            getCurrentDateAndTimeForError()
        );
      }
    }
  } catch (error) {
    //Catch the thrown error in try block and append them in log.txt file using fs module
    let errorMsg = error + "\n";
    fs.appendFile("log.txt", errorMsg, () => {});
  }
});
/**
 *Get the current date and time to know at what time the error was generated
 *Store the error in log.txt
 * @return {string} returns the current date and time to throw an error
 */
function getCurrentDateAndTimeForError() {
  let date = new Date().toLocaleDateString();
  let currentDate = new Date();
  var current_time =
    currentDate.getHours() +
    ":" +
    currentDate.getMinutes() +
    ":" +
    currentDate.getSeconds();
  return `${date},${current_time}`;
}
