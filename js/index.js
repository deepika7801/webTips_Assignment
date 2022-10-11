import { updateSelectedCityImage, updateCityTemperature } from "./utility.js";
import {
  getCityData,
  getSelectedCityDateAndTime,
  updateTemperatureForNextNHours,
} from "./weatherdata.js";
let selectedCityDetails;
let sortCityAndContinent;
let timeout, hour, minute, second, period, time;
let selectedButton;
let data = {};
const currentTimeLabel = "Now";
/**
 *To get the data of selected cities using GetSelectedCityDetails class
 *To access the properties and methods inside the class using object
 *
 * @class GetSelectedCityDetails
 */
class GetSelectedCityDetails {
  constructor(cityName) {
    this.cityName = cityName;

    this.cityTempInCelsius = parseInt(data[cityName].temperature);
    this.cityHumidity = parseInt(data[cityName].humidity);
    this.cityPrecipitation = parseInt(data[cityName].precipitation);
    this.cityTempInFarenheit = Math.round(
      (parseInt(data[cityName].temperature) * 9) / 5 + 32
    );
    this.timeZone = data[cityName].timeZone;
  }
  getCityName = function () {
    return this.cityName;
  };
  getCityTempertureCelsius = function () {
    return this.cityTempInCelsius;
  };
  getCityHumidity = function () {
    return this.cityHumidity;
  };
  getCityPrecipitation = function () {
    return this.cityPrecipitation;
  };
  getCityTemperatureFarenheit = function () {
    return this.cityTempInFarenheit;
  };
  getTimeZoneOfSelectedCity = function () {
    return this.timeZone;
  };

  /**
   *Get the selected city name and checks whether the city name is present or not
   *Update time, date, temperature, humidity, precipitation, weather update for the selected city
   *
   *
   */
  updateSelectedCityInfo() {
    if (
      data.hasOwnProperty(
        document.getElementById("selectedCity").value.toLowerCase()
      )
    ) {
      //creating selectedCityDetails object and passing the selected city name in the drop down to constructor
      selectedCityDetails = new GetSelectedCityDetails(
        document.getElementById("selectedCity").value.toLowerCase()
      );
      updateSelectedCityImage(selectedCityDetails.getCityName());
      selectedCityDetails.updateCityDateAndTime();
      selectedCityDetails.updateTemperatureHumidityPrecipitation();
      selectedCityDetails.updateCityTime();
      selectedCityDetails.updateCityWeather();
      setInterval(selectedCityDetails.updateCityWeather, 3600000);
      clearInterval(timeout);
      timeout = setInterval(selectedCityDetails.updateCityDateAndTime, 1000);
    } else {
      clearInterval(timeout);
      alert("Please Enter valid City Name");
      selectedCityDetails.updateCityInfoForInvalidData();
    }
  }
  /**
   *To display the selected city's current date and time
   *Get the date and time for selected city using timezone in data.json
   *
   */
  updateCityDateAndTime() {
    //get the timeZone of selected city using getTimeZone method
    time = new Date().toLocaleString("en-US", {
      timeZone: selectedCityDetails.getTimeZoneOfSelectedCity(),
    });
    var day = new Date(time).getDate();
    var month = new Date(time).toLocaleString("en-US", { month: "short" });
    var year = new Date(time).getFullYear();
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "current-date",
      "innerHTML",
      `${day}-${month}-${year}`
    );

