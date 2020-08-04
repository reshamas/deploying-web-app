import io
import os

import uvicorn
from PIL import Image
from fastapi import FastAPI, File
from starlette.requests import Request
import time
import helper

app = FastAPI()
inferencer = helper.Inferencer()


@app.get("/predict_url")
async def predict_url(url: str):
    return {"url": url}


@app.post("/predict_image")
async def predict_image(request: Request,
                        file: bytes = File(...)):
    start_time_ns = time.time_ns()

    image = Image.open(io.BytesIO(file))

    label = inferencer.predict(image)

    end_time_ns = time.time_ns()
    elapsed_time_ms = int((end_time_ns - start_time_ns) / 1000000)

    return {
        "file_size": len(file)
        , "label": label
        , "duration_ms": elapsed_time_ms
    }


@app.get("/")
async def root():
    return {"message": "Navigate to /docs to see the endpoints accessible in this service"}


if __name__ == "__main__":
    reload = True
    workers = 1

    port = os.environ.get('PORT', 8000)

    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=reload, workers=workers
                , log_level="debug"
                , access_log=True
                )
