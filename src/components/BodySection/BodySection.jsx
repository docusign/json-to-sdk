// Copyright DocuSign, Inc. Ⓒ 2020. MIT License -- https://opensource.org/licenses/MIT
import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {JsonToSdk} from '../../lib/dsJsonToSdk';
import {EnvelopePlusJSON} from '../../lib/dsEnvelopePlusJSON';
import node_framework from '../../assets/NodeJS_example.zip';
import php_framework from '../../assets/PHP_example.zip';
import vb_framework from '../../assets/VB_example.zip';
import csharp_framework from '../../assets/CSharp_example.zip';
import java_framework from '../../assets/Java_example.zip';
import python_framework from '../../assets/Python_example.zip';
import ruby_framework from '../../assets/Ruby_example.zip';
/* eslint import/no-webpack-loader-syntax: off */
import defaultJson from '!!raw-loader!../../assets/default_json.txt';
import defaultFluent from '!!raw-loader!../../assets/default_fluent.txt';
//import { createJSDocThisTag } from 'typescript';

// eslint-disable-next-line
let docusign = {EnvelopePlusJSON};

const langNode = 'NodeJS'
    , langCSharp = 'CSharp'
    , langJava = 'Java'
    , langPhp = 'PHP'
    , langPython = 'Python'
    , langRuby = 'Ruby'
    , langJson = 'JSON'
    , langVB = 'VB'
    , inputTextAreaY = 172; // y start of the input textarea
    ;

class BodySection extends React.Component {
    constructor(props) {
        super(props);
        this.urls = {}
        this.urls[langNode  ] = node_framework;
        this.urls[langPhp   ] = php_framework;
        this.urls[langVB    ] = vb_framework;
        this.urls[langCSharp] = csharp_framework;
        this.urls[langJava  ] = java_framework;
        this.urls[langPython] = python_framework;
        this.urls[langRuby  ] = ruby_framework;
        // exampleFileNames records the filename of the example for each language
        this.exampleFileNames = {};
        this.exampleFileNames[langNode  ] = 'index.js';
        this.exampleFileNames[langPhp   ] = 'index.php';
        this.exampleFileNames[langJson  ] = 'envelope_definition.json';
        this.exampleFileNames[langVB    ] = 'Program.vb';
        this.exampleFileNames[langCSharp] = 'Program.cs';
        this.exampleFileNames[langJava  ] = 'Example.java';
        this.exampleFileNames[langPython] = 'main.py';
        this.exampleFileNames[langRuby  ] = 'main.rb';

        this.state = { 
            inputType: 'json',
            outputType: 'C#',
            fluent: defaultFluent,
            json: defaultJson,
            output: "",
            errMsg: null,
            errStringPos: null,
            windowHeight: 0
        };

        this.appObject = {accessToken: null, accountId: null, dsApi: {findDocuments: this.findDocuments},
            languageNames: this.languageNames}
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.downloadFramework = this.downloadFramework.bind(this);
        this.downloadCode = this.downloadCode.bind(this);
    }
    
