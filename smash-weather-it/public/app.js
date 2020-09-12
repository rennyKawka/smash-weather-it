let city = document.querySelector("#city_search");
let msg_feedback = document.querySelector("#fbk");
let form = document.querySelector("form");
let weather_info = document.querySelector("#weather-info");
let w_img = document.querySelector("#w-img");
let w_desc = document.querySelector("#w-desc");
let w_celsius = document.querySelector("#celsius");
let w_farenheit = document.querySelector("#farenheit");
let city_name = document.querySelector("#city_name");
let day = document.querySelector("#day");
let latest_sr = document.querySelector("#latest_sr");
let loading = document.querySelector("#loader");
const CELSIUS = 273.15;
const API_KEY = "eb9d62065796454fb18dca8227500999";
const API_URL = "https://api.openweathermap.org/data/2.5";

form.addEventListener("submit", () => {
	event.preventDefault();
	weatherSearch();
});

function weatherSearch() {
	let cityValue = city.value.trim();
	if (cityValue != "") {
		let _city = cityValue.toLowerCase();
		// console.log(_city);
		weather_info.style.display = "none";
		loading.style.display = "flex";
		getWeatherData(_city);
	} else {
		msg_feedback.style.opacity = 1;
	}
	recentSearch();
}

function recentSearch() {
	let sr_template = (city, time) => {
		return `
		<div class="_sr">
			<div>
				<h4 id="sr_city">${city}</h4>
				<h4 id="sr_time">${time}</h4>
			</div>
			<a href="#" class="del_sr">
				<img src="./imgs/del.svg" alt="" height="25" for="${city}" />
			</a>
		</div>
	`;
	};

	// get results from previous search
	let ls_len = localStorage.length;
	if (ls_len) {
		document.querySelector("#search_results").style.display = "block";
		latest_sr.innerHTML = null;
		Object.keys(localStorage).forEach((city) => {
			let get_city = localStorage.getItem(`${city}`);
			let { dt } = JSON.parse(get_city);
			let { curr_date } = getDay(dt);
			latest_sr.insertAdjacentHTML("afterbegin", sr_template(city, curr_date));
		});

		document.querySelectorAll(".del_sr").forEach((elem) => {
			elem.addEventListener("click", (i) => {
				let city = event.target.getAttribute("for");
				deleteCity(city).then(() => recentSearch());
			});
		});
	} else {
		latest_sr.innerHTML = "<small>You have no search history</small>";
	}
}

function getWeatherData(_city) {
	let req_url = `${API_URL}/weather?q=${_city}&appid=${API_KEY}`;
	fetch(req_url)
		.then((res) => res.json())
		.then((res) => {
			if (res.cod != 404) {
				let save_city_data = JSON.stringify(res);
				localStorage.setItem(`${_city}`, save_city_data);
				displayWeatherData(res); // display the data for the city
				recentSearch(); // update recent searches
				loading.style.display = "none"; // hide loading icon
				msg_feedback.style.opacity = 0; // hide feedback
			} else {
				loading.style.display = "none"; // hide loading icon
				msg_feedback.textContent = res.message;
				msg_feedback.style.opacity = 1;
			}
		})
		.catch((res) => {
			let get_city = localStorage.getItem(`${_city}`);
			get_city = JSON.parse(get_city);
			get_city != null
				? displayWeatherData(get_city)
				: ((msg_feedback.style.opacity = 1),
				  (msg_feedback.textContent = "Nework connection error"));
		});
}

function displayWeatherData(res) {
	weather_info.style.display = "flex";
	let { description, icon } = res.weather[0];
	let { temp, feels_like } = res.main;
	let { celsius, farenheit } = getTemp(temp);
	let { curr_date } = getDay(res.dt);
	let sunrise = formatTime(res.sys.sunrise);
	let sunset = formatTime(res.sys.sunset);
	let feel = feels_like - CELSIUS;

	// console.log(description, celsius, farenheit);
	w_img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
	w_desc.textContent = description;
	w_celsius.innerHTML = `${Math.round(celsius)}<sup>o</sup> C`;
	// w_farenheit.innerHTML = `${Math.round(farenheit)}<sup>o</sup>`;
	city_name.innerHTML = `${res.name}, <small style='font-size: .8em'>${res.sys.country}</small>`;
	day.textContent = `${curr_date}`;
	document.querySelector(
		"#humidity label"
	).textContent = `${res.main.humidity}%`;
	document.querySelector("#sunrise label").textContent = sunrise;
	document.querySelector("#sunset label").textContent = sunset;
	document.querySelector("#feels_like label").innerHTML = `${Math.round(
		feel
	)}<sup>o</sup> C`;
}

function getDay(ts) {
	let date = ts == "" ? new Date() : new Date(ts * 1000);
	let curr_date = date.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	return { curr_date };
}

function formatTime(ts) {
	let date = new Date(ts * 1000);
	let time = date.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
	return time;
}

function getTemp(degreeKelv) {
	let celsius = degreeKelv - CELSIUS;
	let farenheit = celsius * (9 / 5) + 32;
	return { celsius, farenheit };
}

function monitor_time() {
	let hours = new Date().getHours();
	if (hours >= 7 && hours < 16) {
		// show the morning background from 7am to 3pm
		document.querySelector("#main").className = "day";
	} else if (hours >= 16 && hours <= 18) {
		// show the evening background from 4pm to 6pm
		document.querySelector("#main").className = "evening";
	} else if (hours > 18 || hours <= 6) {
		// show the night background from 7pm to 7am
		document.querySelector("#main").className = "night";
	}
}

async function deleteCity(city) {
	localStorage.removeItem(`${city}`);
}

weatherSearch();
monitor_time();
setInterval(monitor_time, 1000);
