from pydantic import BaseModel


class User(BaseModel):
    id: str
    name: str
    groups: list[str]

    def is_admin(self) -> bool:
        return "Admin" in self.groups

    def is_publish_allowed(self) -> bool:
        return self.is_admin() or "PublishAllowed" in self.groups
