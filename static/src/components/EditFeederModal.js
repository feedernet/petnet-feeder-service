import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import Form from "react-bootstrap/Form";
import { mdiRestart, mdiDelete, mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { ianaTimeZones } from "../constants";
import { HopperLevelFormComponent } from "./HopperLevelForm";
import { FoodVolumeSlider } from "./FoodVolumeSlider";

export const EditFeederModalComponent = function (props) {
  const zoneOptions = ianaTimeZones.map((tz) => (
    <option value={tz}>{tz}</option>
  ));
  return (
    <>
      <Modal
        show={props.show && !props.showConfirmDelete}
        onHide={props.handleClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Feeder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor={"feeder-name"}>Name</label>
          <InputGroup className="mb-3">
            <FormControl
              id={"feeder-name"}
              placeholder={"Feeder Name"}
              aria-label={"Feeder Name"}
              value={props.name}
              onChange={props.handleNameChange}
            />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={props.handleSubmit}>
                <Icon path={mdiCheck} size={0.75} /> Save
              </Button>
            </InputGroup.Append>
          </InputGroup>
          <Row>
            <Col xs={12} sm={6} className={"mb-3"}>
              <label htmlFor={"feeder-button"}>Front Button</label>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="options"
                  defaultValue={props.frontButtonEnabled}
                  style={{ width: "100%" }}
                >
                  <ToggleButton
                    value={true}
                    variant={!props.frontButtonEnabled ? "light" : "success"}
                    disabled={props.isStale}
                    onClick={
                      props.isStale
                        ? null
                        : (event) => props.handleFrontButtonChange(event, true)
                    }
                  >
                    On
                  </ToggleButton>
                  <ToggleButton
                    value={false}
                    variant={
                      props.frontButtonEnabled ||
                      props.frontButtonEnabled === null
                        ? "light"
                        : "danger"
                    }
                    disabled={props.isStale}
                    onClick={
                      props.isStale
                        ? null
                        : (event) => props.handleFrontButtonChange(event, false)
                    }
                  >
                    Off
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Col>
            <Col xs={12} sm={6} className={"mb-3"}>
              <label htmlFor={"feeder-button"}>Device Color</label>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="options"
                  defaultValue={props.isBlack}
                  style={{ width: "100%" }}
                >
                  <ToggleButton
                    value={true}
                    variant={props.isBlack ? "dark" : "light"}
                    onClick={(event) => props.handleColorChange(event, true)}
                  >
                    Black
                  </ToggleButton>
                  <ToggleButton
                    value={false}
                    variant={
                      !props.isBlack || props.isBlack === null
                        ? "secondary"
                        : "light"
                    }
                    onClick={(event) => props.handleColorChange(event, false)}
                  >
                    White
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Col>
            <Col xs={12} className={"mb-3"}>
              <Form.Group controlId="feeder-timezone">
                <Form.Label>Timezone</Form.Label>
                <Form.Control
                  as="select"
                  value={props.timezone}
                  onChange={props.handleTimezoneChange}
                  disabled={props.isStale}
                >
                  {zoneOptions}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} className={"mb-3"}>
              <Form.Group controlId="feeder-hopper-level">
                <Form.Label className={"m-0"}>Hopper Level</Form.Label>
                <div className={"mx-3"}>
                  <HopperLevelFormComponent
                    submitAfterChange
                    handleFormSubmit={props.setHopperLevel}
                    initialLevel={props.hopperLevel}
                    handleRegisterSetFieldValue={
                      props.handleRegisterHopperLevelControl
                    }
                  />
                </div>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="feeder-front-button-amount">
                <Form.Label className={"m-0"}>Manual Feed Amount</Form.Label>
                <Form.Text className="text-muted">
                  This is the cups of food that is dispensed when you press the
                  front button.
                </Form.Text>
                <div className={"mx-3"}>
                  <FoodVolumeSlider
                    onChange={(portion) =>
                      props.handleSetRecipeServing(portion, false)
                    }
                    onAfterChange={(portion) =>
                      props.handleSetRecipeServing(portion, true)
                    }
                    value={props.recipeServing}
                    disabled={props.isStale}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col xs={12} sm={6} className={"my-1"}>
              <Button
                variant="danger"
                onClick={() => props.toggleConfirmDelete(true)}
                style={{ width: "100%" }}
              >
                <Icon path={mdiDelete} size={0.75} /> Delete
              </Button>
            </Col>
            <Col xs={12} sm={6} className={"my-1"}>
              <Button
                variant="warning"
                onClick={props.handleRestart}
                style={{ width: "100%" }}
                disabled={props.isStale}
              >
                <Icon path={mdiRestart} size={0.75} /> Restart
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      <Modal
        show={props.showConfirmDelete}
        onHide={() => props.toggleConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deleting a feeder will also permanently clear it's history.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={props.handleDelete}
            style={{ width: "100%" }}
          >
            <Icon path={mdiDelete} size={0.75} /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
