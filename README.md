# atmos

atmos is a code-driven weather visualization that explores atmospheric behavior through motion, waves, and interaction.

instead of charts and numbers alone, atmos represents weather data as continuously animated waveforms, helping reveal how temperature, pressure, and wind vary over time and space, and why those patterns form.

## what it does
- visualizes **surface temperature**, **pressure systems**, and **wind motion** as animated waves  
- allows users to search for a location or use geolocation (never stored)
- disambiguates cities with the same name using live suggestions
- supports light and dark mode
- explains atmospheric processes with inline definitions and research references
- displays exact data values on hover for transparency and accuracy

## how it works
atmos uses the **Open-Meteo API**, which aggregates data from trusted meteorological sources such as NOAA, ECMWF, and national weather services.

weather variables are normalized and mapped to wave amplitude and motion:
- higher values appear visually higher
- wave speed subtly varies with latitude
- color shifts reflect hemispheric position

this makes patterns comparable across locations while still grounded in real measurements.

### data & accuracy
all weather data comes directly from:
- **Open-Meteo** (https://open-meteo.com/)
- underlying sources include **NOAA**, **ECMWF**, and other national meteorological agencies

interactive hover tooltips display the exact values used in each visualization so users can verify what they’re seeing.

### privacy
- location data is **never stored**
- geolocation is used only locally to fetch weather data
- no accounts, cookies, or tracking

### preview
#### start screen
![start screen](homescreen.png)

#### atmospheric visualizations
![graph examples](graphs.png)

#### built for
hack club sleepover 💤  
an all-girls and nonbinary coding event focused on building creative projects.