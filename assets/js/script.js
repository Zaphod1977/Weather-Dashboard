// Search button click – fetch geo coords, then weather
$('#srcBtn').click(function () {
    var city = $('#searchField').val().trim();
    if (!city) return;  // Prevent empty search

    var query = city;
    if (/^\d{5}(-\d{4})?$/.test(city)) {  // US ZIP code (5 or 9 digits)
        query = city + ",US";
    } else {
        // Normalize city/state input (e.g., "Staunton, IL" → "Staunton,IL") and force US
        query = city.replace(/\s*,\s*/g, ',') + ",US";
    }

    $("#localFcst").empty();
    $('#localFcst').append("<h1>" + city + "</h1>");  // Show original input (with space)

    $.ajax({
        url: "https://api.openweathermap.org/geo/1.0/direct?q=" + encodeURIComponent(query) + "&limit=1&appid=7a1a53ab77da01ea835cb4760a59e848",
        success: function (data) {
            if (data && data.length > 0) {
                $.ajax({
                    url: "https://api.openweathermap.org/data/3.0/onecall?units=imperial&lat=" + data[0].lat + "&lon=" + data[0].lon + "&appid=7a1a53ab77da01ea835cb4760a59e848",
                    success: function (weather) {
                        console.log("Full weather data:", weather);
                        populateWeather(weather, city);
                    },
                    error: function (err) {
                        console.log("Weather API error:", err);
                        $("#localFcst").append("<h3>Error loading weather data</h3>");
                    }
                });
            } else {
                $("#localFcst").append("<h3>City not found – try a different name, state, or ZIP code</h3>");
            }
        },
        error: function (er) {
            console.log("Geo API error:", er);
            $("#localFcst").append("<h3>Error finding city</h3>");
        }
    });
});

// Reusable function to populate the 5-day forecast cards
function populateForecast(dailyData) {
    var today = moment();
    var days = [
        moment(today).add(1, 'days'),
        moment(today).add(2, 'days'),
        moment(today).add(3, 'days'),
        moment(today).add(4, 'days'),
        moment(today).add(5, 'days')
    ];

    var dayIds = ["#dayOne", "#dayTwo", "#dayThree", "#dayFour", "#dayFive"];

    for (let i = 0; i < 5; i++) {
        $(dayIds[i]).empty();
        $(dayIds[i]).text(days[i].format("MMM D"));  // e.g., "Jan 3"
        $(dayIds[i]).append("<img src='http://openweathermap.org/img/wn/" + dailyData[i].weather[0].icon + "@2x.png' alt='Weather icon'>");
        $(dayIds[i]).append("<h5>Temp: " + dailyData[i].temp.eve + "°F</h5>");
        $(dayIds[i]).append("<h5>Wind: " + dailyData[i].wind_speed + " mph</h5>");
        $(dayIds[i]).append("<h5>Humidity: " + dailyData[i].humidity + "%</h5>");
    }
}

// Main function to populate current weather, save to localStorage, and show forecast
function populateWeather(weatherData, cityName) {
    // Current weather
    $("#localFcst").append("<h3>Temp: " + weatherData.current.temp + "°F</h3>");
    $("#localFcst").append("<h3>Wind: " + weatherData.current.wind_speed + " mph</h3>");
    $("#localFcst").append("<h3>Humidity: " + weatherData.current.humidity + "%</h3>");
    $("#localFcst").append("<h3>UV Index: " + weatherData.current.uvi + "</h3>");

    // Save full object for later clicks
    var cityObj = {
        name: cityName,
        temp: weatherData.current.temp,
        wind: weatherData.current.wind_speed,
        humidity: weatherData.current.humidity,
        uvi: weatherData.current.uvi,
        daily: weatherData.daily
    };

    localStorage.setItem(cityName, JSON.stringify(cityObj));

    // Add button for saved city
    var cityButton = $("<div>").addClass("resultBtn").text(cityName);
    cityButton.on("click", function () {
        var savedCityData = JSON.parse(localStorage.getItem($(this).text()));

        $("#localFcst").empty();
        $("#localFcst").append("<h1>" + savedCityData.name + "</h1>");
        $("#localFcst").append("<h3>Temp: " + savedCityData.temp + "°F</h3>");
        $("#localFcst").append("<h3>Wind: " + savedCityData.wind + " mph</h3>");
        $("#localFcst").append("<h3>Humidity: " + savedCityData.humidity + "%</h3>");
        $("#localFcst").append("<h3>UV Index: " + savedCityData.uvi + "</h3>");

        // Populate forecast from saved data
        populateForecast(savedCityData.daily);
    });

    $("#resultsDiv").append(cityButton);

    // Initial forecast for fresh search
    populateForecast(weatherData.daily);
}