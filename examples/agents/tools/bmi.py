from typing import Optional, Type

from app.agents.tools.base import BaseTool, StructuredTool
from langchain_core.pydantic_v1 import BaseModel, Field


class BMIInput(BaseModel):
    height: float = Field(description="Height in centimeters (cm). e.g. 170.0")
    weight: float = Field(description="Weight in kilograms (kg). e.g. 70.0")


def calculate_bmi(height: float, weight: float) -> str:
    if height <= 0 or weight <= 0:
        return "Error: Height and weight must be positive numbers."

    height_in_meters = height / 100
    bmi = weight / (height_in_meters**2)
    bmi_rounded = round(bmi, 1)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    return f"Your BMI is {bmi_rounded}, which falls within the {category} range."


bmi_tool = StructuredTool.from_function(
    func=calculate_bmi,
    name="calculate_bmi",
    description="Calculate the Body Mass Index (BMI) from height and weight",
    args_schema=BMIInput,
)
