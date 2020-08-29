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
from starlette.requests import Request
from starlette.responses import Response, FileResponse
from starlette.staticfiles import StaticFiles

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

app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/static", StaticFiles(directory="build/static"), name="static")

inferencer = helper.Inferencer(assets="assets")


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


@app.get("/api/predict_url"
    , summary="Predict by url"
         )
async def predict_url(response: Response, url: str, top_k: int = 5
                      ):
    """
    Run inference based on image passed by url
    :param response:
    :param url: url of image
    :param top_k: number of predictions to return
    :return:
    """
    res = requests.get(url)
    file = res.content

    return predict_helper(response, file, top_k)


@app.post("/api/predict_image"
    , summary="Predict by body"
          )
async def predict_image(response: Response,
                        top_k: int = 5,
                        file: bytes = File(...)):
    """
    Run inference based on image passed in post data

    :param response:
    :param top_k: number of predictions to return
    :param file: post image data
    :return:
    """
    return predict_helper(response, file, top_k)


@app.get("/api/classes", summary="Model classes")
async def classes() -> List[str]:
    """
    Returns list of all classes the model was trained on
    :return:
    """
    return inferencer.labels


@app.get('/artifacts/{resource}', include_in_schema=False)
def artifacts(resource: str):
    return FileResponse(path=os.path.join("artifacts", resource))


# @app.route("/(?P<path>.*)", include_in_schema=False)
@app.get('/{resource}', include_in_schema=False)
@app.get("/")
def static(request: Request):
    resource = request.path_params.get("resource", "")
    if "." not in resource:
        return FileResponse(path=os.path.join("build", "index.html"))
    elif "/static" in resource:
        index = resource.index("/static")
        path = resource[index:]
        return FileResponse(path=os.path.join("build", path))
    else:
        return FileResponse(path=os.path.join("build", resource))


async def default_route(scope, receive, send):
    """
    Custom route to deal with app not mounted at base
    :param scope:
    :param receive:
    :param send:
    :return:
    """
    request = Request(scope, receive=receive, send=send)
    path = request.url.path or ""

    if "/static" in path:
        index = path.index("/static")
        path = os.path.join("build", path[index:][1:])
    else:
        path = os.path.basename(path)
        path = os.path.join("build", path)
    if os.path.exists(path):
        response = FileResponse(path=path)
        await response(scope, receive, send)

    return app.router.not_found(scope, receive, send)


app.router.default = default_route

if __name__ == "__main__":
    reload = True
    workers = 1

    port = int(os.environ.get('PORT', 8000))

    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=reload, workers=workers
                , log_level="debug"
                , access_log=True
                )
