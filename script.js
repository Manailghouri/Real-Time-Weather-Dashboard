let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = 'ec1d76f50d8a96aff134bd0d3abd9db7',
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecastCard = document.querySelector('.day-forecast'),
    aqiCard = document.querySelectorAll('.highlights .card')[0],
    sunriseCard = document.querySelectorAll('.highlights .card')[1],
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windspeedVal = document.getElementById('windspeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    hourlyForecastCard = document.querySelector('.hourly-forecast'),
    aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

function getWeatherDetails(name, lat, lon, country, state) {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Air Pollution
    fetch(AIR_POLLUTION_API_URL)
        .then(res => res.json())
        .then(data => {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
            let aqi = data.list[0].main.aqi;

            aqiCard.innerHTML = `
                <div class="card-head">
                    <p>Air Quality Index</p>
                    <p class="air-index aqi-${aqi}">${aqiList[aqi - 1]}</p>
                </div>
                <div class="air-indices">
                    <i class="fa-regular fa-wind fa-3x"></i>
                    <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                    <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                    <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                    <div class="item"><p>CO</p><h2>${co}</h2></div>
                    <div class="item"><p>NO</p><h2>${no}</h2></div>
                    <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                    <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                    <div class="item"><p>O3</p><h2>${o3}</h2></div>
                </div>`;
        })
        .catch(() => {
            alert('Failed to fetch air quality');
        });

    // Current Weather
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            let date = new Date();
            currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${(data.main.temp - 273.15).toFixed(1)}&deg;C</h2>
                        <p>${data.weather[0].description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                    <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
                </div>`;

            // Sunrise/Sunset and Extras
            let { sunrise, sunset } = data.sys;
            let { timezone, visibility } = data;
            let { humidity, pressure, feels_like } = data.main;
            let { speed } = data.wind;

            let sunriseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A');
            let sunsetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

            sunriseCard.innerHTML = `
                <div class="card-head"><p>Sunrise & Sunset</p></div>
                <div class="sunrise-sunset">
                    <div class="item">
                        <div class="icon"><i class="fa-light fa-sunrise fa-4x"></i></div>
                        <div><p>Sunrise</p><h2>${sunriseTime}</h2></div>
                    </div>
                    <div class="item">
                        <div class="icon"><i class="fa-light fa-sunset fa-4x"></i></div>
                        <div><p>Sunset</p><h2>${sunsetTime}</h2></div>
                    </div>
                </div>`;

            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure} hPa`;
            visibilityVal.innerHTML = `${(visibility / 1000).toFixed(1)} km`;
            windspeedVal.innerHTML = `${speed} m/s`;
            feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(1)}°C`;
        })
        .catch(() => {
            alert('Failed to fetch current weather data.');
        });

    // Forecast (Hourly + 5-Day)
    fetch(FORECAST_API_URL)
        .then(res => res.json())
        .then(data => {
            // Hourly
            let hourlyForecast = data.list;
            hourlyForecastCard.innerHTML = '';
            for (let i = 0; i <= 7; i++) {
                let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
                let hr = hrForecastDate.getHours();
                let ampm = hr >= 12 ? 'PM' : 'AM';
                hr = hr % 12 || 12;
                hourlyForecastCard.innerHTML += `
                    <div class="card">
                        <p>${hr} ${ampm}</p>
                        <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="">
                        <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}°C</p>
                    </div>`;
            }

            // Daily Forecast
            let uniqueDays = [];
            let fiveDaysForecast = data.list.filter(forecast => {
                let day = new Date(forecast.dt_txt).getDate();
                if (!uniqueDays.includes(day)) {
                    uniqueDays.push(day);
                    return true;
                }
                return false;
            });

            fiveDaysForecastCard.innerHTML = '';
            for (let i = 1; i < fiveDaysForecast.length; i++) {
                let date = new Date(fiveDaysForecast[i].dt_txt);
                fiveDaysForecastCard.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                            <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}°C</span>
                        </div>
                        <p>${date.getDate()} ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>`;
            }
        })
        .catch(() => {
            alert('Failed to fetch forecast');
        });
}

function getCityCoordinatesByName() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';

    if (!cityName) {
        alert("Please enter a city name.");
        return;
    }

    const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEO_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                alert(`City "${cityName}" not found.`);
                return;
            }
            const { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
        })
        .catch(() => {
            alert('Failed to fetch city coordinates.');
        });
}

function getCityCoordinatesByLocation() {
    navigator.geolocation.getCurrentPosition(
        position => {
            let { latitude, longitude } = position.coords;
            const REVERSE_GEO_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;
            fetch(REVERSE_GEO_URL)
                .then(res => res.json())
                .then(data => {
                    let { name, country, state } = data[0];
                    getWeatherDetails(name, latitude, longitude, country, state);
                })
                .catch(() => {
                    alert('Failed to fetch your location info.');
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert('Please allow location access to get current weather.');
            }
        }
    );
}

// ✅ Event Listeners
searchBtn.addEventListener('click', getCityCoordinatesByName);
locationBtn.addEventListener('click', getCityCoordinatesByLocation);
cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') getCityCoordinatesByName();
});
window.addEventListener('load', getCityCoordinatesByLocation);
