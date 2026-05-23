// OpenWeatherMap API Key
const apiKey = "9f8c0227058ef50a4dab15dfcdb95b62";

/* DOM */
const weatherGrid =
document.getElementById("weatherGrid");

const cityInput =
document.getElementById("cityInput");

const searchBtn =
document.getElementById("searchBtn");

const modal =
document.getElementById("weatherModal");

const modalBody =
document.getElementById("modalBody");

const closeBtn =
document.getElementById("closeBtn");

/* DEFAULT CITIES */
const cities = [
    "Kolkata",
    "Delhi",
    "Mumbai",
    "Bangalore"
];

/* LOAD WEATHER */
async function getWeather(city){
    try{
        const response = await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();

        if(data.cod != 200){
            return;
        }
        createCard(data);
    }
    catch(error){
        console.log(error);
    }
}

/* CREATE CARD */
function createCard(data){
    const card =
    document.createElement("div");

    card.classList.add("weather-card");
    card.innerHTML = `
        <div class="weather-top">
            <div>
                <h2>${data.name}</h2>
                <p>${data.sys.country}</p>
            </div>
            <img
            src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
        </div>

        <h1 class="temp">
            ${Math.round(data.main.temp)}°C
        </h1>

        <p class="condition">
            ${data.weather[0].description}
        </p>

        <div class="details">
            <div class="detail">
                <span>Humidity</span>
                <strong>${data.main.humidity}%</strong>
            </div>
            <div class="detail">
                <span>Wind</span>
                <strong>
                ${(data.wind.speed * 3.6).toFixed(1)} km/h
                </strong>
            </div>
        </div>
    `;

    card.addEventListener(
        "click",
        ()=>openDetailedWeather(data.name)
    );

    weatherGrid.appendChild(card);
}

/* OPEN MODAL */
async function openDetailedWeather(city){
    modal.classList.remove("hidden");

    /* CURRENT */
    const currentResponse =
    await fetch(

`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

    );
    const currentData =
    await currentResponse.json();

    /* FORECAST */
    const forecastResponse =
    await fetch(

`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`

    );
    const forecastData =
    await forecastResponse.json();

    /* AQI */
    const lat =
    currentData.coord.lat;

    const lon =
    currentData.coord.lon;

    const aqiResponse =
    await fetch(

`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

    );

    const aqiData =
    await aqiResponse.json();

    const aqi =
    aqiData.list[0].main.aqi;

    /* FORECAST HTML */
    let forecastHTML = "";

    const dailyForecast =
    forecastData.list.filter(
        item=>item.dt_txt.includes("12:00:00")
    );

    dailyForecast.forEach(day=>{
        forecastHTML += `
            <div class="forecast-card">
                <h4>
                ${new Date(day.dt_txt)
                .toLocaleDateString("en-US",
                {weekday:"short"})}
                </h4>

                <img
                src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

                <p>
                ${Math.round(day.main.temp)}°C
                </p>
            </div>
        `;
    });

    /* MODAL HTML */
    modalBody.innerHTML = `
        <h2>
            ${currentData.name},
            ${currentData.sys.country}
        </h2>

        <h1 class="temp">
            ${Math.round(currentData.main.temp)}°C
        </h1>

        <p class="condition">
            ${currentData.weather[0].description}
        </p>

        <div class="details">
            <div class="detail">
                <span>Humidity</span>
                <strong>
                ${currentData.main.humidity}%
                </strong>
            </div>

            <div class="detail">
                <span>Feels Like</span>
                <strong>
                ${Math.round(currentData.main.feels_like)}°C
                </strong>
            </div>
            <div class="detail">
                <span>Wind</span>
                <strong>
                ${(currentData.wind.speed * 3.6).toFixed(1)} km/h
                </strong>
            </div>

            <div class="detail">
                <span>Pressure</span>
                <strong>
                ${currentData.main.pressure} hPa
                </strong>
            </div>
        </div>

        <div class="aqi-box">
            <h3>Air Quality Index</h3>
            <p>
            AQI Level:
            <strong>${aqi}</strong>
            </p>
        </div>

        <div class="chart-container">
            <canvas id="tempChart"></canvas>
        </div>
        <h3 style="margin-top:30px;">
            5 Day Forecast
        </h3>
        <div class="forecast-grid">
            ${forecastHTML}
        </div>
    `;
    createChart(forecastData);
}

/* CHART */
function createChart(forecastData){
    const labels =
    forecastData.list
    .slice(0,8)
    .map(item=>
        new Date(item.dt_txt)
        .toLocaleTimeString([],
        {
            hour:"2-digit",
            minute:"2-digit"
        })
    );

    const temps =
    forecastData.list
    .slice(0,8)
    .map(item=>item.main.temp);

    const ctx =
    document.getElementById("tempChart");
    new Chart(ctx,{
        type:"line",
        data:{
            labels:labels,
            datasets:[{
                label:"Temperature °C",
                data:temps,
                borderWidth:3,
                tension:0.4
            }]
        },

        options:{
            responsive:true,
            plugins:{
                legend:{
                    display:true
                }
            }
        }
    });
}

/* CLOSE MODAL */
closeBtn.addEventListener(
    "click",
    ()=>{
        modal.classList.add("hidden");
    }
);

window.addEventListener(
    "click",
    (e)=>{
        if(e.target === modal){
            modal.classList.add("hidden");
        }
    }
);

/* SEARCH */
searchBtn.addEventListener(
    "click",
    ()=>{
        const city =
        cityInput.value.trim();
        if(city !== ""){
            getWeather(city);
            cityInput.value = "";
        }
    }
);

cityInput.addEventListener(
    "keypress",
    (e)=>{
        if(e.key === "Enter"){

            const city =
            cityInput.value.trim();

            if(city !== ""){

                getWeather(city);

                cityInput.value = "";
            }
        }
    }
);

/* DATE TIME */
function updateDateTime(){
    const now = new Date();
    document.getElementById(
        "dateTime"
    ).textContent =
    now.toLocaleString(
        "en-US",
        {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric",
            hour:"numeric",
            minute:"numeric"
        }
    );
}

setInterval(updateDateTime,1000);
updateDateTime();

/* LOAD DEFAULT */
cities.forEach(city=>{
    getWeather(city);
});
