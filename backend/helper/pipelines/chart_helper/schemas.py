from typing import Dict, List
from pydantic import BaseModel, Field, RootModel, model_validator


class Values(RootModel):
    root: Dict[str, float] = Field(
        ...,
        description="A set of key-value pairs where the key is the metric name and the value is the numerical data",
    )


class DataPoint(RootModel):
    root:Dict[str, float|str] = Field(
        ...,
        description="A set of key-value pairs where the key is the metric name and the value is the numerical data",
    )

    # there should one key-value pair of the form 'label': 'string' in the data point
    @model_validator(mode='after')
    def validate_label(self):
        if 'label' not in self.root:
            raise ValueError("DataPoint must have a 'label' key")
        if not isinstance(self.root['label'], str):
            raise ValueError("DataPoint 'label' must be a string")
        


class BaseChartData(RootModel):
    root: List[DataPoint]


class BarChartData(BaseChartData):
    pass


class AreaChartData(BaseChartData):
    pass


class LineChartData(BaseChartData):
    pass


class RadarChartData(BaseChartData):
    pass


class PieChartData(BaseChartData):
    pass
