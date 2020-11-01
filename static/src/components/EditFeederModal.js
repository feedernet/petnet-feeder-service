import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl"
import {mdiCheck} from '@mdi/js';
import Icon from "@mdi/react";

export const EditFeederModalComponent = function (props) {
    return (
        <Modal show={props.show} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Feeder</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label htmlFor={"feeder-name"}>Feeder Name</label>
                <InputGroup className="mb-3">
                    <FormControl
                        id={"feeder-name"}
                        placeholder={"Feeder Name"}
                        aria-label={"Feeder Name"}
                        value={props.name}
                        onChange={props.handleNameChange}
                    />
                    <InputGroup.Append>
                        <Button variant="outline-success" onClick={props.handleNameSubmit}>
                            <Icon path={mdiCheck} size={.75}/> Save
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
            </Modal.Body>
        </Modal>
    )
}