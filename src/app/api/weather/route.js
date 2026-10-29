import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat or lon query parameters" }, { status: 400 });
  }

  // Attempt 1: Open-Meteo
  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,pressure_msl&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;
    
    console.log("Fetching weather from primary Open-Meteo API...");
    const res = await fetch(openMeteoUrl, { next: { revalidate: 900 } });
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }
    
    const data = await res.json();
    const normalized = normalizeOpenMeteoData(data, lat, lon);
    return NextResponse.json(normalized);

  } catch (omError) {
    console.warn("Open-Meteo API failed, falling back to National Weather Service (NWS)...", omError.message);
    
    // Attempt 2: NWS
    try {
      // Step A: Get gridpoint coordinates
      const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
      const pointsRes = await fetch(pointsUrl, {
        headers: { "User-Agent": "(fly-fishing-planner, contact@flyfishingplanner.local)" },
        next: { revalidate: 86400 } // Grid points rarely change, cache for a day
      });
      
      if (!pointsRes.ok) {
        throw new Error(`NWS points API returned status ${pointsRes.status}`);
      }
      
      const pointsData = await pointsRes.json();
      const forecastHourlyUrl = pointsData.properties?.forecastHourly;
      
      if (!forecastHourlyUrl) {
        throw new Error("NWS forecastHourly URL not found in points metadata");
      }
      
      // Step B: Get hourly forecast
      console.log("Fetching weather from fallback NWS API gridpoint...");
      const forecastRes = await fetch(forecastHourlyUrl, {
        headers: { "User-Agent": "(fly-fishing-planner, contact@flyfishingplanner.local)" },
        next: { revalidate: 1800 } // 30 mins cache
      });
      
      if (!forecastRes.ok) {
        throw new Error(`NWS gridpoint API returned status ${forecastRes.status}`);
      }
      
      const forecastData = await forecastRes.json();
      const normalized = normalizeNwsData(forecastData, lat, lon);
      return NextResponse.json(normalized);

    } catch (nwsError) {
      console.error("Both Open-Meteo and NWS APIs failed:", nwsError.message);
      return NextResponse.json({ error: "Weather services temporarily unavailable" }, { status: 503 });
    }
  }
}

function getSunriseSunset(lat, lon, date = new Date()) {
  const radians = (deg) => (deg * Math.PI) / 180;
  const degrees = (rad) => (rad * 180) / Math.PI;

  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const lngHour = lon / 15;
  
  const t_sunrise = dayOfYear + ((6 - lngHour) / 24);
  const t_sunset = dayOfYear + ((18 - lngHour) / 24);

  const calculateTime = (t, isSunrise) => {
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(radians(M)) + 0.02 * Math.sin(radians(2 * M)) + 282.634;
    L = (L + 360) % 360;

    let RA = degrees(Math.atan(0.91764 * Math.tan(radians(L))));
    RA = (RA + 360) % 360;
    
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(radians(L));
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH = (Math.cos(radians(90.83)) - (sinDec * Math.sin(radians(lat)))) / (cosDec * Math.cos(radians(lat)));

    if (cosH > 1 || cosH < -1) return null;

    let H;
    if (isSunrise) {
      H = 360 - degrees(Math.acos(cosH));
    } else {
      H = degrees(Math.acos(cosH));
    }
    H = H / 15;

    const T = H + RA - (0.06571 * t) - 6.622;
    let UT = T - lngHour;
    UT = (UT + 24) % 24;

    const resDate = new Date(date);
    resDate.setUTCHours(Math.floor(UT));
    resDate.setUTCMinutes(Math.floor((UT % 1) * 60));
    resDate.setUTCSeconds(0);
    resDate.setUTCMilliseconds(0);
    return resDate.toISOString();
  };

  return {
    sunrise: calculateTime(t_sunrise, true),
    sunset: calculateTime(t_sunset, false)
  };
}