    render () {
        return (
        <>
            <Col xs="6" className="mt-4">
                <Form>
                    <div key='inline-radio' className="mb-3">
                        <span className="mr-4"><b>Input:</b></span>
                        <Form.Check name="radio1" inline label="JSON" type='radio' onChange={evt => this.inputJson(evt)} checked={this.state.inputType==='json'} />
                        <Form.Check name="radio1" inline label="Fluent" type='radio' onChange={evt => this.inputFluent(evt)} checked={this.state.inputType==='fluent'} />
                    </div>
                    <div>
                        Note: Only the <a href="https://developers.docusign.com/esign-rest-api/reference/Envelopes/Envelopes/create"
                            target="_blank">Envelopes:create</a> and <a 
                            href="https://developers.docusign.com/docs/esign-rest-api/reference/Envelopes/EnvelopeViews/createRecipient/" 
                            target="_blank">EnvelopeViews:createRecipient</a> API calls are supported.
                    </div>
                    <Form.Group>
                        <Form.Control as="textarea" onChange={evt => this.inputChange(evt)}
                        style={{ height: `${this.state.windowHeight - inputTextAreaY}px`,
                                 fontFamily: "Consolas, monaco, monospace", marginTop: "10px"}}
                        value={this.state.inputType==='json'?this.state.json:this.state.fluent} />
                    </Form.Group>
                </Form>
            </Col>
            <Col xs="6" className="mt-4">
                <Form><Form.Group><Form.Row className="justify-content-md-left">
                    <Col md="auto"><b>Output:</b></Col>
                    <Col><Form.Control as="select" md="auto" style={{width: "10em"}} 
                        onChange={evt => this.outputChange(evt)} size="sm">
                        <option>C#</option><option>PHP</option><option>Java</option>
                        <option>Node.JS</option><option>Python</option><option>Ruby</option>
                        <option>VB</option><option>JSON</option>
                    </Form.Control></Col>
                    { this.state.outputType !== "JSON" ?
                    <Col md="auto"><Button variant="secondary" size="sm" onClick={this.downloadFramework}
                        >Download Framework</Button></Col> : undefined }
                    <Col md="auto"><Button variant="secondary" size="sm" onClick={this.downloadCode}
                        >Download Code</Button></Col>
                    </Form.Row></Form.Group>
                </Form>
                <div style={{fontFamily: "Consolas, monaco, monospace"}}>
                    {this.state.errMsg ? 
                        <div style={{color: "orangered"}}>{this.state.errMsg}</div>
                        :
                        /**  <pre style={{whiteSpace: "pre-wrap"}}>{this.state.output}</pre> */
                        <Form.Control as="textarea" readOnly
                        style={{ height: `${this.state.windowHeight - inputTextAreaY}px`, 
                                 fontFamily: "Consolas, monaco, monospace", marginTop: "44px"}}
                        value={this.state.output} />
                    }
                    {this.state.errStringPos === null ?
                        undefined
                        :
                        <>
                        <pre className="errSection">{this.state.json.substring(0,this.state.errStart)}</pre>
                        <pre className="errSection" style={{color: "orangered"}}>{this.state.json.substring(this.state.errStart, this.state.errEnd)}</pre>
                        <pre className="errSection">{this.state.json.substring(this.state.errEnd)}</pre>
                        </>
                    }
                </div>
           </Col>
           <a className="hidden" 
                href={this.urls[this.sdkLanguage()]}
                rel="noopener noreferrer"
                download={`${this.sdkLanguage()}_example.zip`}
                ref={e=>this.doFrameworkDownload = e}>download framework</a>
            <a className="hidden"
                href={this.state.codeDownloadUrl}
                download={this.exampleFileNames[this.sdkLanguage()]}
                ref={e=>this.doCodeDownload = e}>download example</a>
        </>
        )
    }

    inputJson(evt) {if (evt.target.value === 'on') {this.setState({inputType: 'json'})}}
    inputFluent(evt) {if (evt.target.value === 'on') {this.setState({inputType: 'fluent'})}}
    outputChange(evt) {this.setState({outputType: evt.target.value})}
    inputChange(evt) {this.setState(
        this.state.inputType==='json' ? ({json: evt.target.value, fluent: ""}) :
                                        ({fluent: evt.target.value, json: ""}))
    }

