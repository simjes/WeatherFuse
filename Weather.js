var Observable = require('FuseJS/Observable');
var Timer = require("FuseJS/Timer");
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

/*Lifecycle.onEnteringForeground = function() {
    console.log("test");
    debug_log("foreground");
    isItNight();
}; */



//temp init, since lifecycle event not working
Timer.create(function() {
    isItNight();
    //getCurrentWeather();
    currentIcon.value = "sun"; //TODO: get current weather
}, 1, false);

//Check daytime status
Timer.create(function() {
    isItNight();
}, 1800000, true);

//Check weather status
Timer.create(function() { //TODO: query for weather
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
            currentIcon.value="sun";
            break;
    }
}, 2000, true);

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

function getCurrentWeather() { //TODO
    var currentTime = new Date();
}

module.exports = {
    skyColor: skyColor,
    groundColor: groundColor,
    currentIcon: currentIcon
};
