import React, {useEffect, useState} from "react";
import {
    OptInput, OptOutput, OptProcess, OptTitle, OptAlert,
} from "../module";
import {Container} from "reactstrap";
import {Row} from 'antd';
import axios from "axios";
import {ESTIMATE_URL} from "../../../index";
import {
    getStateValue, Trans_OptParam, checkRecord,
    catStr, getParams, resetResults,
    GUTTER_SIZE, PARAMS_TEST, RESULTS_TRAIN_TEST, tranProcess, splitProcess,
} from "../func";
import "../Opt.css";
import "../../Alert.css";
import {catContent, getStoredLanguage} from "../../func";


const TestParam = () => {
    const la = getStoredLanguage();
    const url = window.location.href.split('/').slice(2);
    const model_name = url[url.length - 2]
    const opt = url[url.length - 1]
    const optStyle = "param";

    const [params, setParams] = useState(PARAMS_TEST);
    const [results, setResults] = useState(RESULTS_TRAIN_TEST);
    const [msg, setMsg] = useState("");
    const [status, setStatus] = useState("");
    const [typeAlert, setTypeAlert] = useState("");
    const [process, setProcess] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    let content = "";

    useEffect(() => {
    }, [la]);

    const resetProcess = () => {
        if (status === "") {
            setProcess("");
        } else {
            setProcess('='.repeat(20) + `  ${Trans_OptParam(la)[status]}  ` + "=".repeat(20));
        }
    };

    const testModel = async () => {
        resetProcess();
        resetResults(results, setResults, setProcess);

        const isRecord = await checkRecord(model_name, opt, params, la);
        if (isRecord) {
            content = catStr(Trans_OptParam(la)['start']);
            setProcess(content);

            setMsg(Trans_OptParam(la)[`start_${opt}`]);
            setStatus("start");
            setTypeAlert("success");
            setShowAlert(true);
            axios.post(ESTIMATE_URL + model_name + "/" + opt, getParams(params))
                .then(response => {
                    axios.get(ESTIMATE_URL + model_name + "/process").then(res => {
                        content = catContent(content, tranProcess(splitProcess(res.data), la))
                        content = catContent(content, catStr(Trans_OptParam(la)['end']))
                        setProcess(content);

                        const responseData = response.data;
                        setStatus("end");
                        setResults(getStateValue(results, responseData));
                        setShowAlert(false);
                        console.log("Success!");
                    }).catch(error => {
                        console.log(error);
                    })
                })
                .catch(error => {
                    const content = error.response.data.error;
                    let msg = "";
                    if (content === "Is training") {
                        msg = Trans_OptParam(la)['wait_train'];
                    } else if (content === "File not found") {
                        msg = Trans_OptParam(la)['not_found_train'];
                    } else {
                        msg = Trans_OptParam(la)['unknown_error'];
                    }
                    setStatus(`${opt}_error`);
                    setProcess(catStr(Trans_OptParam(la)[`${opt}_error`]));
                    setMsg(msg);
                    setTypeAlert("error");
                    console.error(error);
                });
        }
    }

    const handleInputChange = (value, index) => {
        const newParams = [...params];
        newParams[index - 1] = {...newParams[index - 1], value};
        setParams(newParams);
    }

    return (
        <Container className="Model-Container">
            <OptTitle model_name={model_name}
                      opt={opt}
                      optStyle={optStyle}
                      onClick={testModel}/>
            <Row>
                <span className="Opt-Input-Title">{Trans_OptParam(la)['input_param']}</span>
            </Row>
            <Row className="Opt-Row" gutter={GUTTER_SIZE}>
                <OptInput params={params}
                          opt={opt}
                          la={la}
                          offset={1}
                          onChange={handleInputChange}/>
            </Row>

            <Row className="Opt-Row">
                <OptAlert showAlert={showAlert}
                          msg={msg}
                          typeAlert={typeAlert}
                          setShowAlert={setShowAlert}
                          setStatus={setStatus}
                          setProcess={setProcess}/>
            </Row>

            <Row>
                <OptProcess process={process}
                            la={la}/>
            </Row>

            <Row>
                <span className="Opt-Output-Title">{Trans_OptParam(la)['output_param']}</span>
            </Row>
            <Row className="Opt-Row" gutter={GUTTER_SIZE}>
                <OptOutput results={results}
                           opt={opt}
                           la={la}
                           offset={1}/>
            </Row>
        </Container>
    );
}

export default TestParam;
