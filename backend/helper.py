import json
from typing import List, Optional

import PIL
import numpy as np
import tensorflow as tf
from pydantic import BaseModel


class InferencerPrediction(BaseModel):
    label: str
    confidence: float


class InferenceResponse(BaseModel):
    file_size: int = 0
    predictions: List[InferencerPrediction] = []
    duration_inference: int = 0
    error: Optional[str]


class Inferencer:
    def __init__(self, assets="assets", target_size=(224, 224)):
        """
        Wrapper around model

        :param assets:
        :param target_size:
        """
        self.classifier = tf.keras.models.load_model(assets + "/model_tf/model.h5")
        with open(f"{assets}/classes.json") as f:
            self.labels = json.load(f)

        self.target_size = target_size

    def predict(self, image: PIL.Image.Image, top_k: int = 3) -> List[InferencerPrediction]:
        """
        Predict labels for image
        :param image:
        :param top_k:
        :return:
        """
        # resize the input image and preprocess it
        image = image.resize(self.target_size)
        image = tf.keras.preprocessing.image.img_to_array(image)
        image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
        image = np.expand_dims(image, axis=0)

        # pass to model
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
        """
        All the classes for model
        :return:
        """
        return self.labels
