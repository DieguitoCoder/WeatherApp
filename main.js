const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const APIKey = '9410a63560d614812234993ad894e190';
const searchInput = document.querySelector('.search-box input');

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        search.click();
    }
});

function setLoading(isLoading) {
  search.disabled = isLoading;
  search.classList.toggle("loading", isLoading);
  const timeLocal = document.querySelector(".weather-box .time-local");
  if (timeLocal && isLoading) timeLocal.innerText = "⏳ Buscando...";
}

search.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (!city) return;
  fetchWeatherByCity(city);
});

function fetchWeatherByCity(city) {
  setLoading(true);
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${APIKey}`)
    .then((r) => r.json())
    .then(renderWeather)
    .catch(showError)
    .finally(() => setLoading(false));
}

function fetchWeatherByCoords(lat, lon) {
  setLoading(true);
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`)
    .then((r) => r.json())
    .then((json) => {
      console.log("Respuesta del clima por coordenadas:", json);
      renderWeather(json);
    })
    .catch((err) => {
      console.error("Error al obtener el clima por coordenadas:", err);
      showError();
    })
    .finally(() => setLoading(false));
}

function renderWeather(json) {
  if (!json || json.cod === "404" || json.cod === 404 || !json.weather || !json.weather.length) {
    showError();
    return;
  }

  const locationElement = document.querySelector(".location-name");
  locationElement.innerText = `📍 ${json.name}`;

  error404.style.display = "none";
  error404.classList.remove("fadeIn");

  const image = document.querySelector(".weather-box img");
  const temperature = document.querySelector(".weather-box .temperature");
  const description = document.querySelector(".weather-box .description");
  const humidity = document.querySelector(".weather-details .humidity span");
  const wind = document.querySelector(".weather-details .wind span");
  const timeLocal = document.querySelector(".weather-box .time-local");

  const main = json.weather[0].main;
  console.log("🌤 Estado del clima:", main);
  updateBackground(main.toLowerCase()); // CAMBIO CLAVE

  switch (main) {
    case "Clear":   image.src = "images/clear.png"; break;
    case "Rain":    image.src = "images/rain.png"; break;
    case "Snow":    image.src = "images/snow.png"; break;
    case "Clouds":  image.src = "images/cloud.png"; break;
    case "Mist":    image.src = "images/mist.png"; break;
    default:        image.src = "images/unknown.png";
  }

  temperature.innerHTML = `${Math.round(json.main.temp)}<span>°C</span>`;
  description.innerHTML = `${json.weather[0].description}`;
  humidity.innerHTML = `${json.main.humidity}%`;
  wind.innerHTML = `${Math.round(json.wind.speed * 3.6)} Km/h`;

  weatherBox.style.display = "";
  weatherDetails.style.display = "";
  weatherBox.classList.add("fadeIn");
  weatherDetails.classList.add("fadeIn");
  container.style.height = "590px";

  if (timeLocal) {
    timeLocal.innerText = "⏳ Obteniendo hora...";
    fetchLocalTime(json.coord.lat, json.coord.lon);
  }
}

function fetchLocalTime(lat, lon) {
  const username = "dieguitoteran2007";
  const url = `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${username}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const timeLocal = document.querySelector(".weather-box .time-local");

      if (data.status && data.status.message) {
        console.error("GeoNames error:", data.status.message);
        timeLocal.innerText = "Hora local no disponible";
        return;
      }

      if (!data.time || !data.timezoneId) {
        timeLocal.innerText = "Hora local no disponible";
        return;
      }

      const formatted = moment().tz(data.timezoneId).format("HH:mm");
      timeLocal.innerText = `Hora local: ${formatted} (${data.timezoneId})`;
    })
    .catch((err) => {
      console.error("❌ Error obteniendo hora local:", err);
      const timeLocal = document.querySelector(".weather-box .time-local");
      timeLocal.innerText = "Hora local no disponible";
    });
}

function showError() {
  container.style.height = "400px";
  weatherBox.style.display = "none";
  weatherDetails.style.display = "none";
  error404.style.display = "block";
  error404.classList.add("fadeIn");
}

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        console.log("✅ Ubicación detectada:", lat, lon);
        fetchWeatherByCoords(lat, lon);
      },
      (err) => {
        console.log("❌ Error al obtener ubicación:", err);
      }
    );
  } else {
    console.log("⚠️ Tu navegador no soporta geolocalización.");
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("✅ Service Worker registrado", reg))
      .catch((err) => console.error("❌ Error registrando SW:", err));
  });
}

// FONDO DINÁMICO SEGÚN EL CLIMA
function updateBackground(weather) {
  const body = document.body;
  body.className = ""; // limpiar clases previas

  switch (weather) {
    case "clear":
      body.classList.add("clear-bg");
      break;
    case "clouds":
      body.classList.add("clouds-bg");
      break;
    case "rain":
    case "drizzle":
    case "thunderstorm":
      body.classList.add("rain-bg");
      break;
    case "snow":
      body.classList.add("snow-bg");
      break;
    case "mist":
    case "fog":
    case "haze":
      body.classList.add("mist-bg");
      break;
    default:
      body.classList.add("default-bg");
  }
}
