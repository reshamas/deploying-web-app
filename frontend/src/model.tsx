interface ImageItem {
    name:string
    url:string
}
interface APP_CONFIG {
    title: string
    description:string
    about:string
    code:string
    sampleImages: ImageItem[]

}

interface InferenceResult {
    type: string
    predictions: any[]
    duration_total: number
    duration_inference:number;

}

interface PredictionResponse {
    server: InferenceResult
    browser: InferenceResult
}

declare global {
    interface Window { APP_CONFIG: APP_CONFIG; }
}


export type {ImageItem, APP_CONFIG, InferenceResult,PredictionResponse };