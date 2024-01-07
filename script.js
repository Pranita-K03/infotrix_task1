// CALENDER PART
const currentDate = document.querySelector(".current-date");
daysTag = document.querySelector(".days");
prevNextIcon = document.querySelectorAll(".icons span");

// Getting new date , year & Month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

const months =["January","February","March","April","May","June","July","August","September","October",      "November","December"];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear , currMonth ,1).getDay(), //get first day of month
    lastDateofMonth = new Date(currYear , currMonth + 1,0).getDate(), //get last date of month
    lastDayofMonth = new Date(currYear , currMonth ,lastDateofMonth).getDay(), //get last date of month
    lastDateofLastMonth = new Date(currYear , currMonth ,0).getDate(); //get last date of previous month
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {     //list of last months last dates
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
        
    }
    for(let i = 1; i <= lastDateofMonth;i++){   //list of currents months days
        let isToday = i === date.getDate() && currMonth == new Date () .getMonth()
                      && currYear === new Date().getFullYear() ? "active" : "" ;
        liTag += `<li class="${isToday}">${i}</li>`; 
    }
    for (let i = lastDayofMonth; i < 6; i++) {     //list of next months dates 
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
        
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag ;
}
renderCalendar();

prevNextIcon.forEach(icon =>{
    icon.addEventListener("click", () =>{  //ading click events on both icons
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1 ;

        if(currMonth < 0 || currMonth > 11){
            date = new Date(currYear , currMonth);
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        }else{
            date = new Date ();
        }
        renderCalendar();
    });
});

// Weather cards Part
const cityInput =  document.querySelector(".city-input");
const searchButton =  document.querySelector(".search-btn");
const locationButton =  document.querySelector(".location-btn");
const currentWeatherDiv =  document.querySelector(".current-weather");
const weatherCardsDiv =  document.querySelector(".weather-cards");


const API_KEY ="a21cde2c99524972aa9ed52cc5dda164"; //API key for openweathermap api

const createWeatherCard = (cityName , weatherItem , index) => {
    if (index === 0){  //MAIN WEATHER CARD
        return `<div class="details">
                        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity}%</h4> 
                    </div>
                    <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-icon">
                        <h4>${weatherItem.weather[0].description}</h4>
                    </div>`;  
    }else{   // 5 DAYS FORECAST
        return `<li class="card">
        <h3> (${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-icon">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>  
    </li>` ;
    }
}

const getWeatherDetails = (cityName , lat , lon) =>{
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data =>{
    

        // Filter ...
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date (forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // clearing previous data
        cityInput.value = ""; 
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

//creating weather cards & adding them to DOM       
        fiveDaysForecast.forEach((weatherItem , index) =>{
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName , weatherItem , index));
            }else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName , weatherItem , index));    
            }
        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!");
    });
}

const getCityCoordinates =() =>{
    const cityName = cityInput.value.trim(); 
    if(!cityName) return ; //return if city name is empty
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //Get entered city coordinates (latitude , longitude , and name ) from API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data =>{
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name , lat , lon} = data[0];
        getWeatherDetails(name , lat , lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates!");
    });
}

const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude , longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //Get city names from coordinates using reverse coding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data =>{
                const {name } = data[0];
                getWeatherDetails(name , latitude , longitude);
            }).catch(() => {
                alert("An error occured while fetching the city!");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied.Please reset location permission to grant access again.");
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" &&  getCityCoordinates());







