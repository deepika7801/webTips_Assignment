/**
 *To get the data of all the cities from api using fetch
 *
 * @return {object} To get the city details of selected city using data object
 */
function getCityData() {
  let dataOfAllCities = new Promise(async (resolve) => {
    let cityData = await fetch("http://localhost:8000/all-timezone-cities", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    let data = await cityData.json();
    resolve(data);
  });
  return dataOfAllCities;
}

/**
 *To get the date and time of selected city in the drop down
 *
 * @param {string} cityName To fetch the date and time using cityName
 * @return {object} passing date and time object to get temperature for next five hours
 */
async function getSelectedCityDateAndTime(cityName) {
  try {
    let cityData = await fetch(
      `http://localhost:8000/getCity/?city=${cityName}`, //To get the city name from Url using /getCity
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      }
    );
    return await cityData.json();
  } catch (error) {
    alert(error.message);
  }
}

/**
 *To get the temperature for next five hours using cityTimeData
 *
 * @param {object} cityTimeData Fetch the temperature using cityTimeData object
 * @return {Array} To display the future temperature in UI using temperature
 */
async function updateTemperatureForNextNHours(cityTimeData) {
  try {
    let weatherData = await fetch("http://localhost:8000/hourly-forecast", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(cityTimeData),
    });
    let data = await weatherData.json();
    return await data.temperature;
  } catch (error) {
    alert(error.message);
  }
}
export {
  getCityData,
  getSelectedCityDateAndTime,
  updateTemperatureForNextNHours,
};
