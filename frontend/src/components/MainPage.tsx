import React, {ChangeEvent} from 'react';
import ReactMarkdown from "react-markdown";
import {Button, Col, Dropdown, Form, FormGroup, Row} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import DropdownItem from "react-bootstrap/DropdownItem";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import {ImageItem} from "../model";
import styles from "./MainPage.module.css";
import axios from "axios";


interface IState{
    url:string | null
    imageSelected: boolean
    isLoading:boolean
    file:string
    predictions: any[]
    rawFile:any
}

export default class MainPage extends React.Component<{},IState> {

    state:IState = {
        url: "",
        imageSelected:false,
        isLoading:false,
        file:"",
        predictions: [],
        rawFile:null

    }

    _clear =()=> {
        this.setState({
            file: "",
            imageSelected: false,
            predictions: [],
            rawFile: null,
            url: null
        })
    }

    _onUrlChange =(url:string)=> {
        //this.state.url = url;
        if ((url.length > 5) && (url.indexOf("http") === 0)) {
            this.setState({
                url:url,
                file: url,
                imageSelected: true
            })
        }
    }

    _onFileUpload =(event?: ChangeEvent<HTMLInputElement>)=>{
        const files = event?.target?.files;

        if (files && files.length > 0){
            const currentFile = files[0]
            this.setState({
                rawFile: currentFile,
                file: URL.createObjectURL(currentFile),
                imageSelected: true
            })
        }


    }

    _predict = async (event:any) => {
        this.setState({isLoading: true});

        let resPromise = null;
        if (this.state.rawFile) {
            const data = new FormData();
            data.append('file', this.state.rawFile);
            resPromise = axios.post('/api/classify', data);
        } else {
            resPromise = axios.get('/api/classify', {
                params: {
                    url: this.state.file
                }
            });
        }

        try {
            const res = await resPromise;
            const payload = res.data;

            this.setState({predictions: payload.predictions, isLoading: false});
            console.log(payload)
        } catch (e) {
            alert(e)
        }
    }
    sampleUrlSelected =(si:ImageItem) => {
        this._onUrlChange(si.url);
    }

    render() {
        const sampleImages = window.APP_CONFIG.sampleImages;

        return (
            <div>
                <h1>{window.APP_CONFIG.description}</h1>
                <p>Select an image </p>

                <Form>
                    <FormGroup>
                        <div>
                            <p>Provide a Url</p>
                            <div>

                                <Dropdown >
                                    <DropdownToggle>
                                        Sample Image Url
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {sampleImages.map(si =>
                                            <DropdownItem onClick={()=>this.sampleUrlSelected(si)}>
                                                {si.name}
                                            </DropdownItem>)
                                        }

                                    </DropdownMenu>
                                </Dropdown>

                            </div>
                            {/*<Input value={this.state.url} name="file" onChange={(e)=>this._onUrlChange(e.target.value)}*/}

                        </div>
                    </FormGroup>

                    <h3>OR</h3>
                    <FormGroup id={"upload_button"}>
                        <div>
                            <p>Upload an image</p>
                        </div>
                        {/*<Label for="imageUpload">*/}
                        {/*    <Input type="file" name="file" id="imageUpload" accept=".png, .jpg, .jpeg" ref="file"*/}
                        {/*           onChange={this._onFileUpload}/>*/}
                        {/*    <span className="btn btn-primary">Upload</span>*/}
                        {/*</Label>*/}
                    </FormGroup>

                    <img src={this.state.file} className={styles.img_preview} hidden={!this.state.imageSelected}/>

                    <FormGroup>
                        <Button color="success" onClick={this._predict}
                                disabled={this.state.isLoading}> Predict</Button>
                        <span className="p-1 "/>
                        <Button color="danger" onClick={this._clear}> Clear</Button>
                    </FormGroup>


                    {/*{this.state.isLoading && (*/}
                    {/*    <div>*/}
                    {/*        <Spinner color="primary" type="grow" style={{width: '5rem', height: '5rem'}}/>*/}

                    {/*    </div>*/}
                    {/*)}*/}

                </Form>

                <div>
                    <Row>
                        <Col>
                            <h2> Server Side Inference</h2>
                            <p> Predictions</p>
                        </Col>

                        <Col>
                            <h2> Client Side Inference</h2>
                            <p> Predictions</p>
                        </Col>
                    </Row>

                </div>




                {/*{this.renderPrediction()}*/}


            </div>
        );
    }
}