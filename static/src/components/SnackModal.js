import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "rc-slider/assets/index.css";
import { FoodVolumeSlider, displaySizes } from "./FoodVolumeSlider";

export const SnackModalComponent = function (props) {
  return (
    <Modal show={props.show} onHide={props.handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>It's snack time!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Someone has been very good! Pick a volume and press dispense.
        <h1 style={{ textAlign: "center" }}>
          {displaySizes[props.currentPortion]}{" "}
          {props.currentPortion > 1 ? "cups" : "cup"}
        </h1>
        <div className={"mx-3"}>
          <FoodVolumeSlider
            value={props.currentPortion}
            onChange={(amount) => props.setPortion(amount)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={props.handleDispense}>
          Dispense
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