    hour = new Date(time).getHours();
    minute = new Date(time).getMinutes();
    second = new Date(time).getSeconds();
    selectedCityDetails.updateTimeTo12HrsFormat();
    //IIFE function to display current time and state (AM or PM)
    (function () {
      selectedCityDetails.updateElementAttributeWithGivenValue(
        "current-time",
        "innerHTML",
        `${hour}:${minute}:`
      );
      selectedCityDetails.updateElementAttributeWithGivenValue(
        "seconds",
        "innerHTML",
        `${second}`
      );
      selectedCityDetails.updateElementAttributeWithGivenValue(
        "flex-img",
        "src",
        `./assets/${period}State.svg`
      );
    })();
  }
  /**
   *Update the time and state (AM or PM) into standard format
   *
   */
  updateTimeTo12HrsFormat() {
    period =
      hour == 0
        ? (period = "am")
        : hour >= 12 && hour <= 24
        ? (period = "pm")
        : (period = "am");
    hour = hour == 0 ? 12 : hour > 12 && hour <= 24 ? (hour -= 12) : hour;
    hour = selectedCityDetails.prefixZeroToTime(hour);
    minute = selectedCityDetails.prefixZeroToTime(minute);
    second = selectedCityDetails.prefixZeroToTime(second);
  }
  /**
   *Appends zero to time to display the time in standard format
   *Closure function
   * @param {string} newTime Update the live time in standard format
   * @return {string} Return the live time after appending zero
   */
  prefixZeroToTime(newTime) {
    if (newTime < 10) return "0" + newTime;
    else return newTime;
  }
  /**
   *To update the temperature, humidity and precipitation for the selected city
   *Get the data using method name
   *
   */
  updateTemperatureHumidityPrecipitation() {
    //Get the temperature in celsius using getCityTempertureCelsius method
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "tempCelsius",
      "innerHTML",
      `${selectedCityDetails.getCityTempertureCelsius()} C`
    );
    //Get the humidity using getCityHumidity method
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "humidity",
      "innerHTML",
      `${selectedCityDetails.getCityHumidity()}`
    );
    //Get the temperature in Farenheit using getCityTempertureCelsius method
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "tempFarenheit",
      "innerHTML",
      `${selectedCityDetails.getCityTemperatureFarenheit()} F`
    );
    //Get the precipitation using getCityPrecipitation method
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "precipitation",
      "innerHTML",
      `${selectedCityDetails.getCityPrecipitation()}`
    );
  }
  /**
   *Get the city temperature for next five hours from json file
   *Update the time, weather icon, temperature for next five hours
   *
   */
  async updateCityWeather() {
    let cityTemp = [];
    let cityName = document.getElementById("selectedCity").value.toLowerCase();
    cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    let fetchCityTime = await getSelectedCityDateAndTime(cityName);
    fetchCityTime.hours = 5;
    cityTemp = await updateTemperatureForNextNHours(fetchCityTime);
    cityTemp.unshift(
      data[document.getElementById("selectedCity").value.toLowerCase()]
        .temperature
    );

    for (let i = 0; i < cityTemp.length; i++) {
      cityTemp[i] = parseInt(cityTemp[i]);
    }
    updateCityTemperature(cityTemp);
    selectedCityDetails.updateWeatherIcon(cityTemp);
  }

  /**
   *To update the weather icon with respect to temperature for selected city
   *
   * @param {Array} cityTemp passing the temperature for next five hours from data.json
   * @return {void} nothing
   */
  updateWeatherIcon(cityTemp) {
    var imgCollection = document.getElementsByClassName("time-img");
    var img;
    for (let i = 0; i < cityTemp.length; i++) {
      if (cityTemp[i] >= 23 && cityTemp[i] <= 29)
        img = `./assets/cloudyIcon.svg`;
      else if (cityTemp[i] >= 18 && cityTemp[i] <= 22)
        img = `./assets/windyIcon.svg`;
      else if (cityTemp[i] > 29) img = `./assets/sunnyIconBlack.svg`;
      else if (cityTemp[i] < 18) img = `./assets/rainyIcon.svg`;
      imgCollection[i].src = img;
    }
  }
  /**
   *To update the city time based on current time for the selected city
   *
   */
  updateCityTime() {
    var timeCollections = document.getElementsByClassName("time-fiveHrs");
    timeCollections[0].innerHTML = currentTimeLabel;
    var hr = hour;
    for (var i = 1; i < timeCollections.length; i++) {
      var str;
      hr = Number(hr);
      hr = hr <= 11 ? hr + 1 : hr > 12 ? hr - 12 : 1;
      period =
        hr == 12
          ? period == "am"
            ? (period = "pm")
            : (period = "am")
          : period;
      str = period == "am" ? hr + " AM" : hr + " PM";
      timeCollections[i].innerHTML = str;
    }
  }
  /**
   *To update the city details as nil or throw a warning for empty or invalid city name
   *
   */
  updateCityInfoForInvalidData() {
    clearInterval(timeout);
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "city-img",
      "src",
      `./assets/warning.svg`
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "current-time",
      "innerHTML",
      "NIL"
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "current-date",
      "innerHTML",
      "NIL"
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "seconds",
      "innerHTML",
      ""
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "flex-img",
      "src",
      `./assets/warning.svg`
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "tempCelsius",
      "innerHTML",
      "NIL"
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "humidity",
      "innerHTML",
      "NIL"
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "tempFarenheit",
      "innerHTML",
      "NIL"
    );
    selectedCityDetails.updateElementAttributeWithGivenValue(
      "precipitation",
      "innerHTML",
      "NIL"
    );
    selectedCityDetails.updateWeatherDetailsWithInvalidData();
  }
  /**
   *To update the city details based on selected city
   *
   * @param {ID} UIElementID Change attribute using element id
   * @param {Attribute} UIAttribute attribute( src or innerHTML)
   * @param {string} valueToUpdate Display updated value using element id
   * @return {void} nothing
   */
  updateElementAttributeWithGivenValue(
    UIElementID,
    UIAttribute,
    valueToUpdate
  ) {
    if (UIAttribute == "src")
      document.getElementById(UIElementID).src = valueToUpdate;
    else if (UIAttribute == "innerHTML")
      document.getElementById(UIElementID).innerHTML = valueToUpdate;
    else if (UIAttribute == "borderBottom") {
      document.getElementById(UIElementID).style.borderBottom = valueToUpdate;
    }
  }
  /**
   *Update the weather details such as time, weather icon and temperature for invalid city name
   *
   */
  updateWeatherDetailsWithInvalidData() {
    var timeCollections = document.getElementsByClassName("time-fiveHrs");
    for (var i = 0; i < timeCollections.length; i++) {
      timeCollections[i].innerHTML = "NIL";
    }
    var imgCollection = document.getElementsByClassName("time-img");
    for (let i = 0; i < imgCollection.length; i++) {
      imgCollection[i].src = `./assets/warning.svg`;
    }
    var tempCollections = document.getElementsByClassName("temp-fiveHrs");
    for (let i = 0; i < tempCollections.length; i++) {
      tempCollections[i].innerHTML = "NIL";
    }
  }
}

