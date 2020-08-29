interface ImageItem {
    name: string
    url: string
}

interface APP_CONFIG {
    title: string
    description: string
    about: string
    code: string
    sampleImages: ImageItem[]
    image_size: number
    top_k: number

}

interface InferencerPrediction {
    label: string
    confidence: number
}

interface InferenceResult {
    predictions: InferencerPrediction[]
    duration_total: number
    duration_inference: number
    error: string
}

type PredictionResponse = {
    server: InferenceResult | null
    browser: InferenceResult | null
}

declare global {
    interface Window {
        APP_CONFIG: APP_CONFIG;
    }
}


export type {ImageItem, APP_CONFIG, InferenceResult, PredictionResponse, InferencerPrediction};