    componentDidUpdate(prevProps, prevState) {
        if      (prevState.inputType !== this.state.inputType) {this.calculate()}
        else if (prevState.outputType !== this.state.outputType) {this.calculate()}
        else if (prevState.inputType === this.state.inputType &&
                 this.state.inputType === "json" &&
                 prevState.json !== this.state.json) {this.calculate()}
        else if (prevState.inputType === this.state.inputType &&
                 this.state.inputType === "fluent" &&
                 prevState.fluent !== this.state.fluent) {this.calculate()}
    }
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);          
        this.calculate();
    }

    updateWindowDimensions() {
        this.setState({ windowHeight: window.innerHeight });
    }      

    calculate() {
        // Compute the output based on the controls and the input
        let errMsg = null
          , json = null
          , sdk = null;

        if (this.state.inputType === "json") {
            try {
                json = JSON.parse(this.state.json);
            } catch (e) {
                errMsg = e.message;
            }
            if (errMsg) {
                this.jsonParseError(errMsg);
                return;
            }
            if (this.state.outputType === 'JSON') {
                this.setState({output: JSON.stringify(json, null, 4), errMsg: null, errStringPos: null});
            } else {
                const jsonToSdk = new JsonToSdk(this.appObject, this.sdkLanguage());
                sdk = jsonToSdk.convert(json);
                this.setState({output: sdk, errMsg: null, errStringPos: null});
            }
        } else {
            // Fluent input  
            try {
                // eslint-disable-next-line
                json = eval(this.state.fluent).getJSON();    
            } catch (e) {
                errMsg = e.message;
            }
            if (errMsg) {
                this.setState({errMsg: errMsg, errStringPos: null})
                return;
            }
            if (this.state.outputType === 'JSON') {
                this.setState({output: JSON.stringify(json, null, 4), errMsg: null, errStringPos: null});
            } else {
                const jsonToSdk = new JsonToSdk(this.appObject, this.sdkLanguage());
                sdk = jsonToSdk.convert(json);
                this.setState({output: sdk, errMsg: null, errStringPos: null});
            }
        }
    }

    jsonParseError(errMsg) {
        const re1 = /in JSON at position (\d+)/
            , results1 = re1.exec(errMsg)
            , out = `Problem! ${errMsg}\n\n`
            , errBuffer = 5;
        let errStringPos = null
          , errStart = null
          , errEnd = null
          ;
        if (results1) {errStringPos = parseInt(results1[1])} 
        if (errStringPos !== null) {
            const len = this.state.json.length;
            errStart = (errStringPos - errBuffer) > 0 ? (errStringPos - errBuffer) : 0;
            errEnd = (errStringPos + errBuffer) > len ? len : (errStringPos + errBuffer);
        }
        this.setState({errMsg: out, errStringPos: errStringPos, errStart: errStart, errEnd: errEnd});
    }

    /**
     * Find all of the document objects in the json
     * @returns {array} documents -- array of document objects in the this.json input
     */
    findDocuments(json) {
        // document objects are found in attributes documents (array) and document
        // Recursive search to find all of them in this.json
        const documents = [];

        function findDocumentsRecursive(o) {
            const attributeNames = Object.keys(o);
            attributeNames.forEach(attributeName => {
                if (attributeName === 'documents') {
                    o[attributeName].forEach((doc, i) => documents.push(o[attributeName][i]))
                }
                if (attributeName === 'document') {
                    documents.push(o[attributeName])
                }
                if (typeof o[attributeName] === 'object' && !Array.isArray(o[attributeName])) {
                    findDocumentsRecursive(o[attributeName])
                }
                if (typeof o[attributeName] === 'object' && Array.isArray(o[attributeName])) {
                    o[attributeName].forEach((a, i) => findDocumentsRecursive(o[attributeName][i]))
                }
            })
        }

        findDocumentsRecursive(json)
        return documents
    }

    sdkLanguage() {
        // Return language code for this.state.outputType
        if (this.state.outputType === "C#") {
            return langCSharp;
        } else if (this.state.outputType === "Node.JS") {
            return langNode;
        } else {
            const choices = {PHP: langPhp, Java: langJava, Python: langPython,
                             Ruby: langRuby, JSON: langJson, VB: langVB};
            return choices[this.state.outputType];
        }
    }
    languageNames (lang) {
        if      (lang === langCSharp) {return "C#"          }
        else if (lang === langNode  ) {return "Node.JS"     }
        else if (lang === langVB    ) {return "Visual Basic"}
        else return lang
    }

    downloadFramework(evt) {this.doFrameworkDownload.click()}

    downloadCode(evt) {
        const blob = new Blob([this.state.output])
            , codeDownloadUrl = URL.createObjectURL(blob)
            ;
        this.setState ({codeDownloadUrl: codeDownloadUrl}, () => {
            this.doCodeDownload.click(); 
            URL.revokeObjectURL(codeDownloadUrl);  // free up storage--no longer needed.
            this.setState({codeDownloadUrl: ""})
        })
    }
}

export default BodySection;
