import React, {ChangeEvent} from 'react';
import {Button, Col, Dropdown, Form, FormGroup, Row, Spinner} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import DropdownItem from "react-bootstrap/DropdownItem";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import {ImageItem, InferenceResult} from "../model";
import styles from "./HomePage.module.css";
import {ModelService} from "../ModelService";
import ReactMarkdown from "react-markdown";
const breaks = require('remark-breaks')


interface IState {
    url: string
    imageSelected: boolean
    isLoading: boolean
    file: string
    browserResponse: InferenceResult | null
    serverResponse: InferenceResult | null
    rawFile: File | null
}

export default class HomePage extends React.Component<{}, IState> {

    state: IState = {
        url: "",
        imageSelected: false,
        isLoading: false,
        file: "",
        browserResponse: null,
        serverResponse: null,
        rawFile: null

    }
    private imageRef = React.createRef<HTMLImageElement>()


    modelService = new ModelService();

    _clear = () => {
        this.setState({
            file: "",
            imageSelected: false,
            browserResponse: null,
            serverResponse: null,
            rawFile: null,
            url: ""
        })

    }

    _onUrlChange = (url: string) => {
        //this.state.url = url;
        if ((url.length > 5) && (url.indexOf("http") === 0)) {
            this.setState({
                url: url,
                file: url,
                imageSelected: true
            })
        }
    }

    _onFileUpload = (event?: ChangeEvent<HTMLInputElement>) => {
        const files = event?.target?.files;

        if (files && files.length > 0) {
            const currentFile = files[0]
            this.setState({
                rawFile: currentFile,
                file: URL.createObjectURL(currentFile),
                imageSelected: true
            })
        }


    }

    _predict = async (event: any) => {

        if (this.state.url || this.state.rawFile) {
            this.setState({isLoading: true});

            const serverRes = await this.modelService.predictServerSideInference({url: this.state.url, imageData: this.state.rawFile});
            const browserRes = await this.modelService.predictBrowserSideInference(this.imageRef.current);

            try {


                this.setState({serverResponse: serverRes, browserResponse: browserRes, isLoading: false});
                console.log(serverRes)
            } catch (e) {
                this.setState({isLoading: false});
                alert(e)
            }
        } else {
            alert("Either URL or image needs to be set")
        }
    }

    renderPredictions(res: InferenceResult | undefined | null) {
        if (res && res.predictions && res.predictions.length > 0) {

            const predictionItems = res.predictions.map((item) =>
                <li>{item.label} ({item.confidence.toFixed(4)} ) </li>
            );

            return (
                <div>
                    <ul>
                        {predictionItems}
                    </ul>

                    <div>Duration (inference): {res.duration_inference} ms</div>
                    <div>Duration (total): {res.duration_total} ms</div>
                </div>

            )

        } else {
            return null
        }

    }

    sampleUrlSelected = (si: ImageItem) => {
        this._onUrlChange(si.url);
    }

    render() {
        const sampleImages = window.APP_CONFIG.sampleImages;

        const notes = `
Server side inference makes a call every time to /api/predict_image . 

Browser side inference makes an initial call to /assets/model_tfjs/model.json to fetch the model and future inference happens locally.
`

        return (
            <div>
                <h1>{window.APP_CONFIG.description}</h1>
                <p>Select an image </p>

                <Form>
                    <FormGroup>
                        <div>
                            <p>Provide a URL</p>
                            <div>

                                <Dropdown>
                                    <DropdownToggle>
                                        Sample Image URL
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {sampleImages.map(si =>
                                            <DropdownItem onClick={() => this.sampleUrlSelected(si)} key={si.name}>
                                                {si.name}
                                            </DropdownItem>)
                                        }

                                    </DropdownMenu>
                                </Dropdown>

                            </div>
                            <input className="form-control" value={this.state.url} name="file" onChange={(e) => this._onUrlChange(e.target.value)}/>

                        </div>
                    </FormGroup>

                    <h3>OR</h3>
                    <FormGroup id={"upload_button"}>
                        <div>
                            <p>Upload an image</p>
                        </div>
                        <div id="imageUpload">

                            <Form.File
                                id="custom-file"
                                label="Upload an image"
                                accept=".png, .jpg, .jpeg"
                                custom
                                onChange={this._onFileUpload}
                            />
                        </div>
                    </FormGroup>

                    <img src={this.state.file} className={styles.img_preview} alt={"selected_img"} hidden={!this.state.imageSelected} crossOrigin="anonymous" ref={this.imageRef}/>

                    <FormGroup>
                        <Button color="success" onClick={this._predict}
                                disabled={this.state.isLoading}> Predict</Button>
                        <span className="p-1 "/>
                        <Button color="danger" onClick={this._clear}> Clear</Button>
                    </FormGroup>


                    {this.state.isLoading && (
                        <div>
                            <Spinner animation="grow" color="primary" style={{width: '5rem', height: '5rem'}}/>

                        </div>
                    )}

                </Form>

                <div className={"mb-5"} id="prediction-container">
                    <Row>
                        <Col>
                            <h2> Server Side Inference</h2>
                            <p> Predictions</p>
                            {this.renderPredictions(this.state.serverResponse)}
                        </Col>

                        <Col>
                            <h2> Client Side Inference</h2>
                            <p> Predictions</p>
                            {this.renderPredictions(this.state.browserResponse)}
                        </Col>
                    </Row>

                </div>

                <div >
                    <h3>Notes</h3>
                    <ReactMarkdown source={notes} escapeHtml={false} plugins={[breaks]} />
                </div>
            </div>
        );
    }
}