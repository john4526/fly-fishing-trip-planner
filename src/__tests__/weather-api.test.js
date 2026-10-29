import { GET } from "@/app/api/weather/route";

describe("Vertical Slice: Weather API Route Handler", () => {
  it("should return a 400 Bad Request error if lat or lon parameters are missing", async () => {
    const request = new Request("http://localhost:3000/api/weather");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Missing lat or lon query parameters");
  });

  it("should attempt fetching weather data and return structured payload for valid coordinates", async () => {
    // Mock global fetch for testing route handler logic
    const mockOpenMeteoPayload = {
      current: {
        temperature_2m: 68.5,
        relative_humidity_2m: 55,
        apparent_temperature: 68.0,
        weather_code: 0,
        wind_speed_10m: 6.2,
        wind_direction_10m: 180,
        pressure_msl: 1013.2,
        cloud_cover: 10,
        precipitation: 0.0,
      },
      hourly: {
        time: ["2026-08-13T12:00", "2026-08-13T13:00"],
        temperature_2m: [68.5, 70.1],
        precipitation: [0, 0],
        weather_code: [0, 0],
        wind_speed_10m: [6.2, 7.0],
        pressure_msl: [1013.2, 1012.8],
      },
      daily: {
        sunrise: ["2026-08-13T06:30"],
        sunset: ["2026-08-13T20:15"],
      },
    };

    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("open-meteo.com")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOpenMeteoPayload),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    const request = new Request("http://localhost:3000/api/weather?lat=40.1062&lon=-83.7974");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("current");
    expect(body).toHaveProperty("forecast");
    expect(body.current.temp).toBe(68.5);
  });
});
