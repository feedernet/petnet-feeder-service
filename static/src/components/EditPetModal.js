import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const EditPetModalComponent = function (props) {
  return (
    <Modal
      show={props.show && !props.showConfirmDelete}
      onHide={props.handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Pet</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.children}</Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={props.toggleConfirm}>
          Delete Pet
        </Button>
        <Button variant="success" onClick={props.handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
