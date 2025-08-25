//FETCHING FROM HTML AND STORING INTO VARS
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const settingsContainer = document.querySelector(".settings-container");

// Dynamic elements
const weatherParticles = document.getElementById('weatherParticles');
const landingPage = document.getElementById('landingPage');
const getStartedBtn = document.getElementById('getStartedBtn');

//initially vairables need????
let currentView = 'home'; // Track current view: 'home' or 'search'
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
let isLandingShown = !localStorage.getItem('hasVisited');

// Initialize dynamic features
setupClickRippleEffect();
initializeLandingPage();

// Initialize with home view
if (!isLandingShown) {
    getfromSessionStorage();
}

function switchView(newView) {
    currentView = newView;
    
    if(newView === 'search') {
        // Show search form, hide other containers
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        settingsContainer.classList.remove("active");
        searchForm.classList.add("active");
    } else if(newView === 'home') {
        // Show home view (weather info or location request)
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        settingsContainer.classList.remove("active");
        // Check if we need to show location request or weather info
        getfromSessionStorage();
    } else if(newView === 'settings') {
        // Show settings panel
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        settingsContainer.classList.add("active");
    }
}



//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        //HW

    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    // Save weather data for unit conversion
    sessionStorage.setItem('lastWeatherData', JSON.stringify(weatherInfo));

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    
    // Handle weather icon with SVG icons based on weather condition
    const iconCode = weatherInfo?.weather?.[0]?.icon;
    const mainWeather = weatherInfo?.weather?.[0]?.main?.toLowerCase();
    
    // SVG icon paths for different weather conditions
    const weatherIcons = {
        // Clear sky
        'clear': '<path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM21 11h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zM6 12c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1zM6.76 4.84l-1.8-1.79c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.79 1.8c.39.39 1.02.39 1.41 0 .39-.39.39-1.03.01-1.42zM17.66 6.05c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.79 1.8c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.79-1.8zM12 22c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM6.05 17.66c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.8-1.79c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-1.8 1.79zM19.42 17.66l-1.8-1.79c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l1.8 1.79c.39.39.39 1.02 0 1.41-.39.39-1.03.39-1.41 0zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>',
        
        // Clouds
        'clouds': '<path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>',
        
        // Rain
        'rain': '<path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96zM7 16l1.5 3L10 16H7zm3.5 0l1.5 3L13.5 16h-3zm3.5 0l1.5 3L17 16h-3z"/>',
        
        // Thunderstorm
        'thunderstorm': '<path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96zM13 18l-4-5h3l-2-4 4 5h-3l2 4z"/>',
        
        // Snow
        'snow': '<path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96zM8 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4-2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
        
        // Mist/Fog
        'mist': '<path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>',
        'fog': '<path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>',
        'haze': '<path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>'
    };
    
    // Determine the appropriate icon based on weather condition
    let iconPath = weatherIcons['clear']; // Default to sun
    
    if (mainWeather.includes('cloud')) {
        iconPath = weatherIcons['clouds'];
    } else if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) {
        iconPath = weatherIcons['rain'];
    } else if (mainWeather.includes('thunder')) {
        iconPath = weatherIcons['thunderstorm'];
    } else if (mainWeather.includes('snow')) {
        iconPath = weatherIcons['snow'];
    } else if (mainWeather.includes('mist') || mainWeather.includes('fog') || mainWeather.includes('haze')) {
        iconPath = weatherIcons['mist'];
    }
    
    // Update the SVG icon
    weatherIcon.innerHTML = iconPath;
    
    // Add weather icon animation class based on condition
    weatherIcon.classList.remove('sunny', 'cloudy', 'rainy');
    if (mainWeather.includes('clear')) {
        weatherIcon.classList.add('sunny');
        createWeatherParticles('clear', 0);
    } else if (mainWeather.includes('cloud')) {
        weatherIcon.classList.add('cloudy');
        createWeatherParticles('leaves', 20);
    } else if (mainWeather.includes('rain')) {
        weatherIcon.classList.add('rainy');
        createWeatherParticles('rain', 80);
    } else if (mainWeather.includes('snow')) {
        createWeatherParticles('snow', 60);
    } else {
        createWeatherParticles('clear', 0);
    }
    
    // Temperature conversion with animation
    const tempCelsius = weatherInfo?.main?.temp;
    let displayTemp = Math.round(tempCelsius);
    let unitSymbol = '°C';
    
    if (currentUnit === 'fahrenheit') {
        displayTemp = Math.round((tempCelsius * 9/5) + 32);
        unitSymbol = '°F';
    }
    
    // Animate temperature counter
    temp.classList.add('updating');
    animateCounter(temp, displayTemp, unitSymbol);
    
    // Animate other values
    const windSpeedValue = Math.round(weatherInfo?.wind?.speed * 3.6);
    const humidityValue = weatherInfo?.main?.humidity;
    const cloudinessValue = weatherInfo?.clouds?.all;
    
    animateCounter(windspeed, windSpeedValue, ' km/h', 800);
    animateCounter(humidity, humidityValue, '%', 900);
    animateCounter(cloudiness, cloudinessValue, '%', 1000);
    
    // Animate progress bars
    const humidityProgress = document.querySelector('[data-humidity-progress]');
    const cloudProgress = document.querySelector('[data-cloud-progress]');
    
    if (humidityProgress) {
        setTimeout(() => animateProgressBar(humidityProgress, humidityValue), 500);
    }
    if (cloudProgress) {
        setTimeout(() => animateProgressBar(cloudProgress, cloudinessValue), 700);
    }
    
    // Wind direction indicator
    const windDirection = document.querySelector('[data-wind-direction]');
    if (windDirection && weatherInfo?.wind?.deg) {
        windDirection.style.transform = `rotate(${weatherInfo.wind.deg}deg)`;
    }

    // Add smooth animation to weather card appearance
    const weatherCard = document.querySelector('.main-weather');
    weatherCard.style.opacity = '0';
    weatherCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        weatherCard.style.transition = 'all 0.6s ease-out';
        weatherCard.style.opacity = '1';
        weatherCard.style.transform = 'translateY(0)';
    }, 100);
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

