import axios from "axios";
import {InferenceResult, InferencerPrediction} from "./model";
import * as tf from '@tensorflow/tfjs';


export class ModelService {

    private mobilenet: any = null;
    private image_size: number;
    private classes: string[];
    private top_k: number;

    constructor() {
        this.mobilenet = null;
        this.initializeBrowserModel()
        this.image_size = window.APP_CONFIG.image_size;
        this.classes = [];
        this.top_k = window.APP_CONFIG.top_k;
    }

    async initializeBrowserModel() {
        try{
            const mobilenet = await tf.loadGraphModel(window.APP_CONFIG.url_browser);
            mobilenet.predict(tf.zeros([1, this.image_size, this.image_size, 3]));

            this.mobilenet = mobilenet;

            const resPromise = await axios.get<string[]>(`${window.APP_CONFIG.url_server}/api/classes`);
            const res = resPromise.data;
            this.classes = res;
        }catch (e) {
            console.error(`Failed to load mobilenet model ${e}`)
            alert(e)
        }
        
    }

    // async predict(args: { url: string | null, imageData: any }): Promise<PredictionResponse | null> {
    //
    //     if (args.url) {
    //
    //         const response = await fetch(args.url);
    //         let data = await response.blob();
    //
    //         let metadata = {
    //             type: 'image/jpeg'
    //         };
    //         args.imageData = new File([data], 'upload.jpeg', metadata)
    //     }
    //
    //     if (args.imageData) {
    //
    //         const pr: PredictionResponse = {server: null, browser: null};
    //
    //         try {
    //             let startTime = new Date().getTime();
    //             const serverPromise = await this.predictServerSideInference(args.imageData)
    //             pr.server = serverPromise.data
    //             let endTime = new Date().getTime();
    //             pr.server.duration_total = (endTime - startTime);
    //
    //             const t = await this.predictBrowserSideInference(args.imageData);
    //
    //         } catch (e) {
    //             pr.server = e
    //         }
    //
    //         return pr
    //
    //     }
    //
    //     return null;
    // }

    async predictServerSideInference(args: { url: string | null, imageData: any }) {
        if (args.url) {
            const response = await fetch(args.url);
            let data = await response.blob();
            let metadata = {
                type: 'image/jpeg'
            };
            args.imageData = new File([data], 'upload.jpeg', metadata)
        }

        if (args.imageData) {

            const data = new FormData();
            data.append('file', args.imageData);

            let startTime = new Date().getTime();

            const resPromise = await axios.post<InferenceResult>(`${window.APP_CONFIG.url_server}/api/predict_image`, data);
            const res = resPromise.data;
            const endTime = new Date().getTime();

            res.duration_total = (endTime - startTime);


            return res

        }

        return null;
    }

    async predictBrowserSideInference(element: HTMLImageElement | any): Promise<InferenceResult | null> {
        const startTime = new Date().getTime();

        const logits = tf.tidy(() => {
            // tf.browser.fromPixels() returns a Tensor from an image element.

            let img = tf.browser.fromPixels(element)
                .resizeBilinear([this.image_size, this.image_size])
                .toFloat();

            const offset = tf.scalar(127.5);
            // Normalize the image from [0, 255] to [-1, 1].
            const normalized = img.sub(offset).div(offset);


            // Reshape to a single-element batch so we can pass it to predict.
            const batched = normalized.reshape([1, this.image_size, this.image_size, 3]);

            // Make a prediction through mobilenet.
            return this.mobilenet.predict(batched);
        });

        // Convert logits to probabilities and class names.
        const predictions = await this.getTopKClasses(logits, this.top_k, this.classes);

        //logits.dispose()

        const endTime = new Date().getTime();

        const res = {} as InferenceResult;
        res.duration_total = (endTime - startTime);
        res.duration_inference = res.duration_total;
        res.predictions = predictions;

        return res;

    }

    async getTopKClasses(logits: any, topK: number, classes: string[]) {
        const scores = await logits.data();


        const predictions: InferencerPrediction[] = [];
        for (let i = 0; i < classes.length; i++) {
            predictions.push({
                label: classes[i]
                , confidence: scores[i]
            })
        }

        predictions.sort((a, b) => {
            return b.confidence - a.confidence;
        });

        const res = predictions.slice(0, topK)
        return res


    }
}


