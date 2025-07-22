const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const APIKey = '9410a63560d614812234993ad894e190';
const searchInput = document.querySelector('.search-box input');

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        search.click(); // simula hacer clic en el botón
    }
});

search.addEventListener('click', () => {
    const city = document.querySelector('.search-box input').value;
    if (city === '') return;
    fetchWeatherByCity(city);
});

function fetchWeatherByCity(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => renderWeather(json))
        .catch(() => showError());
}

function fetchWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => {
            console.log('Respuesta del clima por coordenadas:', json);
            renderWeather(json);
        })
        .catch(error => {
            console.error('Error al obtener el clima por coordenadas:', error);
            showError();
        });
}

function renderWeather(json) {
    if (json.cod === '404' || json.cod === 404) {
        showError();
        return;
    }

    const locationElement = document.querySelector('.location-name');
    locationElement.innerText = `📍 ${json.name}`;

    error404.style.display = 'none';
    error404.classList.remove('fadeIn');

    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.weather-box .temperature');
    const description = document.querySelector('.weather-box .description');
    const humidity = document.querySelector('.weather-details .humidity span');
    const wind = document.querySelector('.weather-details .wind span');
    const timeLocal = document.querySelector('.weather-box .time-local'); // <-- nueva línea

    switch (json.weather[0].main) {
        case 'Clear':
            image.src = 'images/clear.png';
            break;
        case 'Rain':
            image.src = 'images/rain.png';
            break;
        case 'Snow':
            image.src = 'images/snow.png';
            break;
        case 'Clouds':
            image.src = 'images/cloud.png';
            break;
        case 'Mist':
            image.src = 'images/mist.png';
            break;
        default:
            image.src = '';
    }

    temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    description.innerHTML = `${json.weather[0].description}`;
    humidity.innerHTML = `${json.main.humidity}%`;
    wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;

    weatherBox.style.display = '';
    weatherDetails.style.display = '';
    weatherBox.classList.add('fadeIn');
    weatherDetails.classList.add('fadeIn');
    container.style.height = '590px';

    // ✅ Mostrar hora local
    fetchLocalTime(json.coord.lat, json.coord.lon);
}

function fetchLocalTime(lat, lon) {
    const url = `https://www.timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const timeStr = `${data.hour.toString().padStart(2, '0')}:${data.minute.toString().padStart(2, '0')} (${data.timeZone})`;
            const timeLocal = document.querySelector('.weather-box .time-local');
            timeLocal.innerText = `Hora local: ${timeStr}`;
        })
        .catch(err => {
            console.error("Error obteniendo hora local:", err);
            const timeLocal = document.querySelector('.weather-box .time-local');
            timeLocal.innerText = "Hora local no disponible";
        });
}

function showError() {
    container.style.height = '400px';
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
    error404.style.display = 'block';
    error404.classList.add('fadeIn');
}

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log('✅ Ubicación detectada:', lat, lon);
            fetchWeatherByCoords(lat, lon);
        }, (err) => {
            console.log('❌ Error al obtener ubicación:', err);
        });
    } else {
        console.log('⚠️ Tu navegador no soporta geolocalización.');
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('✅ Service Worker registrado', reg))
            .catch(err => console.error('❌ Error registrando SW:', err));
    });
}