// Navigation functionality
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all nav items
        navItems.forEach(navItem => navItem.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        // Handle navigation based on data attribute
        const navType = item.getAttribute('data-nav');
        if (navType === 'search') {
            switchView('search');
        } else if (navType === 'home') {
            switchView('home');
        } else if (navType === 'settings') {
            switchView('settings');
        }
    });
});

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Check for saved theme preference or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    root.classList.add('light-mode');
    themeToggle.classList.add('light');
}

themeToggle.addEventListener('click', () => {
    root.classList.toggle('light-mode');
    themeToggle.classList.toggle('light');
    
    // Save theme preference
    const isLight = root.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Temperature Unit Toggle
const unitButtons = document.querySelectorAll('.unit-btn');
let currentUnit = localStorage.getItem('tempUnit') || 'celsius';

// Set initial active state
unitButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-unit') === currentUnit) {
        btn.classList.add('active');
    }
});

unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        unitButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentUnit = btn.getAttribute('data-unit');
        localStorage.setItem('tempUnit', currentUnit);
        
        // Refresh weather display if active
        if (userInfoContainer.classList.contains('active')) {
            const lastWeatherData = JSON.parse(sessionStorage.getItem('lastWeatherData') || '{}');
            if (lastWeatherData.main) {
                renderWeatherInfo(lastWeatherData);
            }
        }
    });
});

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        //hW
    }
}

// Dynamic Weather Particles System
function createWeatherParticles(weatherType, intensity = 50) {
    // Clear existing particles
    weatherParticles.innerHTML = '';
    
    if (!weatherType || weatherType === 'clear') return;
    
    const particleCount = Math.min(intensity, 100);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${weatherType}`;
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (3 + Math.random() * 2) + 's';
        
        // Add some randomness to particle properties
        if (weatherType === 'rain') {
            particle.style.opacity = 0.6 + Math.random() * 0.4;
            particle.style.animationDuration = (1 + Math.random() * 1) + 's';
        } else if (weatherType === 'snow') {
            particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';
            particle.style.animationDuration = (4 + Math.random() * 3) + 's';
        } else if (weatherType === 'leaves') {
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
        }
        
        weatherParticles.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, parseFloat(particle.style.animationDuration) * 1000);
    }
}

// Click Ripple Effect
function setupClickRippleEffect() {
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = (e.clientX - 25) + 'px';
        ripple.style.top = (e.clientY - 25) + 'px';
        ripple.style.width = ripple.style.height = '50px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Animate Counter Function
function animateCounter(element, target, suffix = '', duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
    }, 16);
}

// Progress Bar Animation
function animateProgressBar(element, percentage) {
    element.style.setProperty('--progress-width', percentage + '%');
    element.style.width = '0%';
    
    setTimeout(() => {
        element.style.width = percentage + '%';
    }, 100);
}

// Landing Page Functionality
function initializeLandingPage() {
    if (!isLandingShown) {
        landingPage.classList.add('hidden');
        return;
    }
    
    // Get Started button click handler
    getStartedBtn.addEventListener('click', () => {
        // Add click ripple effect
        const rect = getStartedBtn.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = (rect.left + rect.width / 2 - 25) + 'px';
        ripple.style.top = (rect.top + rect.height / 2 - 25) + 'px';
        ripple.style.width = ripple.style.height = '50px';
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Animate landing page exit
        landingPage.style.transform = 'translateY(-100%)';
        landingPage.style.opacity = '0';
        
        setTimeout(() => {
            landingPage.classList.add('hidden');
            landingPage.style.transform = '';
            landingPage.style.opacity = '';
            
            // Mark as visited and start main app
            localStorage.setItem('hasVisited', 'true');
            isLandingShown = false;
            getfromSessionStorage();
        }, 800);
    });
    

}