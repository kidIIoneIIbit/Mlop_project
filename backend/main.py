from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import MODEL_NAME, MODEL_VERSION
from routers import breeds, foods, recommendations, compare

app = FastAPI(
    title="Petricommend API",
    version="1.0.0"
)

# CORS (สำคัญมากสำหรับ frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ช่วง dev เปิดไว้ก่อน
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(breeds.router, prefix="/breeds", tags=["Breeds"])
app.include_router(foods.router, prefix="/foods", tags=["Foods"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(compare.router, prefix="/compare", tags=["Compare"])


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0.0"
    }
@app.get("/model/info")
def model_info():
    return {
        "model_name": MODEL_NAME,
        "version": MODEL_VERSION,
        "precision_at_5": 0.0
    }