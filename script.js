// API Configuration
const API_KEY = 'fd242c6b3f604f4ca37121739251008'; // Your WeatherAPI.com key
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const temperatureElement = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const locationElement = document.getElementById('location');
const weatherIcon = document.getElementById('weather-icon');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const forecastCards = document.getElementById('forecast-cards');
const loadingElement = document.querySelector('.loading-state');

// Initialize
createParticles();
getWeatherByCity('London'); // Default location

// Event Listeners
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        getWeatherByCity(location);
    }
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const location = locationInput.value.trim();
        if (location) {
            getWeatherByCity(location);
        }
    }
});

locationBtn.addEventListener('click', getCurrentLocation);

// Weather Functions
async function getWeatherByCity(city) {
    try {
        setLoading(true);
        clearError();
        
        // Fetch current weather
        const currentResponse = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
        );
        
        if (!currentResponse.ok) {
            const errorData = await currentResponse.json();
            throw new Error(errorData.error?.message || 'Location not found');
        }
        
        const currentData = await currentResponse.json();
        displayWeather(currentData);
        
        // Fetch forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&aqi=no&alerts=no`
        );
        
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

async function getWeatherByLocation(lat, lon) {
    try {
        setLoading(true);
        clearError();
        
        const response = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        
        const data = await response.json();
        displayWeather(data);
        
        // Get forecast for location
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`
        );
        
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
    } catch (error) {
        showError(error.message || 'Error getting your location');
    } finally {
        setLoading(false);
    }
}

function displayWeather(data) {
    const current = data.current;
    const location = data.location;
    
    temperatureElement.textContent = Math.round(current.temp_c);
    weatherCondition.textContent = current.condition.text;
    locationElement.textContent = `${location.name}, ${location.country}`;
    windSpeed.textContent = `${current.wind_kph}`;
    humidity.textContent = `${current.humidity}`;
    pressure.textContent = `${current.pressure_mb}`;
    
    // Set weather icon
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;
    
    // Animate temperature change
    animateValue(temperatureElement, 0, Math.round(current.temp_c), 1000);
}

function displayForecast(data) {
    forecastCards.innerHTML = '';
    
    // Start from tomorrow (skip today)
    const forecastDays = data.forecast.forecastday.slice(1, 4);
    
    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            </div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
            </div>
        `;
        
        forecastCards.appendChild(forecastCard);
    });
}

// Helper Functions
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function setLoading(isLoading) {
    loadingElement.style.display = isLoading ? 'flex' : 'none';
    document.body.classList.toggle('loading', isLoading);
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    document.querySelector('.glass-card').prepend(errorElement);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

function clearError() {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude);
            },
            error => {
                showError('Location access denied. Please allow location access or search manually.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

function createParticles() {
    const container = document.querySelector('.particles-container');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size between 2px and 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.bottom = `-${size}px`;
        
        // Random animation duration between 10s and 20s
        const duration = Math.random() * 10 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        // Random delay
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        container.appendChild(particle);
    }
}