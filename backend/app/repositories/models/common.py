from decimal import Decimal
from pydantic.functional_serializers import PlainSerializer
from typing_extensions import Annotated

# Declare customized float type
Float = Annotated[
    # Note: Before decimalization, apply str() to keep the precision
    float,
    PlainSerializer(lambda v: Decimal(str(v)), return_type=Decimal),
]
