var searchCityForm = document.querySelector('#city-search-form');
var searchCity = document.querySelector('#search');
var searchedCityContainerEl = document.querySelector('#search-history-buttons');
var currentSearchedCity = document.querySelector('#current-city');
var currentWeatherContainerEl = document.querySelector(
  '#current-weather-container'
);
var currentCityNameEl = document.querySelector('#current-city');
var currentDateEl = document.querySelector('#current-date');
var currentWeatherIconEl = document.querySelector('#current-weather-icon');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEl = document.querySelector('#current-humidity');
var currentWindspeedEl = document.querySelector('#windspeed');
var currentUvEl = document.querySelector('#uv-index');
var forecastContainer = document.querySelector('#forecast-cards');
//global API variables
var apiUnits = '&units=imperial';
var apiKey = '&appid=dfd70fe025fe63321e2acd91e52a5ebf';

//localStorage array
//check if the key-value pair already exists in Local Storage. If not, initialize empty array.
var cities = JSON.parse(localStorage.getItem('cities')) || [];

var cityName;

var formSubmitHandler = function (event) {
  event.preventDefault();

  //clear old content
  var cityName = searchCity.value.trim();

  if (cityName) {
    currentCityNameEl.textContent = cityName;
    getGeoCoordinates(cityName);
    //clear input field after function executes
    searchCity.value = '';
    //save to local storage
    addToSearchHistoryAndLocalStorage(cityName);
  } else {
    alert('Please enter a city name.');
  }
};

var btnClickHandler = function (event) {
  forecastContainer.textContent = '';
  var cityName = event.target.getAttribute('searched-city');
  currentCityNameEl.textContent = cityName;
  getGeoCoordinates(cityName);
};

var getGeoCoordinates = function (cityName) {
  //lookup the city coordinates first
  var apiUrl =
    'https://api.openweathermap.org/data/2.5/weather?q=' +
    cityName +
    apiUnits +
    apiKey;
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          var lat = data.coord.lat;
          var lon = data.coord.lon;
          getOneCallData(lat, lon);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect.');
    });
};

var getOneCallData = function (lat, lon) {
  var oneCallApiUrl =
    'https://api.openweathermap.org/data/2.5/onecall?lat=' +
    lat +
    '&lon=' +
    lon +
    apiUnits +
    '&exclude=hourly' +
    apiKey;

  fetch(oneCallApiUrl).then(function (response) {
    response.json().then(function (data) {
      displayCurrentWeather(data);
      displayForecast(data);
    });
  });
};

var displayCurrentWeather = function (data) {
  var { dt, uvi, temp, humidity, wind_speed } = data.current;
  var { icon } = data.current.weather[0];

  //add border to the container
  currentWeatherContainerEl.classList.add('border', 'p-2');
  //add current date
  var currentDate = new Date(dt * 1000).toLocaleDateString();
  var currentDateSpan = document.createElement('span');
  currentDateSpan.textContent = ' (' + currentDate + ')';
  currentCityNameEl.appendChild(currentDateSpan);
  //add current weather icon
  var currentWeatherIconUrl =
    'https://openweathermap.org/img/wn/' + icon + '.png';
  var currentIcon = document.createElement('img');
  currentIcon.setAttribute('src', currentWeatherIconUrl);
  currentIcon.setAttribute('width', '50');
  currentIcon.setAttribute('height', '50');
  currentCityNameEl.appendChild(currentIcon);
  //add current temp
  currentTempEl.textContent = 'Temperature: ' + temp + ' °F';
  currentWeatherContainerEl.appendChild(currentTempEl);
  //add current humidity
  currentHumidityEl.textContent = 'Humidity: ' + humidity + '%';
  currentWeatherContainerEl.appendChild(currentHumidityEl);
  //add current windspeed
  currentWindspeedEl.textContent = 'Windspeed: ' + wind_speed + ' MPH';
  currentWeatherContainerEl.appendChild(currentWindspeedEl);
  //add current UV Index
  currentUvEl.textContent = 'UV Index: ';
  //create span to hold value
  var uvSpan = document.createElement('span');
  uvSpan.textContent = uvi;
  // add UV class to uvSpan, depending on conditions
  if (uvi <= 2) {
    uvSpan.classList = 'favorable bg-success p-1';
  } else if (uvi > 2 && uvi <= 7) {
    uvSpan.classList = 'moderate bg-warning p-1 ';
  } else if (uvi >= 8) {
    uvSpan.classList = 'severe bg-danger p-1';
  }
  currentUvEl.appendChild(uvSpan);
  currentWeatherContainerEl.appendChild(currentUvEl);
};

var displayForecast = function (data) {
  forecastContainer.textContent = '';

  //add header
  var forecastHeader = document.querySelector('#forecast-header');

  forecastHeader.textContent = '5-Day Forecast:';

  //loop through the days...
  for (i = 0; i <= 4; i++) {
    var { dt, humidity } = data.daily[i];
    var temp = data.daily[i].temp.day;
    var icon = data.daily[i].weather[0].icon;

    //create card container

    var forecastCard = document.createElement('div');
    forecastCard.classList = 'card card-body px-2 bg-primary text-light';
    //create and add date element to card
    var forecastDate = document.createElement('h5');
    forecastDate.textContent = new Date(dt * 1000).toLocaleDateString();
    forecastCard.appendChild(forecastDate);
    //create an icon element
    var iconUrl = 'https://openweathermap.org/img/wn/' + icon + '.png';
    var forecastIcon = document.createElement('img');
    forecastIcon.setAttribute('src', iconUrl);
    forecastIcon.setAttribute('width', '50');
    forecastIcon.setAttribute('height', '50');
    forecastCard.appendChild(forecastIcon);
    //create temperature
    var forecastTemp = document.createElement('p');
    forecastTemp.textContent = 'Temp: ' + temp + '°F';
    forecastCard.appendChild(forecastTemp);
    //add humidity
    var forecastHumidity = document.createElement('p');
    forecastHumidity.textContent = 'Humidity: ' + humidity + '%';
    //append to forecast card
    forecastCard.appendChild(forecastHumidity);
    //append to five day container
    forecastContainer.appendChild(forecastCard);
  }
};

//add city to search history and local storage, if unique

var addToSearchHistoryAndLocalStorage = function (cityName) {
  for (var i = 0; i < cities.length; i++) {
    if (cityName === cities[i]) return;
  }
  cities.push(cityName);
  localStorage.setItem('cities', JSON.stringify(cities));
  addCityToSearchHistory(cityName);
};

var addCityToSearchHistory = function (cityName) {
  var searchButton = document.createElement('button');
  (searchButton.classList = 'list-group-item'), 'list-group-item-action';
  searchButton.textContent = cityName;
  searchButton.setAttribute('searched-city', cityName);
  searchButton.setAttribute('type', 'submit');
  searchedCityContainerEl.appendChild(searchButton);
};

//on page reload, grab cities from array
var loadSearchListOnRefresh = function () {
  for (var i = 0; i < cities.length; i++) {
    addCityToSearchHistory(cities[i]);
  }
  //loop through the array and recreate the buttons
};

searchCityForm.addEventListener('submit', formSubmitHandler);
searchedCityContainerEl.addEventListener('click', btnClickHandler);

loadSearchListOnRefresh();
