

npx create-react-app my-app --template typescript



wget https://storage.googleapis.com/tensorflow/keras-applications/mobilenet_v2/mobilenet_v2_weights_tf_dim_ordering_tf_kernels_1.0_224_no_top.h5


```
tensorflowjs_converter --input_format=keras_saved_model  \
    --output_format=tfjs_layers_model \
    --weight_shard_size_bytes=4194304 \
    artifacts/model_tf artifacts/model_tfjs
```

tensorflowjs_wizard
tensorflowjs_converter --input_format=keras_saved_model artifacts/model_tf artifacts/model_tfjs


 tfjs_layers_model
tfjs_graph_model

tensorflowjs_converter --input_format=keras_saved_model  \
    --output_format=tfjs_graph_model \
    --weight_shard_size_bytes=99999999 \
    artifacts/model_tf artifacts/model_tfjs

artifacts/model_tf_keras.h5


tensorflowjs_converter --input_format=keras --output_format=tfjs_layers_model --split_weights_by_layer --weight_shard_size_bytes=41943049999 artifacts/model_tf_keras.h5 artifacts/model_tfjs



http://localhost:5000
https://github.com/tensorflow/tfjs/issues/3384

 yarn build && serve -s build



```
brew tap heroku/brew && brew install heroku
heroku login
heroku container:login

APP_NAME="manning-deploy-imagenet-demo"
heroku create $APP_NAME

heroku container:push web --app ${APP_NAME}

heroku container:release web --app ${APP_NAME}
heroku open --app $APP_NAME
heroku logs --tail --app ${APP_NAME}
```


heroku url
https://manning-deploy-imagenet.herokuapp.com/