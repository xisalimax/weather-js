const apiKey = "4bb1a2ded482a6c53f1d249b7cf17f92";

const searchInput = document.getElementById("search");
const submitBtn = document.getElementById("submit");
const weatherCard = document.getElementById("weather-data");
const emptyState = document.getElementById("empty-state");
const themeToggle = document.getElementById("theme-toggle");

submitBtn.addEventListener("click", fetchWeather);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchWeather();
});
themeToggle.addEventListener("click", toggleTheme);

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

async function fetchWeather() {
  const city = searchInput.value.trim();

  if (!city) {
    renderError("Please enter a city name.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Loading...";

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) {
      renderError("City not found.");
      return;
    }

    const { lat, lon, name } = geoData[0];

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const weather = await weatherRes.json();

    renderWeather(name, weather);
    searchInput.value = "";
  } catch {
    renderError("Something went wrong. Try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Search";
  }
}

function renderWeather(city, data) {
  emptyState.hidden = true;
  weatherCard.hidden = false;

  weatherCard.innerHTML = `
    <div class="weather-main">
      <img 
        class="weather-icon"
        src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
        alt="${data.weather[0].description}"
      />
      <div class="weather-info">
        <h2>${city}</h2>
        <p class="temp">${Math.round(data.main.temp)}°C</p>
        <p class="desc">${data.weather[0].description}</p>
      </div>
    </div>
    <div class="weather-details">
      <div class="detail-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
        <span>${data.main.humidity}%</span>
      </div>
      <div class="detail-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
        </svg>
        <span>${Math.round(data.wind.speed * 3.6)} km/h</span>
      </div>
    </div>
  `;
}

function renderError(message) {
  emptyState.hidden = true;
  weatherCard.hidden = false;
  weatherCard.innerHTML = `<p class="error">${message}</p>`;
}
