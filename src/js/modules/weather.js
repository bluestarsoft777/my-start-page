import axios from 'axios';
import dayjs from 'dayjs';
import {
  clearData,
  getData,
  setData,
} from './data';
import {
  apiUrl,
  initTooltips,
} from './helpers';

export async function getWeatherData (lat, lng) {
  const weatherApiurl = `${apiUrl()}/location-and-weather/?lat=${lat}&lng=${lng}`;
  const weatherData =  await axios.get(weatherApiurl)
  .then((response) => {
    // console.log(response.data);
    return response.data;
  });
  return weatherData;
};

export function getWeatherIcon(icon) {
  const iconMap = {
    'clear-day': 'fad fa-fw fa-sun',
    'clear-night': 'fad fa-fw fa-moon-stars',
    rain: 'fad fa-fw fa-cloud-rain',
    snow: 'fad fa-fw fa-cloud-snow',
    sleet: 'fad fa-fw fa-cloud-sleet',
    wind: 'fad fa-fw fa-wind',
    fog: 'fad fa-fw fa-fog',
    cloudy: 'fad fa-fw fa-clouds',
    'partly-cloudy-day': 'fad fa-fw fa-clouds-sun',
    'partly-cloudy-night': 'fad fa-fw fa-clouds-moon',
    hail: 'fad fa-fw fa-cloud-hail',
    hurricane: 'fad fa-fw fa-hurricane',
    thunderstorm: 'fad fa-fw fa-thunderstorm',
    tornado: 'fad fa-fw fa-tornado',
  };
  return iconMap[icon];
}

async function geolocationError(error) {
  console.error(error);
}

const populateHourlyData = (data) => {
  const numHours = 5;
  let hoursMarkup = '';
  for (let i = 0; i < numHours; i += 1) {
    const currentHour = i + 1;
    const {
      apparentTemperature,
      icon,
      summary,
      temperature,
      time,
    } = data[currentHour];
    const hourlyIconClass = getWeatherIcon(icon);
    const timeFormatted = dayjs.unix(time).format('ha');
    const hourTemplate = `
      <li class="list-inline-item text-center">
        <strong>${timeFormatted}</strong><br>
        <i class="${hourlyIconClass}"></i><br>
        ${Math.round(temperature)}&deg;
      </li>
    `;
    hoursMarkup += hourTemplate;
  }
  const finalMarkup = `
    <ul class="list-inline border-top">
      ${hoursMarkup}
    </ul>
  `;
  return finalMarkup;
};

export function populateWeatherAndLocation(weatherAndLocationData) {
  const locationEl = document.querySelector('.weather-location');
  const tooltipEl = document.querySelector('.weather-tooltip');
  const weatherTempEl = document.querySelector('.weather-temp');
  const weatherIcon = document.querySelector('.weather-icon');
  const { locationName } = weatherAndLocationData.location;
  locationEl.textContent = locationName;
  const {
    apparentTemperature,
    icon,
    summary,
    temperature,
  } = weatherAndLocationData.weather.currently;
  const hourlyMarkup = populateHourlyData(weatherAndLocationData.weather.hourly.data);
  const weatherIconClass = getWeatherIcon(icon);
  const tooltipString = `
    <div class="text-center mb-2">
      <i class="fad fa-fw fa-map-marker-alt"></i> ${locationName}
      <br>
      <i class="${weatherIconClass}"></i> ${summary}
      <br>
      <i class="fad fa-fw fa-thermometer-half"></i> ${Math.round(temperature)}&deg; (feels like ${Math.round(apparentTemperature)}&deg;)
    </div>
    ${hourlyMarkup}
  `;

  weatherTempEl.innerHTML = `${Math.round(temperature)}&deg;`;
  tooltipEl.setAttribute('data-tippy-content', tooltipString);
  initTooltips();
  weatherIcon.removeAttribute('class');
  weatherIcon.setAttribute('class', `${weatherIconClass} weather-icon`);
}

export async function resetAndGetWeatherData(lat, lng) {
  clearData('weatherData');
  clearData('weatherLastUpdated');
  const weatherAndLocation = await getWeatherData(lat, lng);
  setData('weatherData', weatherAndLocation);
  setData('weatherLastUpdated', dayjs());

  return weatherAndLocation;
}

export async function getLocationNameAndWeather(position) {
  const lng = position.coords.longitude;
  const lat = position.coords.latitude;

  const lastUpdated = getData('weatherLastUpdated');
  let weatherAndLocation = null;
  if (lastUpdated) {
    const nextUpdateTime = dayjs(lastUpdated).add(20, 'minute');
    if (dayjs().isAfter(nextUpdateTime)) {
      weatherAndLocation = await resetAndGetWeatherData(lat, lng);
    } else {
      weatherAndLocation = getData('weatherData');
    }
  } else {
    weatherAndLocation = await resetAndGetWeatherData(lat, lng);
  }
  populateWeatherAndLocation(weatherAndLocation);
}

export async function doGeolocation() {
  const geolocationOptions = {
    enableHighAccuracy: true,
    maximumAge: 3600000 // 1 hour (number of seconds * 1000 milliseconds)
  };
  navigator.geolocation.getCurrentPosition(getLocationNameAndWeather, geolocationError, geolocationOptions);
}

export async function initWeather() {
  const lastUpdated = getData('weatherLastUpdated');
  const weatherAndLocation = getData('weatherData');

  if (lastUpdated && weatherAndLocation) {
    const nextUpdateTime = dayjs(lastUpdated).add(20, 'minute');
    if (dayjs().isAfter(nextUpdateTime)) {
      doGeolocation();
    } else {
      populateWeatherAndLocation(weatherAndLocation);
    }
  } else {
    doGeolocation();
  }
}