//Middle section

/**
 *Creating a class and inherit the GetSelectedCityDetails class using extend
 *Access the properties and methods using super keyword
 *
 * @class FilterAndSortCityAndContinentDetails
 * @extends {GetSelectedCityDetails}
 */
class FilterAndSortCityAndContinentDetails extends GetSelectedCityDetails {
  constructor(allCityName, timeZone) {
    super(document.getElementById("selectedCity").value.toLowerCase());
    this.sunnyCities = allCityName.filter(function (cityname) {
      return (
        parseInt(data[cityname].temperature) > 29 &&
        parseInt(data[cityname].humidity) < 50 &&
        parseInt(data[cityname].precipitation) >= 50
      );
    });
    this.rainyCities = allCityName.filter(function (cityname) {
      return (
        parseInt(data[cityname].temperature) < 20 &&
        parseInt(data[cityname].humidity) >= 50
      );
    });
    this.coldCities = allCityName.filter(function (cityname) {
      return (
        parseInt(data[cityname].temperature) >= 20 &&
        parseInt(data[cityname].temperature) <= 28 &&
        parseInt(data[cityname].humidity) > 50 &&
        parseInt(data[cityname].precipitation) < 50
      );
    });
    this.continent = timeZone.map(function (timeZoneElement) {
      return timeZoneElement.split("/");
    });
    this.cardLayout = document.getElementById("card-layout");
  }
  /**
   *Filter the city name based on temperature, humidity and precipitation and store them in an array
   *Sort the city name in an array from most to least based on condition
   *
   */
  sortCityDetailsBasedOnCondition() {
    //IIFE function to sort the city name in an array
    (function () {
      sortCityAndContinent.sortCitiesBasedOnWeather(
        sortCityAndContinent.sunnyCities,
        "temperature"
      );
      sortCityAndContinent.sortCitiesBasedOnWeather(
        sortCityAndContinent.rainyCities,
        "humidity"
      );
      sortCityAndContinent.sortCitiesBasedOnWeather(
        sortCityAndContinent.coldCities,
        "precipitation"
      );
    })();
  }
  /**
   *This function sort the city name based on the weather condition from most to least
   *
   * @param {Array} cityName Passing cityName array which needs to be sorted
   * @param {string} weatherType Passing weather type such as humidity, temperature, precipitation
   * @return {void} nothing
   */
  sortCitiesBasedOnWeather(cityName, weatherType) {
    cityName.sort(function (currentCity, nextCity) {
      return (
        parseInt(data[nextCity][weatherType]) -
        parseInt(data[currentCity][weatherType])
      );
    });
  }
  /**
   *This function add border to rainy icon and display the rainy city details
   *
   */
  displayRainyCityDetails() {
    document.getElementById("spinBox").value = 3;
    selectedButton = "rainyCities";
    sortCityAndContinent.setBorderForSelectedIcon();
    sortCityAndContinent.cardLayout.replaceChildren();
    sortCityAndContinent.updateCityDetailsByCityCount();
    document
      .getElementById("spinBox")
      .addEventListener(
        "change",
        sortCityAndContinent.updateCityDetailsByCityCount
      );
  }
  /**
   *This function add border to sunny icon and display the sunny city details
   *
   */
  displaySunnyCityDetails() {
    document.getElementById("spinBox").value = 3;
    selectedButton = "sunnyCities";
    sortCityAndContinent.setBorderForSelectedIcon();
    sortCityAndContinent.cardLayout.replaceChildren();
    sortCityAndContinent.updateCityDetailsByCityCount();
    document
      .getElementById("spinBox")
      .addEventListener(
        "change",
        sortCityAndContinent.updateCityDetailsByCityCount
      );
  }
  /**
   *This function add border to icon and display the snowflake city details
   *
   */
  displayColdCityDetails() {
    selectedButton = "coldCities";
    sortCityAndContinent.setBorderForSelectedIcon();
    document.getElementById("spinBox").value = 3;
    sortCityAndContinent.cardLayout.replaceChildren();
    setTimeout(sortCityAndContinent.updateCityDetailsByCityCount, 1);
    document
      .getElementById("spinBox")
      .addEventListener(
        "change",
        sortCityAndContinent.updateCityDetailsByCityCount
      );
  }
  /**
   *This function set border for the selected city icon using selectedButton
   *
   */
  setBorderForSelectedIcon() {
    if (selectedButton == "sunnyCities") {
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-sunny",
        "borderBottom",
        "3px solid #00C0F1"
      );
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-rainy",
        "borderBottom",
        "none"
      );
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-snowflake",
        "borderBottom",
        "none"
      );
    } else if (selectedButton == "rainyCities") {
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-rainy",
        "borderBottom",
        "3px solid #00C0F1"
      );
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-sunny",
        "borderBottom",
        "none"
      );
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-snowflake",
        "borderBottom",
        "none"
      );
    } else {
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-snowflake",
        "borderBottom",
        "3px solid #00C0F1"
      );
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-rainy",
        "borderBottom",
        "none"
      );
      sortCityAndContinent.updateElementAttributeWithGivenValue(
        "display-sunny",
        "borderBottom",
        "none"
      );
    }
  }
  /**
   *Update the city details based on city count in the spin box
   *
   */
  updateCityDetailsByCityCount() {
    var cityCount = document.getElementById("spinBox").value;
    if (cityCount == null) document.getElementById("spinBox").value = 3;
    sortCityAndContinent.cardLayout.replaceChildren();
    if (cityCount > 10) {
      cityCount = 10;
      document.getElementById("spinBox").value = 10;
    } else if (cityCount < 3) {
      cityCount = 3;
      document.getElementById("spinBox").value = 3;
    }
    if (selectedButton == "rainyCities") {
      for (
        let i = 0;
        i < cityCount && i < sortCityAndContinent.rainyCities.length;
        i++
      ) {
        sortCityAndContinent.createCardLayout(
          sortCityAndContinent.rainyCities[i]
        );
      }
    } else if (selectedButton == "coldCities") {
      for (
        let i = 0;
        i < cityCount && i < sortCityAndContinent.coldCities.length;
        i++
      ) {
        sortCityAndContinent.createCardLayout(
          sortCityAndContinent.coldCities[i]
        );
      }
    } else {
      for (
        let i = 0;
        i < cityCount && i < sortCityAndContinent.sunnyCities.length;
        i++
      ) {
        sortCityAndContinent.createCardLayout(
          sortCityAndContinent.sunnyCities[i]
        );
      }
    }
  }
  /**
   *This function creates a card and display the city details based on city count in spin box
   *
   * @param {string} cardCityName Passing the city name to create card for that city
   * @return {void} nothing
   */
  createCardLayout(cardCityName) {
    var card = document.createElement("div");
    sortCityAndContinent.cardLayout.appendChild(card);
    card.classList.add("cardlayout-bg");
    card.style.backgroundImage = `url(../assets/${cardCityName}.svg)`;
    var cardContainer = document.createElement("div");
    var weatherDiv = document.createElement("div");
    card.appendChild(cardContainer);
    card.appendChild(weatherDiv);
    cardContainer.classList.add("place-container");
    sortCityAndContinent.createCityNameInCard(cardContainer, cardCityName);
    sortCityAndContinent.createTimeAndDateInCard(cardContainer, cardCityName);
    sortCityAndContinent.createHumidityInCard(cardContainer, cardCityName);
    sortCityAndContinent.createPrecipitationInCard(cardContainer, cardCityName);
    sortCityAndContinent.createWeatherInCard(weatherDiv, cardCityName);
  }
  /**
   *This function create div and append class name and city name
   *
   * @param {string} cardContainer To append the city name to card container
   * @param {string} cardCityName To get data using cardCityName
   * @return {void} nothing
   */
  createCityNameInCard(cardContainer, cardCityName) {
    var cityName = document.createTextNode(data[cardCityName].cityName);
    var currentCity = document.createElement("div");
    currentCity.classList.add("place-card");
    currentCity.appendChild(cityName);
    cardContainer.appendChild(currentCity);
  }
  /**
   *This function create div and append class name, humidity percent and icon
   *
   * @param {string} cardContainer To append the humidity percent and icon to card container
   * @param {string} cardCityName To get data using cardCityName
   * @return {void} nothing
   */
  createHumidityInCard(cardContainer, cityName) {
    var humiDiv = document.createElement("div");
    var humidityIcon = document.createElement("img");
    var humiPercent = document.createTextNode(data[cityName].humidity);
    humiDiv.classList.add("percent-card");
    humidityIcon.classList.add("layout-icon");
    humidityIcon.setAttribute("src", "assets/humidityIcon.svg");
    humiDiv.appendChild(humidityIcon);
    humiDiv.appendChild(humiPercent);
    cardContainer.appendChild(humiDiv);
  }
  /**
   *This function create div and append class name, date and time
   *Update the live time using set interval
   *
   * @param {string} cardContainer To append the date and time to card container
   * @param {string} cardCityName To get data using cardCityName
   * @return {void} nothing
   */
  createTimeAndDateInCard(cardContainer, cardCityName) {
    let timeOut;
    var timeDiv = document.createElement("div");
    var time = document.createTextNode("10:10 AM");
    var dateDiv = document.createElement("div");
    var date = document.createTextNode("10-Mar-2020");
    cardContainer.appendChild(timeDiv);
    cardContainer.appendChild(dateDiv);
    timeDiv.classList.add("date-card");
    timeDiv.appendChild(time);
    dateDiv.classList.add("date-card");
    dateDiv.appendChild(date);
    sortCityAndContinent.updateLiveTimeAndDateInCard(
      cardCityName,
      timeDiv,
      dateDiv
    );
    clearInterval(timeOut);
    timeOut = setInterval(
      sortCityAndContinent.updateLiveTimeAndDateInCard,
      1,
      cardCityName,
      timeDiv,
      dateDiv
    );
  }
  /**
   *This function create div and append class name, precipitation percent and icon
   *
   * @param {string} cardContainer To append the place div to card container
   * @param {string} cardCityName To get data using cardCityName
   * @return {void} nothing
   */
  createPrecipitationInCard(cardContainer, cityName) {
    var preciDiv = document.createElement("div");
    var preciIcon = document.createElement("img");
    var preciPercent = document.createTextNode(data[cityName].precipitation);
    preciDiv.classList.add("percent-card");
    preciIcon.classList.add("layout-icon");
    preciIcon.setAttribute("src", "assets/precipitationIcon.svg");
    preciDiv.appendChild(preciIcon);
    preciDiv.appendChild(preciPercent);
    cardContainer.appendChild(preciDiv);
  }
  /**
   *This function create div and append class name, weather image and temperature
   *
   * @param {string} cardContainer To append the weather icon, temperature to card container
   * @param {string} cardCityName To get data using cardCityName
   * @return {void} nothing
   */
  createWeatherInCard(weatherDiv, cardCityName) {
    var weatherImg = document.createElement("img");
    var weatherPercentDiv = document.createElement("div");
    var weatherPercent = document.createTextNode(
      `${parseInt(data[cardCityName].temperature)}°C`
    );
    weatherDiv.classList.add("temp-layout");
    weatherImg.classList.add("sunny-card");
    weatherPercentDiv.classList.add("temp-card");
    var selectedIcon =
      selectedButton === "sunnyCities"
        ? "sunny"
        : selectedButton === "rainyCities"
        ? "rainy"
        : "snowFlake";
    weatherImg.setAttribute("src", `assets/${selectedIcon}Icon.svg`);
    weatherDiv.appendChild(weatherImg);
    weatherDiv.appendChild(weatherPercentDiv);
    weatherPercentDiv.appendChild(weatherPercent);
  }
  /**
   *To update the live time and date for the cities inside the card
   *
   * @param {string} cardCityName Passing the city name to update live the live date and time
   * @param {string} timeID Passing time id to update the live time
   * @param {string} dateID Passing date id to update the live date
   * @return {void} nothing
   */
  updateLiveTimeAndDateInCard(cardCityName, timeID, dateID) {
    var period, hour, minute;
    var time = new Date().toLocaleString("en-US", {
      timeZone: data[cardCityName].timeZone,
    });
    var day = new Date(time).getDate();
    var month = new Date(time).toLocaleString("en-US", { month: "short" });
    var year = new Date(time).getFullYear();
    dateID.innerHTML = `${day}-${month}-${year}`;
    hour = new Date(time).getHours();
    minute = new Date(time).getMinutes();
    period =
      hour == 0
        ? (period = "AM")
        : hour >= 12 && hour <= 24
        ? (period = "PM")
        : (period = "AM");
    hour = hour == 0 ? 12 : hour > 12 && hour <= 24 ? (hour -= 12) : hour;
    hour = sortCityAndContinent.prefixZeroToTime(hour);
    minute = sortCityAndContinent.prefixZeroToTime(minute);
    var timeObj = {
      hour: hour,
      minute: minute,
      period: period,
    };
    timeID.innerHTML = sortCityAndContinent.setLiveTimeInCard.call(timeObj);
  }
  /**
   *This function append hour, minute and period using this through call method
   *
   * @param {object} timeObj Passing time object to append hour, minute and period
   * @return {string} returns the time after append
   */
  setLiveTimeInCard(timeObj) {
    return this.hour + ":" + this.minute + " " + this.period;
  }
  /**
   *To scroll the city details using arrow button only if the card overflow
   *
   */
  addCarouselForCardOverflow() {
    var scrollButton = document.getElementsByClassName("scroll-navigation");
    var card = document.getElementById("card-layout");
    for (let i = 0; i < scrollButton.length; i++) {
      if (card.scrollWidth > card.clientWidth) {
        scrollButton[i].style.display = "block";
      } else {
        scrollButton[i].style.display = "none";
      }
      //scrollButton[i].style.scrollBehavior = "smooth";
    }
  }
  //Bottom section
  /**
   *Get the selected arrow from UI and update the arrow icon
   *
   * @param {string} selectedId change the arrow icon for the selected arrow by using ID
   * @return {void} nothing
   */
  getSelectedArrowIcon(selectedId) {
    let selectedArrow = document.getElementById(selectedId).name;
    if (selectedArrow === "arrowUp") {
      document.getElementById(selectedId).name = "arrowDown";
      document.getElementById(selectedId).src = "assets/arrowDown.png";
    } else {
      document.getElementById(selectedId).name = "arrowUp";
      document.getElementById(selectedId).src = "assets/arrowUp.png";
    }
    sortCityAndContinent.sortByContinentAndTemperature();
  }
  /**
   *Sort the continent name and temperature based on the selected arrow from UI
   *Sort them either by ascending or descending based on arrow icon
   *
   */
  sortByContinentAndTemperature() {
    let gridLayout = document.getElementById("grid-continent");
    gridLayout.replaceChildren();
    let continentArrow = document.getElementById("continent-arrow").name;
    let tempArrow = document.getElementById("temperature-arrow").name;
    sortCityAndContinent.continent.sort(function (a, b) {
      if (continentArrow == "arrowUp") {
        if (a[0] > b[0]) return -1;
        if (a[0] < b[0]) return 1;
      } else if (continentArrow == "arrowDown") {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
      }
      var currentTemperature = parseInt(
        data[a[1].replace("_", "").toLowerCase()].temperature
      );
      var nextTemperature = parseInt(
        data[b[1].replace("_", "").toLowerCase()].temperature
      );
      if (tempArrow == "arrowDown") {
        if (currentTemperature > nextTemperature) return 1;
        if (currentTemperature < nextTemperature) return -1;
      }
      if (tempArrow == "arrowUp") {
        if (currentTemperature < nextTemperature) return 1;
        if (currentTemperature > nextTemperature) return -1;
      }
    });
    for (let i = 0; i < 12; i++)
      sortCityAndContinent.createGridLayout(sortCityAndContinent.continent[i]);
  }
  /**
   *Create card for first 12 sorted continent using grid and displays continent details in sorted order
   *
   * @param {Array} continent Display the continent details using continent name and city stored in array
   * @return {void} nothing
   */
  createGridLayout(continent) {
    let gridLayout = document.getElementById("grid-continent");
    var continentInfo = document.createElement("div");
    gridLayout.appendChild(continentInfo);
    continentInfo.classList.add("continent-info");
    sortCityAndContinent.displayContinentName(continentInfo, continent);
    sortCityAndContinent.displayContinentCityTemperature(
      continentInfo,
      continent
    );
    sortCityAndContinent.displayContinentCityNameAndTime(
      continentInfo,
      continent
    );
    sortCityAndContinent.displayContinentHumidity(continentInfo, continent);
  }
  /**
   *Create element, text node,add class and append them in grid layout
   *Display the continent name in continent details
   *
   * @param {string} continentInfo To append the continent name using continentInfo container
   * @param {Array} continent To get the continent name using continent array
   * @return {void} nothing
   */
  displayContinentName(continentInfo, continent) {
    let continentContainerElement = document.createElement("div");
    let continentName = document.createTextNode(continent[0]);
    continentContainerElement.classList.add("continent-name");
    continentContainerElement.appendChild(continentName);
    continentInfo.appendChild(continentContainerElement);
  }
  /**
   *Create element, text node, add class and append them in grid layout
   *Append and display the city temperature in continent details
   *
   *
   * @param {string} continentInfo To append the city temperature using continentInfo container
   * @param {Array} continent To get the city temperature using city name in array
   * @return {void} nothing
   */
  displayContinentCityTemperature(continentInfo, continent) {
    let tempContainerElement = document.createElement("div");
    let temperature = document.createTextNode(
      `${parseInt(
        data[continent[1].toLowerCase().replace("_", "")].temperature
      )} °C`
    );
    tempContainerElement.classList.add("continent-temp");
    continentInfo.appendChild(tempContainerElement);
    tempContainerElement.appendChild(temperature);
  }
  /**
   *Create element, add class and append them in grid layout
   *Append and display the humidity in continent details
   *
   * @param {string} continentInfo  Append the humidity using continentInfo container
   * @return {void} nothing
   */
  displayContinentHumidity(continentInfo, continent) {
    let humiContainerElement = document.createElement("div");
    let humidity = document.createTextNode(
      `${parseInt(
        data[continent[1].toLowerCase().replace("_", "")].humidity
      )} %`
    );
    let humidityIcon = document.createElement("img");
    humidityIcon.classList.add("humidity-icon");
    humidityIcon.setAttribute("src", "assets/humidityIcon.svg");
    humiContainerElement.appendChild(humidityIcon);
    humiContainerElement.classList.add("continent-humidity");
    continentInfo.appendChild(humiContainerElement);
    humiContainerElement.appendChild(humidity);
  }
  /**
   *Create element, add class and append them in grid layout
   *Append and display the city name and live time in continent details
   *
   * @param {string} continentInfo Append city name and live time using continentInfo container
   * @param {Array} continent To get the city temperature using city name in array
   * @return {void} nothing
   */
  displayContinentCityNameAndTime(continentInfo, continent) {
    let cityContainerElement = document.createElement("div");
    let cityName = continent[1].replace("_", "");
    cityContainerElement.classList.add("city-name");
    continentInfo.appendChild(cityContainerElement);
    sortCityAndContinent.updateLiveTimeInContinent(
      cityName,
      cityContainerElement
    );
    setInterval(
      sortCityAndContinent.updateLiveTimeInContinent,
      1,
      cityName,
      cityContainerElement
    );
  }
  /**
   *To update the live time in continent details using setInterval and continent name
   *
   * @param {string} cityName Display the city name and live time using city name
   * @param {string} cityContainerElement Append the city name, live time in city container
   * @return {void} nothing
   */
  updateLiveTimeInContinent(cityName, cityContainerElement) {
    let period, hour, minute;
    let city = cityName.toLowerCase();
    let time = new Date().toLocaleString("en-US", {
      timeZone: data[city].timeZone,
    });
    hour = new Date(time).getHours();
    minute = new Date(time).getMinutes();
    period =
      hour == 0
        ? (period = "AM")
        : hour >= 12 && hour <= 24
        ? (period = "PM")
        : (period = "AM");
    hour = hour == 0 ? 12 : hour > 12 && hour <= 24 ? (hour -= 12) : hour;
    hour = sortCityAndContinent.prefixZeroToTime(hour);
    minute = sortCityAndContinent.prefixZeroToTime(minute);
    cityContainerElement.innerHTML = `${cityName}, ${hour}:${minute} ${period}`;
  }
}

