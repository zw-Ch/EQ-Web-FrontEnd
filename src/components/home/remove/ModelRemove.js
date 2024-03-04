import React, {Fragment, useState, useContext} from "react";
import {Modal, ModalHeader, ModalFooter} from "reactstrap";
import {Button, Alert} from "antd";

import axios from "axios";
import {ESTIMATE_URL} from "../../../index";
import "../list/ModelList.css";
import {Trans_ModelList} from "../utils";
import LanguageContext from "../../LanguageContext";
import {HomeAlert} from "../Home";

const ModelRemove = ({pk, resetState}) => {
    const {la, _} = useContext(LanguageContext);

    const [showAlert, setShowAlert] = useState(false);
    const [msg, setMsg] = useState("");
    const [modal, setModal] = useState(false);

    const toggle = () => {
        setModal(!modal);
    };

    const onCloseAlert = (e) => {
        setShowAlert(false);
        setMsg("");
        console.log(e, "Close Alert.")
    };

    const deleteModel = (pk) => {
        axios.delete(ESTIMATE_URL + "models/" + pk).then(() => {
            toggle();
            resetState();
        }).catch(error => {
            toggle();
            const content = error.response.data;
            let msg = "";
            if (content === "Cannot delete default model") {
                msg = Trans_ModelList(la)['cannot_delete'];
            } else {
                throw new Error("Unknown Error! Please fix this bug immediately.")
            }
            setMsg(msg);
            setShowAlert(true);
            console.log(error);
        });
    };

    return (
        <Fragment>
            <Button className="ModelList-Button-Delete"
                    size={"large"}
                    onClick={() => toggle()}>
                <span className="ModelList-Button-Label-Text"
                      onClick={() => toggle()}>
                    {Trans_ModelList(la)['delete']}
                </span>
            </Button>
            <Modal className="ModelList-Modal-Delete"
                   isOpen={modal}
                   toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    {Trans_ModelList(la)['want_delete']}
                </ModalHeader>

                <ModalFooter>
                    <Button onClick={() => toggle()}>
                        {Trans_ModelList(la)['no']}
                    </Button>
                    <Button onClick={() => deleteModel(pk)}
                            type="primary">
                        {Trans_ModelList(la)['yes']}
                    </Button>
                </ModalFooter>
            </Modal>
            {showAlert && HomeAlert("ModelList-Alert-Delete", msg, "error", onCloseAlert)}

        </Fragment>
    );
}

export default ModelRemove;
