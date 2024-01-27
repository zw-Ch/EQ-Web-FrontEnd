import React, {useContext, useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {Col, Input, Tooltip, Select, InputNumber, ConfigProvider, Alert, Button} from 'antd';
import {
    getSpanInput, getSpanOutput, getWidthInput, getWidthOutput, TrainTest,
    Trans_Model_Output_Label, Trans_ModelTrain_Input_Label,
    Trans_ModelTest_Input_Label, Trans_OptParam, Trans_OptResult,
    OPTSTYLES, WIDTH_OUTPUT_LONG, onCloseAlert,
} from "./utils";
import "../share/MyLayout.css";
import "./Opt.css";
import LanguageContext from "../LanguageContext";
import {Trans_ModelList} from "../home/utils";


const OptParam = () => {
    return (
        <div>

        </div>
    );
}
export default OptParam;

const {TextArea} = Input;

export const GUTTER_SIZE = 100;

// export const handleInputChange = (e, index, params, setParams) => {
//     const value = e.target.value;
//     const newParams = [...params];
//     newParams[index - 1] = {...newParams[index - 1], value};
//     setParams(newParams);
// }


export function UrlButton(getModelUrl, la, model_name, toPath, class_name, style) {
    return (
        <Tooltip title={Trans_OptParam(la)[`go_${toPath}_page`]}>
            <Button className={class_name} size={"large"} style={style}>
                <span className="ModelList-Button-Label"
                      onClick={() => getModelUrl(model_name, toPath)}>
                    {Trans_ModelList(la)[toPath]}
                </span>
            </Button>
        </Tooltip>
    )
}

export function OptButton(onClick, la, opt, class_name, style, doStyle) {
    let tooltip = doStyle;
    if (doStyle === "run") {
        tooltip = doStyle + `_${opt}`;
    }

    return (
        <Tooltip title={Trans_OptResult(la)[`start_${tooltip}`]}>
            <Button className={class_name} size={"large"} style={style}>
                <span className="ModelList-Button-Label"
                      onClick={onClick}>
                    {Trans_OptResult(la)[doStyle]}
                </span>
            </Button>
        </Tooltip>
    )
}


export const OptTitle = ({model_name, opt, optStyle, onClick, getComp, getLoss}) => {
    const navigate = useNavigate();
    const {la, _} = useContext(LanguageContext);
    let size = 150;
    let offset = 30;
    if (optStyle === "param" || (optStyle === "result" && opt === "test")) {
        size = 150;
        offset = 30;
    } else if (optStyle === "result") {
        size = 150;
        offset = 120;
    } else if (optStyle === "record") {
        size = 0;
        offset = 0;
    }
    const [forceRefresh, setForceRefresh] = useState(false);

    const getDetailUrl = () => {
        navigate(`/${model_name}/detail`);
    }

    useEffect(() => {
        if (forceRefresh) {
            window.location.reload();
            setForceRefresh(false);
        }
    }, [forceRefresh]);

    const replaceOptUrl = () => {
        const newOpt = opt === 'train' ? 'test' : 'train';

        if (optStyle === "param") {                    // OptParam
            navigate(`/${model_name}/${newOpt}`);
        } else if (OPTSTYLES.includes(optStyle)) {        // OptResult, OptRecord
            navigate(`/${model_name}/${newOpt}/${optStyle}`);
        } else {
            throw new Error("Unknown type of url!")
        }
        setForceRefresh(true);
    }

    return (
        <div className="Opt-Title" style={{paddingRight: `${size + offset}px`}}>
            <h1 style={{textAlign: 'center', flex: 1}}>
                <Tooltip title={Trans_OptParam(la)['go_detail_page']}>
                    <span className="MyLayout-H1-Model"
                          onClick={() => getDetailUrl()}>{model_name} </span>
                </Tooltip>
                <Tooltip title={Trans_OptParam(la)[`go_${TrainTest(opt)}_page`]}
                         color={'magenta'}>
                    <span className="MyLayout-H1-Opt"
                          onClick={() => replaceOptUrl()}>{Trans_OptParam(la)[`${opt}ing`]} </span>
                </Tooltip>
                {OPTSTYLES.includes(optStyle)
                    && <span className="MyLayout-H1-Inform">{Trans_OptParam(la)[`${optStyle}`]}</span>}
            </h1>

            {optStyle === "param"          // OptParam Page, add 'run' button
                && OptButton(onClick, la, opt, "Opt-Run-Button", {marginLeft: `-${size}px`}, "run")}

            {optStyle === "result"         // OptResult Page, add 'compare' button
                && ([OptButton(getComp, la, opt, "Opt-Comp-Button", {marginLeft: `-${size}px`}, "comp"),

                    opt !== "test"          // OptResult Page, for not testing, add 'loss' button
                    && OptButton(getLoss, la, opt, "Opt-Loss-Button", {marginLeft: `-${size}px`}, "loss")
                ])}
        </div>
    );
}


export const OptInput = ({params, opt, la, offset, onChange}) => {        // Input Param
    const height = 40;
    const fontSize = `${20}px`;

    return (
        Array.from({length: params.length}, (_, index) => index + offset).map((i) => (
            <Col span={getSpanInput(i, params.length, opt)} key={i}>
                <ConfigProvider theme={{
                    token: {fontSize: fontSize},
                    components: {
                        Select: {optionFontSize: fontSize, optionPadding: '7px'},
                        Input: {paddingBlock: '3px',},
                        InputNumber: {paddingBlock: '3px',},
                    },
                }}>
                    <div>
                        <label className="Opt-Label" htmlFor={`input${i}`}>
                            {opt === "train" && Trans_ModelTrain_Input_Label(la)[params[i - 1]?.name]}
                            {opt === "test" && Trans_ModelTest_Input_Label(la)[params[i - 1]?.name]}
                        </label>
                        {params[i - 1]?.name === 'device' &&
                            <Select style={{width: getWidthInput(i, params.length, opt), height: height}}
                                    options={[
                                        {value: 'cpu', label: 'cpu'},
                                        {value: 'cuda:0', label: 'cuda:0'},
                                        {value: 'cuda:1', label: 'cuda:1'}
                                    ]}
                                    defaultValue={params[i - 1]?.value}
                                    onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'lr'
                            && <InputNumber style={{width: getWidthInput(i, params.length, opt), height: height}}
                                            min="0.00001"
                                            max="0.1"
                                            step="0.0001"
                                            defaultValue={params[i - 1]?.value}
                                            onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'batch_size'
                            && <Select style={{width: getWidthInput(i, params.length, opt), height: height}}
                                       options={[
                                           {value: '1', label: '1'},
                                           {value: '8', label: '8'},
                                           {value: '16', label: '16'},
                                           {value: '32', label: '32'},
                                           {value: '64', label: '64'},
                                           {value: '128', label: '128'},
                                           {value: '256', label: '256'},
                                       ]}
                                       defaultValue={params[i - 1]?.value}
                                       onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'epochs'
                            && <InputNumber style={{width: getWidthInput(i, params.length, opt), height: height}}
                                            min="1"
                                            max="100"
                                            step="1"
                                            defaultValue={params[i - 1]?.value}
                                            onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'train_ratio'
                            && <InputNumber style={{width: getWidthInput(i, params.length, opt), height: height}}
                                            min="0.05"
                                            max="0.95"
                                            step="0.05"
                                            defaultValue={params[i - 1]?.value}
                                            onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'data_size'
                            && <InputNumber style={{width: getWidthInput(i, params.length, opt), height: height}}
                                            min="100"
                                            max="200000"
                                            step="1000"
                                            defaultValue={params[i - 1]?.value}
                                            onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'sm_scale'
                            && <Select style={{width: getWidthInput(i, params.length, opt), height: height}}
                                       options={[
                                           {value: 'ml', label: 'ml'},
                                           {value: 'md', label: 'md'},
                                       ]}
                                       defaultValue={params[i - 1]?.value}
                                       onChange={(e) => onChange(e, i)}/>}

                        {params[i - 1]?.name === 'chunk_name'
                            && <Select style={{width: getWidthInput(i, params.length, opt), height: height}}
                                       options={[
                                           {value: 'chunk2', label: 'chunk2'},
                                           {value: 'chunk3', label: 'chunk3'},
                                           {value: 'chunk4', label: 'chunk4'},
                                       ]}
                                       defaultValue={params[i - 1]?.value}
                                       onChange={(e) => onChange(e, i)}/>}
                    </div>
                </ConfigProvider>
            </Col>
        ))
    );
}


export const OptOutput = ({results, opt, la, offset}) => {      // Output Param
    return (
        Array.from({length: results.length}, (_, index) => index + offset).map((i) => (
            <Col span={getSpanOutput(i, results.length, opt)} key={i}>
                <label className="Opt-Label" htmlFor={`output${i}`}>
                    {Trans_Model_Output_Label(la)[results[i - 1]?.name]}</label>
                {<Input className="Opt-Output"
                        id={`output${i}`}
                        style={{width: getWidthOutput(i, results.length, opt)}}
                        name={results[i - 1]?.name}
                        value={results[i - 1]?.value}
                />}
            </Col>
        ))
    );
}

export const OptProcess = ({process, la}) => {
    return (
        <Col>
            <label className="Opt-Label">{Trans_Model_Output_Label(la)['process']}</label>
            <TextArea className="Opt-Output" autoSize={true}
                      style={{width: WIDTH_OUTPUT_LONG}}
                      value={process}/>
        </Col>
    )
}

export const OptAlert = ({showAlert, msg, typeAlert, setShowAlert, setStatus, setProcess}) => {
    return (
        <Col>
            {showAlert &&
                <Alert className="Opt-Alert"
                       message={msg}
                       type={typeAlert}
                       showIcon
                       closable
                       onClose={(e) => onCloseAlert(e, setShowAlert, setStatus, setProcess)}/>}
        </Col>
    )
}