function getWmoCodeDetails(code) {
  const mapping = {
    0: { description: "clear sky", main: "Clear", icon: "01d" },
    1: { description: "mainly clear", main: "Clear", icon: "02d" },
    2: { description: "partly cloudy", main: "Clouds", icon: "03d" },
    3: { description: "overcast", main: "Clouds", icon: "04d" },
    45: { description: "foggy", main: "Fog", icon: "50d" },
    48: { description: "depositing rime fog", main: "Fog", icon: "50d" },
    51: { description: "light drizzle", main: "Rain", icon: "09d" },
    53: { description: "moderate drizzle", main: "Rain", icon: "09d" },
    55: { description: "dense drizzle", main: "Rain", icon: "09d" },
    61: { description: "light rain", main: "Rain", icon: "10d" },
    63: { description: "moderate rain", main: "Rain", icon: "10d" },
    65: { description: "heavy rain", main: "Rain", icon: "10d" },
    71: { description: "light snow", main: "Snow", icon: "13d" },
    73: { description: "moderate snow", main: "Snow", icon: "13d" },
    75: { description: "heavy snow", main: "Snow", icon: "13d" },
    80: { description: "light rain showers", main: "Rain", icon: "09d" },
    81: { description: "moderate rain showers", main: "Rain", icon: "09d" },
    82: { description: "violent rain showers", main: "Rain", icon: "09d" },
    95: { description: "thunderstorm", main: "Thunderstorm", icon: "11d" }
  };
  return mapping[code] || { description: "unknown conditions", main: "Clouds", icon: "03d" };
}

function normalizeOpenMeteoData(data, lat, lon) {
  const currentDetails = getWmoCodeDetails(data.current.weather_code);
  
  let tendency = "steady";
  if (data.current.time && data.hourly && data.hourly.time && data.hourly.pressure_msl) {
    const currentHourStr = data.current.time.substring(0, 14) + "00";
    const hourIdx = data.hourly.time.findIndex(t => t.startsWith(currentHourStr));
    if (hourIdx >= 3) {
      const diff = data.current.pressure_msl - data.hourly.pressure_msl[hourIdx - 3];
      if (diff > 1.0) tendency = "rising";
      else if (diff < -1.0) tendency = "falling";
    }
  }

  const sunTimes = getSunriseSunset(parseFloat(lat), parseFloat(lon));
  const sunrise = data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toISOString() : sunTimes.sunrise;
  const sunset = data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toISOString() : sunTimes.sunset;

  const forecast = [];
  if (data.hourly && data.hourly.time) {
    const currentHourTime = new Date(data.current.time).getTime();
    for (let i = 0; i < data.hourly.time.length; i++) {
      const forecastTime = new Date(data.hourly.time[i]).getTime();
      if (forecastTime >= currentHourTime) {
        const details = getWmoCodeDetails(data.hourly.weather_code[i]);
        forecast.push({
          dt: Math.floor(forecastTime / 1000),
          time: data.hourly.time[i].replace("T", " "),
          temp: data.hourly.temperature_2m[i],
          description: details.description,
          icon: details.icon,
          main: details.main,
          windSpeed: data.hourly.wind_speed_10m[i],
          windGust: data.hourly.wind_gusts_10m?.[i] || 0,
          rain: data.hourly.precipitation[i]
        });
        
        if (forecast.length >= 12) break;
        i += 2; // Step by 3 hours
      }
    }
  }

  return {
    provider: "Open-Meteo",
    current: {
      temp: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDeg: data.current.wind_direction_10m,
      windGust: data.current.wind_gusts_10m,
      description: currentDetails.description,
      icon: currentDetails.icon,
      main: currentDetails.main,
      pressure: data.current.pressure_msl,
      pressureTendency: tendency,
      cloudCover: data.current.cloud_cover,
      precipitation: data.current.precipitation,
      sunrise,
      sunset
    },
    forecast
  };
}

function parseNwsWindSpeed(str) {
  if (!str) return 0;
  const matches = str.match(/\d+/g);
  if (!matches) return 0;
  if (matches.length === 2) {
    return (parseFloat(matches[0]) + parseFloat(matches[1])) / 2;
  }
  return parseFloat(matches[0]);
}

function convertWindDirectionToDegrees(dir) {
  const mapping = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
    E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
    W: 270, WNW: 292.5, NW: 315, NNW: 337.5
  };
  return mapping[dir?.toUpperCase()] || 0;
}

