var Observable = require('FuseJS/Observable');
var Timer = require("FuseJS/Timer");
var Bundle = require("FuseJS/Bundle");
var GeoLocation = require("FuseJS/GeoLocation");
//var Lifecycle = require('FuseJS/Lifecycle');

var colors = {
    skyDay: "#81D4FA",
    skyNight: "#2159A6",
    groundDay: "#4CAF50",
    groundNight: "#2C882F"
};

var currentIcon = Observable();
var fullUrl = "";
var weatherUrl = "http://api.openweathermap.org/data/2.5/forecast?";
var currentInfo = Observable({
    "city": "",
    "temp": "",
    "icon": ""
});
var clock = Observable();
var lastHour;
var currentWeather = Observable();
var colorOfSky = Observable(colors.skyDay);
var colorOfGround = Observable(colors.groundDay);
/*Lifecycle.onEnteringForeground = function() {
    console.log("test");
    debug_log("foreground");
    isItNight();
}; */

//temp init, since lifecycle event not working
Timer.create(function() {
    console.log("Start getting key");
    var apiKey = JSON.parse(Bundle.readSync("config.json")).api;
    fullUrl = weatherUrl + "APPID=" + apiKey;
    lastHour = new Date().getHours();
    console.log("last hour: " + lastHour);

    getWeatherByLocation();
    readableDateTime();

    isItNight();
}, 1, false);

function isItNight() {
    var currentTime = new Date();
    if (currentTime.getHours() >= 19 || currentTime.getHours() < 9) {
        colorOfSky.value = colors.skyNight;
        colorOfGround.value = colors.groundNight;
    } else {
        colorOfSky.value = colors.skyDay;
        colorOfGround.value = colors.groundDay;
    }
}

function getWeatherByLocation() {
    GeoLocation.getLocation(5000).then(function(location) {
        getCurrentWeather(location.latitude, location.longitude);
    }).catch(function(error) {
        var location = GeoLocation.location;
        getCurrentWeather(location.latitude, location.longitude);
    });
}

function getCurrentWeather(lat, lng) {
    fetch(fullUrl + "&lat=" + lat + "&lon=" + lng).then(function(response) {
        //console.log(response);
        var status = response.status;  // Get the HTTP status code
        console.log(status);
        var response_ok = response.ok; // Is response.status in the 200-range?
        return response.json();    // This returns a promise
    }).then(function(forecast) {
        //currentWeather.value = responseObject;
        console.log(JSON.stringify(forecast));
        //console.log(currentWeather.value.city.name);
        currentInfo.value = {
            "city": forecast.city.name,
            "temp": Math.floor(forecast.list[0].main.temp - 273.15) + " °C",
            "icon": setCurrentIcon(forecast.list[0].weather[0].icon)
        };
        // Do something with the result
    }).catch(function(err) {
        console.log("error");
        console.log(JSON.stringify(err));
        // An error occured parsing Json
    });
}

function setCurrentIcon(forecastIcon) {
    switch (forecastIcon) {
        case "01d":
            return "sun";
        case "01n":
            return "moon";
        case "02d":
            return "cloudySun";
        case "02n":
            return "cloudyMoon";
        case "03d":
        case "03n":
        case "04d":
        case "04n":
            return "cloud";
        case "09d":
        case "09n":
        case "10d":
        case "10n":
            return "rainyCloud";
        //case "11d" || "11n": lightning
        //case "13d" || "13n": snow
        //case "50d" || "50n": mist
    }
}

function readableDateTime() {
    var dateTime = new Date();
    var minutes = dateTime.getMinutes().toString().length == 1 ? '0' + dateTime.getMinutes() : dateTime.getMinutes();
    var hours = dateTime.getHours().toString().length == 1 ? '0' + dateTime.getHours() : dateTime.getHours();
    clock.value = dateTime.getDate() + "." + dateTime.getMonth() + "." + dateTime.getFullYear() + " " + hours + ":" + minutes;
    if (hours !== lastHour) {
        lastHour = hours;
        console.log("getting new data");
        getWeatherByLocation();
        isItNight();
    }
    setTimeout(readableDateTime, 500);
}

module.exports = {
    currentIcon: currentIcon,
    currentInfo: currentInfo,
    clock: clock,
    colorOfSky: colorOfSky,
    colorOfGround: colorOfGround
};
