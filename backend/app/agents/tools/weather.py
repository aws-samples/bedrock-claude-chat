"""Custom tool sample to get today's weather forecast for a given location.
Reference: https://python.langchain.com/v0.1/docs/modules/tools/custom_tools/
"""

from typing import Optional, Type

import requests
from app.agents.tools.base import BaseTool, StructuredTool
from langchain_core.pydantic_v1 import BaseModel, Field


class WeatherInput(BaseModel):
    location: str = Field(
        description="The location to get weather for (e.g. 'Tokyo', 'Seattle'). Must be in English."
    )


def get_weather(location: str) -> str:
    if location.find("\n") != -1:
        location = location.replace("\n", "")

    # Get latitude and longitude from location
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}"
    response = requests.get(url)
    try:
        response.raise_for_status()
    except Exception as e:
        return f"Error: Unable to get location data for {location}. {e}"
    data = response.json()
    try:
        results = data["results"]
    except KeyError as e:
        return f"Error: Unable to get location data for {location}. Did you specify the location in English?"

    latitude = results[0]["latitude"]
    longitude = results[0]["longitude"]

    # Get today's weather
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo"
    response = requests.get(url)
    data = response.json()
    try:
        response.raise_for_status()
    except Exception as e:
        return f"Error: Unable to get weather data for {location}. {e}"
    weather_code = data["daily"]["weathercode"][0]
    max_temp = data["daily"]["temperature_2m_max"][0]
    min_temp = data["daily"]["temperature_2m_min"][0]

    if weather_code == 0:
        weather = "Sunny"
    elif weather_code == 1 or weather_code == 2 or weather_code == 3:
        weather = "Cloudy"
    elif weather_code == 45 or weather_code == 48:
        weather = "Fog"
    elif weather_code == 51 or weather_code == 53 or weather_code == 55:
        weather = "Drizzle"
    elif weather_code == 61 or weather_code == 63 or weather_code == 65:
        weather = "Rain"
    elif weather_code == 66 or weather_code == 67:
        weather = "Snow"
    else:
        weather = "Unknown"

    res = f"Today's weather in {location} is {weather}. The forecast is a high of {max_temp} degrees and a low of {min_temp} degrees."
    return res


today_weather_tool = StructuredTool.from_function(
    func=get_weather,
    name="get_weather",
    description="Get today's weather forecast for a given location",
    args_schema=WeatherInput,
)