function getNwsForecastDetails(forecastStr) {
  const str = forecastStr?.toLowerCase() || "";
  let main = "Clouds";
  let description = str;
  let icon = "03d";

  if (str.includes("thunderstorm") || str.includes("t-storm")) {
    main = "Thunderstorm";
    icon = "11d";
  } else if (str.includes("rain") || str.includes("drizzle") || str.includes("shower")) {
    main = "Rain";
    icon = "10d";
  } else if (str.includes("snow") || str.includes("sleet") || str.includes("ice")) {
    main = "Snow";
    icon = "13d";
  } else if (str.includes("fog") || str.includes("haze") || str.includes("mist")) {
    main = "Fog";
    icon = "50d";
  } else if (str.includes("clear") || str.includes("sunny")) {
    main = "Clear";
    icon = "01d";
  } else if (str.includes("partly") || str.includes("mostly sunny") || str.includes("few clouds")) {
    main = "Clouds";
    icon = "02d";
  }
  return { main, description, icon };
}

function estimateCloudCoverFromNws(forecastStr) {
  const str = forecastStr?.toLowerCase() || "";
  if (str.includes("sunny") || str.includes("clear")) return 0;
  if (str.includes("mostly sunny") || str.includes("mostly clear")) return 20;
  if (str.includes("partly cloudy") || str.includes("partly sunny")) return 50;
  if (str.includes("mostly cloudy")) return 75;
  if (str.includes("cloudy") || str.includes("overcast")) return 100;
  return 50;
}

function normalizeNwsData(data, lat, lon) {
  const periods = data.properties?.periods || [];
  if (periods.length === 0) {
    throw new Error("Empty periods list returned by NWS");
  }

  const currentPeriod = periods[0];
  const currentDetails = getNwsForecastDetails(currentPeriod.shortForecast);
  const currentWindSpeed = parseNwsWindSpeed(currentPeriod.windSpeed);
  const currentWindGust = currentPeriod.windGust ? parseNwsWindSpeed(currentPeriod.windGust) : currentWindSpeed * 1.25;

  let pressure = 1013;
  let pressureTendency = "steady";
  if (currentDetails.main === "Rain" || currentDetails.main === "Thunderstorm") {
    pressure = 1008;
    pressureTendency = "falling";
  } else if (currentDetails.main === "Clear") {
    pressure = 1018;
    pressureTendency = "rising";
  }

  const sunTimes = getSunriseSunset(parseFloat(lat), parseFloat(lon));

  const forecast = [];
  for (let i = 0; i < periods.length; i += 3) {
    const period = periods[i];
    const details = getNwsForecastDetails(period.shortForecast);
    const forecastTime = new Date(period.startTime);
    forecast.push({
      dt: Math.floor(forecastTime.getTime() / 1000),
      time: period.startTime.replace("T", " ").substring(0, 19),
      temp: period.temperature,
      description: details.description,
      icon: details.icon,
      main: details.main,
      windSpeed: parseNwsWindSpeed(period.windSpeed),
      windGust: period.windGust ? parseNwsWindSpeed(period.windGust) : parseNwsWindSpeed(period.windSpeed) * 1.2,
      rain: period.probabilityOfPrecipitation?.value ? period.probabilityOfPrecipitation.value / 100 : 0
    });
    if (forecast.length >= 12) break;
  }

  return {
    provider: "NWS",
    current: {
      temp: currentPeriod.temperature,
      feelsLike: currentPeriod.temperature,
      humidity: currentPeriod.relativeHumidity?.value || 50,
      windSpeed: currentWindSpeed,
      windDeg: convertWindDirectionToDegrees(currentPeriod.windDirection),
      windGust: currentWindGust,
      description: currentDetails.description,
      icon: currentDetails.icon,
      main: currentDetails.main,
      pressure,
      pressureTendency,
      cloudCover: estimateCloudCoverFromNws(currentPeriod.shortForecast),
      precipitation: currentPeriod.probabilityOfPrecipitation?.value ? (currentPeriod.probabilityOfPrecipitation.value / 100) * 0.1 : 0,
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset
    },
    forecast
  };
}
