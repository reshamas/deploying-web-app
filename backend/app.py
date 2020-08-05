import io
import os
import time
import traceback
from typing import List

import fastapi
import requests
import uvicorn
from PIL import Image
from fastapi import FastAPI, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.responses import Response, FileResponse

import helper

BACKEND_CORS_ORIGINS = ['*']
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_origin_regex='https?://.*',
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/artifacts", StaticFiles(directory="artifacts"), name="artifacts")
app.mount("/static", StaticFiles(directory="build/static"), name="static")

inferencer = helper.Inferencer(artifacts="artifacts")


def predict_helper(response: Response, file: bytes, top_k=3):
    try:
        start_time_ns = time.time_ns()
        image = Image.open(io.BytesIO(file))
        predictions = inferencer.predict(image, top_k=top_k)

        end_time_ns = time.time_ns()
        elapsed_time_ms = int((end_time_ns - start_time_ns) / 1000000)

        return helper.InferenceResponse(file_size=len(file)
                                        , predictions=predictions
                                        , duration_inference=elapsed_time_ms
                                        , error=None
                                        )

    except Exception as ex:
        response.status_code = fastapi.status.HTTP_400_BAD_REQUEST
        stack_trace = ("".join(traceback.TracebackException.from_exception(ex).format()))
        return helper.InferenceResponse(error=stack_trace)


@app.get("/api/predict_url")
async def predict_url(response: Response, url: str, top_k: int = 5
                      ):
    res = requests.get(url)
    file = res.content

    return predict_helper(response, file, top_k)


@app.post("/api/predict_image")
async def predict_image(request: Request,
                        response: Response,
                        top_k: int = 5,
                        file: bytes = File(...)):
    return predict_helper(response, file, top_k)


@app.get("/api/classes")
async def classes(request: Request) -> List[str]:
    return inferencer.labels

@app.get('/artifacts/{resource}', include_in_schema=False)
def artifacts(resource: str):
    return FileResponse(path=os.path.join("artifacts", resource))

@app.get("/")
async def root():
    return FileResponse(path=os.path.join("build", "index.html"))
    # return {"message": "Navigate to /docs to see the endpoints accessible in this service"}




@app.get('/{resource}', include_in_schema=False)
def static(resource: str):
    if "." not in resource:
        return FileResponse(path=os.path.join("build", "index.html"))
    else:
        return FileResponse(path=os.path.join("build", resource))


if __name__ == "__main__":
    reload = True
    workers = 1

    port = int(os.environ.get('PORT', 8000))

    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=reload, workers=workers
                , log_level="debug"
                , access_log=True
                )
