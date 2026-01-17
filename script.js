const geoBtn = document.getElementById("geoBtn");
const manualBtn = document.getElementById("manualBtn");
const layers = document.getElementById("layers");
const loading = document.getElementById("loading");
const themeToggle = document.getElementById("themeToggle");

/* ensure loading never shows on load */
document.addEventListener("DOMContentLoaded", () => {
  loading.classList.add("hidden");
});

/* dark mode toggle */
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.textContent = "☀️";
}

/* layer toggles */
document.querySelectorAll(".layer-header").forEach(h =>
  h.onclick = () => h.parentElement.classList.toggle("open")
);

geoBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
    pos => analyze(pos.coords.latitude, pos.coords.longitude),
    () => alert("location unavailable")
  );
};

manualBtn.onclick = async () => {
  const city = document.getElementById("city").value;
  if (!city) return;

  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
  ).then(r => r.json());

  if (!geo.results) return alert("location not found");
  analyze(geo.results[0].latitude, geo.results[0].longitude);
};

function showLoading() {
  loading.classList.remove("hidden");
  animateLoading();
}

function hideLoading() {
  loading.classList.add("hidden");
}

async function analyze(lat, lon) {
  showLoading();

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,pressure_msl,wind_speed_10m`;

  const data = await fetch(url).then(r => r.json());

  hideLoading();
  layers.classList.remove("hidden");

  drawWave("tempWave", data.hourly.temperature_2m, 30, lat);
  drawWave("pressureWave", data.hourly.pressure_msl, 18, lat);
  drawWave("windWave", data.hourly.wind_speed_10m, 22, lat);

  updateTimestamp();
}

function updateTimestamp() {
  const tsEl = document.getElementById("timestamp");
  const now = new Date();
  tsEl.textContent = `forecast sampled at ${now.toUTCString()}`;
}

function drawWave(id, values, strength, lat) {
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

  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = `hsl(${hue}, 60%, 55%)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();

    for (let x = 0; x <= w; x++) {
      const i = Math.floor((x / w) * values.length);
      const norm = (values[i] - min) / (max - min || 1);

      const y =
        mid +
        Math.sin(x * 0.015 + t) * strength * norm +
        Math.sin(x * 0.005 + t * 0.6) * 8;

      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
    t += speed;
    requestAnimationFrame(frame);
  }
  frame();
}

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
