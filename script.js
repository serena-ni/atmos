const geoBtn = document.getElementById("geoBtn");
const manualBtn = document.getElementById("manualBtn");
const layers = document.getElementById("layers");

const surfaceEl = document.getElementById("surface");
const pressureEl = document.getElementById("pressure");
const windEl = document.getElementById("wind");
const contextEl = document.getElementById("context");

document.querySelectorAll(".layer-header").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("open");
  });
});

geoBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    analyze(pos.coords.latitude, pos.coords.longitude);
  });
};

manualBtn.onclick = async () => {
  const city = document.getElementById("city").value;
  const country = document.getElementById("country").value;
  if (!city) return alert("Enter a city");

  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
  ).then(r => r.json());

  if (!geo.results) return alert("Location not found");
  analyze(geo.results[0].latitude, geo.results[0].longitude);
};

async function analyze(lat, lon) {
  layers.classList.remove("hidden");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,pressure_msl,wind_speed_10m&hourly=pressure_msl`;

  const data = await fetch(url).then(r => r.json());
  const c = data.current;

  surfaceEl.innerHTML = `
    Temperature is <strong>${c.temperature_2m}°C</strong>.
    These values describe the immediate conditions at ground level.
  `;

  pressureEl.innerHTML = `
    Sea-level pressure is <strong>${c.pressure_msl} hPa</strong>.
    ${c.pressure_msl < 1013
      ? "Lower pressure often supports rising air and unsettled weather."
      : "Higher pressure usually indicates stable atmospheric conditions."}
  `;

  windEl.innerHTML = `
    Wind speed is <strong>${c.wind_speed_10m} km/h</strong>.
    Wind reflects horizontal air movement driven by pressure differences.
  `;

  contextEl.innerHTML = `
    Today’s weather is shaped primarily by
    ${c.pressure_msl < 1013 ? "a lower-pressure system encouraging motion" : "stable pressure suppressing large-scale motion"}.
    This explains how surface conditions connect to larger atmospheric behavior.
  `;
}
