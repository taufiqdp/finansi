from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.agent import router as agent_router
from src.routes.transaction import router as transaction_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "last_updated": "2025-06-03"}


app.include_router(router=agent_router, prefix="/api/v1", tags=["agent"])
app.include_router(router=transaction_router, prefix="/api/v1", tags=["transactions"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
