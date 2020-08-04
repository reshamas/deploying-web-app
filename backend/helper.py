import json

import PIL
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import imagenet_utils
from tensorflow.keras.preprocessing.image import img_to_array


class Inferencer:
    def __init__(self, artifacts="model", target_size=(224, 224)):
        self.classifier = tf.keras.models.load_model(artifacts, compile=True)

        with open(f"{artifacts}/classes.json") as f:
            self.classes = json.load(f)

        self.target_size = target_size

    def predict(self, image: PIL.Image.Image, num_labels:int=3):
        # resize the input image and preprocess it
        image = image.resize(self.target_size)
        image = tf.keras.preprocessing.image.img_to_array(image)

        image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
        image = np.expand_dims(image, axis=0)

        result = self.classifier.predict(image)

        res2 = imagenet_utils.decode_predictions(result)


        predicted_class = np.argmax(result[0], axis=-1)

        predicted_class_name = self.classes[predicted_class]

        res = sorted(
            list(zip(

                self.classes
                , np.squeeze(result).tolist()
            )
            )
            , key=lambda x: x[1]
            , reverse=True
        )

        return res[:num_labels]


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
