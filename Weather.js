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


var skyColor = Observable();
var groundColor = Observable();
var currentIcon = Observable("");
var fullUrl = "";
var weatherUrl = "http://api.openweathermap.org/data/2.5/forecast?";
var currentInfo = Observable();
var currentWeather = Observable();
/*Lifecycle.onEnteringForeground = function() {
    console.log("test");
    debug_log("foreground");
    isItNight();
}; */



//temp init, since lifecycle event not working
Timer.create(function() {
    var apiKey = JSON.parse(Bundle.readSync("config.json")).api;
    fullUrl = weatherUrl + "APPID=" + apiKey;

    getWeatherByLocation();

    isItNight();
    currentIcon.value = "rainyCloud"; //TODO: get current weather
}, 1, false);

//Check daytime status
Timer.create(function() {
    isItNight();
}, 1800000, true);

//Check weather status
/*Timer.create(function() { //TODO: query for weather
    switch (currentIcon.value) {
        case "sun":
            currentIcon.value = "cloud";
            break;
        case "cloud":
            currentIcon.value = "cloudySun";
            break;
        case "cloudySun":
            currentIcon.value = "moon";
            break;
        case "moon":
            currentIcon.value="cloudyMoon";
            break;
        case "cloudyMoon":
            currentIcon.value="rainyCloud";
            break;
        case "rainyCloud":
            currentIcon.value="sun";
            break;
    }
}, 5000, true);*/

function isItNight() {
    var currentTime = new Date();
    if (currentTime.getHours() >= 19 || currentTime.getHours() < 9) {
        skyColor.value = colors.skyNight;
        groundColor.value = colors.groundNight;
        return true;
    } else {
        skyColor.value = colors.skyDay;
        groundColor.value = colors.groundDay;
        return false;
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
        console.log(response);
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
            "time": forecast.list[0].dt_txt,//readableDateTime(1471381200), //forecast.list[0].dt
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
        case "03d" || "03n" || "04d" || "04n":
            return "cloud";
        case "09d" || "09n" || "10d" || "10n":
            return "rainyCloud";
        //case "11d" || "11n": lightning
        //case "13d" || "13n": snow
        //case "50d" || "50n": mist
    }
}

//TODO: fix it
function readableDateTime(unixTime) {
    var dateTime = new Date(unixTime*1000);
    var str = dateTime.getDate() + "." + dateTime.getMonth() + "." + dateTime.getFullYear();
    return str;
}

module.exports = {
    skyColor: skyColor,
    groundColor: groundColor,
    currentIcon: currentIcon,
    currentInfo: currentInfo
};
