/**
 *To update the city image for the selected city
 *
 * @param {string} cityName To update city image city name
 * @return {void} nothing
 */
function updateSelectedCityImage(cityName) {
  document.getElementById("city-img").src = `./assets/${cityName}.svg`;
}
/**
 *To get the next five hours temperature using getElementsByClassName
 *Update the temperature with current temperature using data in json file
 * @param {Array} fiveHrs Current city temperature for next five hours
 */
function updateCityTemperature(cityTemp) {
  var collections = document.getElementsByClassName("temp-fiveHrs");
  for (let i = 0; i < cityTemp.length; i++) {
    collections[i].innerText = cityTemp[i];
  }
}
export { updateSelectedCityImage, updateCityTemperature };
