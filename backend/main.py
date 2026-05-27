from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="ForestGuard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGIONS = {
    "mau": {"name": "Mau Forest Complex", "lat": -0.5, "lng": 35.3, "status": "critical", "deforested_ha": 480},
    "mt_kenya": {"name": "Mt. Kenya Forest", "lat": 0.2, "lng": 37.5, "status": "critical", "deforested_ha": 320},
    "kakamega": {"name": "Kakamega Forest", "lat": 0.5, "lng": 34.8, "status": "moderate", "deforested_ha": 195},
    "karura": {"name": "Karura Forest", "lat": -1.2, "lng": 36.8, "status": "moderate", "deforested_ha": 85},
    "tsavo": {"name": "Tsavo East", "lat": -2.5, "lng": 38.0, "status": "stable", "deforested_ha": 52},
    "arabuko": {"name": "Arabuko-Sokoke", "lat": -3.4, "lng": 39.5, "status": "moderate", "deforested_ha": 67},
}

@app.get("/")
def root():
    return {"app": "ForestGuard API", "version": "1.0.0"}

@app.get("/api/regions")
def get_regions():
    return list(REGIONS.values())

@app.get("/api/stats")
def get_stats():
    total_deforested = sum(r["deforested_ha"] for r in REGIONS.values())
    return {
        "forest_cover_km2": 7842,
        "deforested_ytd_ha": total_deforested,
        "reforested_ha": 685,
        "carbon_sequestered_kt": 3.5,
        "active_alerts": 2,
        "regions_monitored": len(REGIONS),
    }

@app.get("/api/region/{region_id}")
def get_region(region_id: str):
    if region_id not in REGIONS:
        raise HTTPException(404, "Region not found")
    return REGIONS[region_id]

@app.get("/api/alerts")
def get_alerts():
    return [
        {"id": 1, "region": "Mau Forest Complex", "severity": "high", "message": "2.3 ha cleared in the last 48h", "time": "2h ago"},
        {"id": 2, "region": "Karura Forest", "severity": "medium", "message": "Suspicious activity near northern boundary", "time": "6h ago"},
    ]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
