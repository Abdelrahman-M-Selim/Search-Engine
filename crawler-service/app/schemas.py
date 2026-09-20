from pydantic import BaseModel, HttpUrl

class SeedRequest(BaseModel):
    url: HttpUrl
