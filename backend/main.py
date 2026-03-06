from fastapi import FastAPI

from routers import recommendations
from routers import model_info
from routers import breeds
from routers import foods
from routers import compare

app = FastAPI(title="PetriCommend API")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "1.0.0"
    }


app.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["Recommendations"]
)

app.include_router(
    model_info.router,
    prefix="/model",
    tags=["Model"]
)

app.include_router(
    breeds.router,
    prefix="/breeds",
    tags=["Breeds"]
)

app.include_router(
    foods.router,
    prefix="/foods",
    tags=["Foods"]
)
app.include_router(compare.router, prefix="/compare", tags=["Compare"])