/**
 *Call the function to update the city details based on selected city
 *
 */
function displaySelectedCity() {
  //Creating an object for getSelectedCityDetails and access the method inside the constructor using object name
  selectedCityDetails = new GetSelectedCityDetails(
    document.getElementById("selectedCity").value.toLowerCase()
  );
  const cities = document.getElementById("city-dropDown");
  for (const city in data) {
    let options = document.createElement("OPTION");
    options.value = data[city].cityName;
    cities.appendChild(options);
  }
  selectedCityDetails.updateSelectedCityInfo();
  document
    .getElementById("selectedCity")
    .addEventListener("change", selectedCityDetails.updateSelectedCityInfo);
}

/**
 *Display the city and continent details after sorting and filtering based on condition
 *
 */
function displaySortAndFilterCity() {
  let allCityName = [];
  for (let cityName in data) {
    allCityName.push(cityName);
  }
  let timeZone = [];
  for (let city in data) {
    timeZone.push(data[city].timeZone);
  }
  //creating an object for FilterAndSortCityAndContinentDetails and passing the city name and time zone array
  sortCityAndContinent = new FilterAndSortCityAndContinentDetails(
    allCityName,
    timeZone
  );
  sortCityAndContinent.sortCityDetailsBasedOnCondition();
  sortCityAndContinent.displaySunnyCityDetails();
  document
    .getElementById("rainy-button")
    .addEventListener("click", sortCityAndContinent.displayRainyCityDetails);
  document
    .getElementById("sunny-button")
    .addEventListener("click", sortCityAndContinent.displaySunnyCityDetails);
  document
    .getElementById("snowflake-button")
    .addEventListener("click", sortCityAndContinent.displayColdCityDetails);
  setInterval(sortCityAndContinent.addCarouselForCardOverflow, 1);
  //To move the card backward while clicking the backward arrow
  document.getElementById("scroll-backward").addEventListener("click", () => {
    sortCityAndContinent.cardLayout.scrollLeft -= 660;
  });
  //To move the card forward while clicking the forward arrow
  document.getElementById("scroll-forward").addEventListener("click", () => {
    sortCityAndContinent.cardLayout.scrollLeft += 660;
  });
  sortCityAndContinent.sortByContinentAndTemperature();
  document.getElementById("continent-arrow").addEventListener("click", () => {
    sortCityAndContinent.getSelectedArrowIcon("continent-arrow");
  });
  document.getElementById("temperature-arrow").addEventListener("click", () => {
    sortCityAndContinent.getSelectedArrowIcon("temperature-arrow");
  });
}

/**
 *Fetch the data of all the cities from api
 *
 */
async function fetchCityData() {
  let fetchCityData = await getCityData();

  await fetchCityData.forEach((element) => {
    data[element.cityName.toLowerCase()] = element;
  });

  displaySelectedCity();
  displaySortAndFilterCity();
}
//Anonymous function to display the weather details in UI
(async () => {
  document.getElementById("main-container").style.display = "none";
  document.body.style.backgroundImage = 'url("./assets/weather.gif")';
  document.body.style.backgroundPosition = "center top";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "50%";
  document.getElementById("selectedCity").value = "Vienna";
  await fetchCityData();
  setInterval(async () => {
    await fetchCityData();
  }, 14400000);
  document.getElementById("main-container").style.display = "block";
  document.body.style.backgroundImage = 'url("./assets/background.svg")';
  document.body.style.backgroundSize = "100%";
})();
