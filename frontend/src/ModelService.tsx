import axios from "axios";
import {PredictionResponse} from "./model";


export class ModelService {

    static async predict(url:string): Promise<PredictionResponse> {
        return null;
    }

    static async predictServerSideInference(url:string): Promise<any> {

    }

    static async predictBrowserSideInference(url:string): Promise<any> {

    }
}