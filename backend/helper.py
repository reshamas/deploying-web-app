import json
from typing import List, Optional

import PIL
import numpy as np
import tensorflow as tf
from pydantic import BaseModel
from tensorflow.keras.applications import imagenet_utils
from tensorflow.keras.preprocessing.image import img_to_array


class InferencerPrediction(BaseModel):
    label: str
    confidence: float


class InferenceResponse(BaseModel):
    file_size: int = 0
    predictions: List[InferencerPrediction] =[]
    duration_inference: int = 0
    error: Optional[str]


class Inferencer:
    def __init__(self, artifacts="artifacts", target_size=(224, 224)):
        self.classifier = tf.keras.models.load_model(artifacts+"/model.h5")
        with open(f"{artifacts}/classes.json") as f:
            self.labels = json.load(f)

        self.target_size = target_size

    def predict(self, image: PIL.Image.Image, top_k: int = 3) -> List[InferencerPrediction]:
        # resize the input image and preprocess it
        image = image.resize(self.target_size)
        image = tf.keras.preprocessing.image.img_to_array(image)

        image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
        image = np.expand_dims(image, axis=0)

        result = self.classifier.predict(image)

        result = sorted(
            list(zip(

                self.labels
                , np.squeeze(result).tolist()
            )
            )
            , key=lambda x: x[1]
            , reverse=True
        )

        result = result[:top_k]

        res = [InferencerPrediction(label=r[0], confidence=r[1]) for r in result]

        return res

    def classes(self):
        return self.labels


def prepare_image(image: PIL.Image.Image, target) -> PIL.Image.Image:
    # if the image mode is not RGB, convert it
    if image.mode != "RGB":
        image = image.convert("RGB")

    # resize the input image and preprocess it
    image = image.resize(target)
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = imagenet_utils.preprocess_input(image)

    # return the processed image
    return image
