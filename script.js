const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const errorMessage = document.getElementById("errorMessage");

const locationText = document.getElementById("location");
const dateText = document.getElementById("date");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

function getWeatherInfo(code) {

    if (code === 0) {
        return {
            text: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            text: "Partly Cloudy",
            icon: "🌤️"
        };
    }

    if (code === 3) {
        return {
            text: "Cloudy",
            icon: "☁️"
        };
    }

    if ([45, 48].includes(code)) {
        return {
            text: "Foggy",
            icon: "🌫️"
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            text: "Drizzle",
            icon: "🌦️"
        };
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
        return {
            text: "Rain",
            icon: "🌧️"
        };
    }

    if ([71, 73, 75, 77].includes(code)) {
        return {
            text: "Snow",
            icon: "❄️"
        };
    }

    if ([80, 81, 82].includes(code)) {
        return {
            text: "Rain Showers",
            icon: "🌦️"
        };
    }

    if ([95, 96, 99].includes(code)) {
        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Unknown",
        icon: "🌍"
    };
}

function updateDate() {

    const now = new Date();

    dateText.textContent = now.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

function displayWeather(data, cityName) {

    const current = data.current;

    const weatherInfo = getWeatherInfo(
        current.weather_code
    );

    locationText.textContent = cityName;

    temperature.textContent =
        Math.round(current.temperature_2m) + "°";

    condition.textContent =
        weatherInfo.text;

    weatherIcon.textContent =
        weatherInfo.icon;

    feelsLike.textContent =
        Math.round(current.apparent_temperature);

    humidity.textContent =
        current.relative_humidity_2m + "%";

    wind.textContent =
        Math.round(current.wind_speed_10m) + " km/h";

    pressure.textContent =
        Math.round(current.surface_pressure) + " hPa";

    visibility.textContent =
        (current.visibility / 1000).toFixed(1) + " km";

    updateDate();

    errorMessage.textContent = "";
}

async function getWeather(latitude, longitude, cityName) {

    try {

        errorMessage.textContent =
            "Loading weather...";

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,visibility&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather data unavailable");
        }

        const data = await response.json();

        displayWeather(data, cityName);

    } catch (error) {

        errorMessage.textContent =
            "Unable to fetch weather data. Please try again.";
    }
}

async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }

    try {

        errorMessage.textContent =
            "Searching city...";

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error();
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            errorMessage.textContent =
                "City not found. Please enter a valid city.";

            return;
        }

        const result = data.results[0];

        const cityName =
            result.name +
            (result.country ? ", " + result.country : "");

        await getWeather(
            result.latitude,
            result.longitude,
            cityName
        );

    } catch (error) {

        errorMessage.textContent =
            "Unable to search for this city.";
    }
}

function getCurrentLocation() {

    if (!navigator.geolocation) {

        errorMessage.textContent =
            "Geolocation is not supported by your browser.";

        return;
    }

    errorMessage.textContent =
        "Getting your location...";

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            await getWeather(
                latitude,
                longitude,
                "Your Current Location"
            );
        },

        function() {

            errorMessage.textContent =
                "Location permission was denied.";
        }
    );
}

searchBtn.addEventListener(
    "click",
    searchCity
);

locationBtn.addEventListener(
    "click",
    getCurrentLocation
);


cityInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            searchCity();
        }

    }
);

getWeather(
    28.6139,
    77.2090,
    "New Delhi, India"
);