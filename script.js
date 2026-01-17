const geoBtn = document.getElementById("geoBtn");
const manualBtn = document.getElementById("manualBtn");
const layers = document.getElementById("layers");
const loading = document.getElementById("loading");
const cityOptions = document.getElementById("cityOptions");

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
  const city = document.getElementById("city").value.trim();
  if (!city) return;

  cityOptions.innerHTML = "";
  cityOptions.classList.add("hidden");

  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5`
  ).then(r => r.json());

  if (!geo.results) return alert("location not found");

  if (geo.results.length === 1) {
    analyze(geo.results[0].latitude, geo.results[0].longitude);
    return;
  }

  geo.results.forEach(loc => {
    const div = document.createElement("div");
    div.className = "city-option";
    div.textContent = `${loc.name}, ${loc.admin1 || ""} ${loc.country}`;
    div.onclick = () => {
      cityOptions.classList.add("hidden");
      analyze(loc.latitude, loc.longitude);
    };
    cityOptions.appendChild(div);
  });

  cityOptions.classList.remove("hidden");
};

function showLoading() { loading.classList.remove("hidden"); animateLoading(); }
function hideLoading() { loading.classList.add("hidden"); }

async function analyze(lat, lon) {
  showLoading();

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,pressure_msl,wind_speed_10m`;

  const data = await fetch(url).then(r => r.json());

  hideLoading();
  layers.classList.remove("hidden");

  drawWave("tempWave", data.hourly.temperature_2m, 30);
  drawWave("pressureWave", data.hourly.pressure_msl, 18);
  drawWave("windWave", data.hourly.wind_speed_10m, 22);
}

function drawWave(id, values, strength) {
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

  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(79,131,194,${0.35 + 0.05 * Math.sin(t*2)})`;
    ctx.lineWidth = 1.4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(79,131,194,0.35)";

    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const i = Math.floor((x / w) * values.length);
      const norm = (values[i] - min) / (max - min || 1);
      const y = mid + Math.sin(x * 0.015 + t) * strength * norm + Math.sin(x * 0.005 + t * 0.7) * 10;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    t += 0.015;
    requestAnimationFrame(frame);
  }
  frame();
}

function animateLoading() {
  const canvas = document.getElementById("loadingWave");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 120;
  let t = 0;

  function loop() {
    if (loading.classList.contains("hidden")) return;
    ctx.clearRect(0, 0, 320, 120);
    ctx.strokeStyle = "#4f83c2";
    ctx.beginPath();
    for (let x = 0; x < 320; x++) {
      const y = 60 + Math.sin(x * 0.03 + t) * 18 + Math.sin(x * 0.01 + t * 0.6) * 8;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    t += 0.03;
    requestAnimationFrame(loop);
  }
  loop();
}

// subtle shimmer on canvas hover
document.querySelectorAll('.layer').forEach(layer => {
  const canvas = layer.querySelector('canvas');
  layer.addEventListener('mouseenter', () => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.shadowColor = 'rgba(79,131,194,0.45)';
    setTimeout(() => ctx.shadowColor = 'rgba(79,131,194,0.35)', 300);
  });
});
