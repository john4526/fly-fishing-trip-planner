import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat or lon query parameters" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  // If the API key is not configured, we'll return simulated weather data so the UI remains fully functional during testing
  if (!apiKey) {
    console.warn("OPENWEATHERMAP_API_KEY is not defined. Returning mock weather data.");
    return NextResponse.json(getMockWeatherData(lat, lon));
  }

  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl, { next: { revalidate: 900 } }), // 15 mins cache
      fetch(forecastUrl, { next: { revalidate: 1800 } }) // 30 mins cache
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      return NextResponse.json({ error: "Failed to fetch weather from OpenWeatherMap" }, { status: 502 });
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    return NextResponse.json({
      current: {
        temp: currentData.main?.temp,
        feelsLike: currentData.main?.feels_like,
        humidity: currentData.main?.humidity,
        windSpeed: currentData.wind?.speed,
        windDeg: currentData.wind?.deg,
        description: currentData.weather?.[0]?.description,
        icon: currentData.weather?.[0]?.icon,
        main: currentData.weather?.[0]?.main
      },
      forecast: forecastData.list?.map(item => ({
        dt: item.dt,
        time: item.dt_txt,
        temp: item.main?.temp,
        description: item.weather?.[0]?.description,
        icon: item.weather?.[0]?.icon,
        main: item.weather?.[0]?.main,
        windSpeed: item.wind?.speed,
        rain: item.rain?.["3h"] || 0
      })) || []
    });

  } catch (error) {
    console.error("Error in Weather API proxy:", error);
    return NextResponse.json({ error: "Internal Server Error fetching weather data" }, { status: 500 });
  }
}

function getMockWeatherData(lat, lon) {
  // Helper to generate realistic mock weather based on lat/lon
  return {
    isMock: true,
    current: {
      temp: 72.4,
      feelsLike: 71.8,
      humidity: 55,
      windSpeed: 8.5,
      windDeg: 210,
      description: "scattered clouds",
      icon: "03d",
      main: "Clouds"
    },
    forecast: Array.from({ length: 5 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        dt: Math.floor(date.getTime() / 1000),
        time: date.toISOString().replace("T", " ").substring(0, 19),
        temp: 68.0 + Math.random() * 8,
        description: index % 3 === 0 ? "light rain" : "clear sky",
        icon: index % 3 === 0 ? "10d" : "01d",
        main: index % 3 === 0 ? "Rain" : "Clear",
        windSpeed: 5.0 + Math.random() * 5,
        rain: index % 3 === 0 ? 0.5 : 0
      };
    })
  };
}
