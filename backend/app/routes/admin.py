from datetime import date

from app.dependencies import check_admin
from app.repositories.usage_analysis import find_bots_sorted_by_price
from app.routes.schemas.admin import PublicBotMetaOutput
from app.user import User
from fastapi import APIRouter, Depends, Request

router = APIRouter(tags=["admin"])


@router.get("/admin/public-bots", response_model=list[PublicBotMetaOutput])
async def get_all_public_bots(
    request: Request,
    limit: int = 100,
    start: str | None = None,
    end: str | None = None,
    admin_check=Depends(check_admin),
):
    """Get all public bots. This is intended to be used by admin.
    NOTE:
    - limit: must be lower than 1000.
    - start: start date of the period to be analyzed. The format is `YYYYMMDDHH`.
    - end: end date of the period to be analyzed. The format is `YYYYMMDDHH`.
    - If start and end are not specified, start is set to today's 00:00 and end is set to 23:00.
    - The result is sorted by the total price in descending order.
    """
    bots = await find_bots_sorted_by_price(limit=limit, from_=start, to_=end)

    return [
        PublicBotMetaOutput(
            id=bot.id,
            title=bot.title,
            description=bot.description,
            is_published=True if bot.published_api_stack_name else False,
            published_datetime=bot.published_api_datetime,
            owner_user_id=bot.owner_user_id,
            total_price=bot.total_price,
        )
        for bot in bots
    ]
