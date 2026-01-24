const geoBtn = document.getElementById("geoBtn");
const manualBtn = document.getElementById("manualBtn");
const layers = document.getElementById("layers");
const loading = document.getElementById("loading");
const themeToggle = document.getElementById("themeToggle");
const cityInput = document.getElementById("city");
const cityDropdown = document.getElementById("cityDropdown");
let latestFetch = 0;

/* dark/light mode toggle */
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  themeToggle.textContent = next === "dark" ? "light" : "dark";
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.textContent = "light";
}

/* layer toggles */
document.querySelectorAll(".layer-header").forEach(h =>
  h.onclick = () => h.parentElement.classList.toggle("open")
);

/* geolocation button */
geoBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
    pos => analyze(pos.coords.latitude, pos.coords.longitude),
    () => alert("location unavailable")
  );
};

/* autocomplete as user types */
cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();
  const fetchId = ++latestFetch;

  cityDropdown.classList.add("hidden");
  cityDropdown.innerHTML = "";

  if (!query) return;

  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
    ).then(r => r.json());

    if (fetchId !== latestFetch) return;
    if (!geo.results || geo.results.length === 0) return;

    geo.results.forEach(loc => {
      const li = document.createElement("li");
      li.textContent = `${loc.name}, ${loc.admin1 || ""}${loc.country ? ", " + loc.country : ""}`;
      li.dataset.lat = loc.latitude;
      li.dataset.lon = loc.longitude;
      cityDropdown.appendChild(li);

      li.onclick = () => {
        cityInput.value = li.textContent;
        cityInput.dataset.lat = li.dataset.lat;
        cityInput.dataset.lon = li.dataset.lon;
        cityDropdown.classList.add("hidden");
      };
    });

    cityDropdown.classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
});

/* analyze button uses selected lat/lon */
manualBtn.onclick = () => {
  const lat = cityInput.dataset.lat;
  const lon = cityInput.dataset.lon;
  if (!lat || !lon) {
    alert("please select a location from the dropdown");
    return;
  }
  analyze(lat, lon);
};

/* show/hide loading */
function showLoading() {
  loading.classList.remove("hidden");
  animateLoading();
}

function hideLoading() {
  loading.classList.add("hidden");
}

/* analyze API data */
async function analyze(lat, lon) {
  showLoading();

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,pressure_msl,wind_speed_10m`;

  const data = await fetch(url).then(r => r.json());

  hideLoading();
  layers.classList.remove("hidden");

  drawWave("tempWave", data.hourly.temperature_2m, 30, lat, "°C");
  drawWave("pressureWave", data.hourly.pressure_msl, 18, lat, "hPa");
  drawWave("windWave", data.hourly.wind_speed_10m, 22, lat, "m/s");
}

/* draw waves reflecting actual data with hover tooltips */
function drawWave(id, values, strength, lat, unit) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");

  const dpr = devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = 160 * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.width / dpr;
  const h = 160;
  const mid = h / 2;

  const min = Math.min(...values);
  const max = Math.max(...values);

  let t = 0;
  const speed = 0.01 + Math.abs(lat) / 9000;
  const hue = 210 + lat * 0.3;

  // mouse tooltip
  let tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i = Math.floor((x / w) * values.length);
    tooltip.textContent = `${values[i].toFixed(1)} ${unit}`;
    tooltip.style.position = "fixed";
    tooltip.style.left = e.clientX + 8 + "px";
    tooltip.style.top = e.clientY + 8 + "px";
    tooltip.style.background = getComputedStyle(document.documentElement).getPropertyValue("--panel");
    tooltip.style.color = getComputedStyle(document.documentElement).getPropertyValue("--text");
    tooltip.style.padding = "0.3rem 0.5rem";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "0.75rem";
    tooltip.style.pointerEvents = "none";
    tooltip.style.zIndex = "1000";
    tooltip.style.display = "block";
  };
  canvas.onmouseleave = () => { tooltip.style.display = "none"; };

  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = `hsl(${hue}, 60%, 55%)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();

    for (let x = 0; x <= w; x++) {
      const i = Math.floor((x / w) * values.length);
      const y = mid + ((values[i] - min) / (max - min || 1) - 0.5) * strength * 2 + Math.sin(x * 0.015 + t) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
    t += speed;
    requestAnimationFrame(frame);
  }
  frame();
}

/* loading animation */
function animateLoading() {
  const canvas = document.getElementById("loadingWave");
  const ctx = canvas.getContext("2d");

  canvas.width = 360;
  canvas.height = 120;
  let t = 0;

  function loop() {
    if (loading.classList.contains("hidden")) return;
    ctx.clearRect(0, 0, 360, 120);
    ctx.strokeStyle = "#4f83c2";
    ctx.beginPath();

    for (let x = 0; x < 360; x++) {
      const y =
        60 +
        Math.sin(x * 0.03 + t) * 18 +
        Math.sin(x * 0.01 + t * 0.6) * 8;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
    t += 0.03;
    requestAnimationFrame(loop);
  }
  loop();
}
