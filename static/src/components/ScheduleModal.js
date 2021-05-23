import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import {
  mdiClockOutline,
  mdiCup,
  mdiSquareEditOutline,
  mdiDelete,
} from "@mdi/js";
import Icon from "@mdi/react";
import { Formik, Field } from "formik";
import Form from "react-bootstrap/Form";
import * as Yup from "yup";
import { displaySizes, FoodVolumeSlider } from "./FoodVolumeSlider";
import TimeKeeper from "react-timekeeper";
import { secSinceMidnightFormatter } from "./PetCard";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Your meal has to have a name."),
  time: Yup.number().required().min(0).max(86400),
  portion: Yup.number().required().min(0.0625).max(2),
  enabled: Yup.bool().required(),
});

const twentyFourHourToSeconds = (hour, minute) => {
  const totalMin = hour * 60 + minute;
  return totalMin * 60;
};

const secondsToTwentyFourHour = (second) => {
  const hour = Math.floor(second / 3600);
  const minute = (second % 3600) / 60;
  return { hour, minute };
};

export const ScheduleModalComponent = function (props) {
  let scheduledEvents = (
    <Card bg={"primary"} className={"text-light text-center mb-2"}>
      <Card.Body>No Meals Scheduled</Card.Body>
    </Card>
  );
  if (
    props.hasOwnProperty("events") &&
    props.events &&
    props.events.length > 0
  ) {
    scheduledEvents = props.events.map((event) => (
      <Card
        bg={event.enabled ? "primary" : "info"}
        className={"text-light mb-3"}
      >
        <Card.Body>
          <Row>
            <Col xs={12} sm={9}>
              <h3>{event.name}</h3>
              <p className={"mb-0 mr-3"} style={{ display: "inline-block" }}>
                <Icon path={mdiCup} size={0.75} /> {displaySizes[event.portion]}{" "}
                {event.portion > 1 ? "cups" : "cup"}
              </p>
              <p className={"mb-3"} style={{ display: "inline-block" }}>
                <Icon path={mdiClockOutline} size={0.75} />{" "}
                {secSinceMidnightFormatter(event.time)}
              </p>
            </Col>
            <Col xs={12} sm={3}>
              <Button
                size="sm"
                variant={"light"}
                className={"mt-2 mb-1"}
                style={{ width: "100%" }}
                onClick={() => props.startEdit(false, event)}
              >
                <Icon path={mdiSquareEditOutline} size={0.75} /> Edit
              </Button>
              <Button
                size="sm"
                variant={"danger"}
                className={"mt-1 mb-0"}
                style={{ width: "100%" }}
                onClick={() => props.handleDeleteEvent(event.event_id)}
              >
                <Icon path={mdiDelete} size={0.75} /> Delete
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ));
  }

  let body = (
    <>
      <Modal.Body>
        {scheduledEvents}
        <Button
          onClick={() => props.startEdit(true)}
          variant={"secondary"}
          style={{ width: "100%" }}
          className={"mt-1"}
        >
          Add Meal
        </Button>
      </Modal.Body>
    </>
  );
  if (props.editMode) {
    body = (
      <Formik
        initialValues={
          Object.keys(props.targetEvent).length !== 0
            ? props.targetEvent
            : {
                name: "",
                time: 39600,
                portion: 1,
                enabled: true,
              }
        }
        validationSchema={validationSchema}
        onSubmit={props.handleFormSubmit}
        validateOnChange={false}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Modal.Body>
                <Row>
                  <Col xs={12} md={7}>
                    <Form.Group controlId="mealName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type={"text"}
                        placeholder={"Breakfast"}
                        name={"name"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.name}
                        isInvalid={touched.name && errors.name}
                      />
                      {touched.name && errors.name ? (
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      ) : null}
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Cups of Food</Form.Label>
                      <h1 style={{ textAlign: "center" }}>
                        {displaySizes[values.portion]}{" "}
                        {values.portion > 1 ? "cups" : "cup"}
                      </h1>
                      <div
                        className={"mx-2"}
                        style={{ marginTop: 0, marginBottom: 40 }}
                      >
                        <FoodVolumeSlider
                          value={values.portion}
                          onChange={(amount) =>
                            setFieldValue("portion", amount)
                          }
                        />
                      </div>
                      {touched.portion && errors.portion ? (
                        <Form.Control.Feedback type="invalid">
                          {errors.portion}
                        </Form.Control.Feedback>
                      ) : null}
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Enabled</Form.Label>
                      <ButtonGroup
                        aria-label="Basic example"
                        style={{ width: "100%" }}
                      >
                        <Button
                          variant={values.enabled ? "success" : "light"}
                          onClick={() => setFieldValue("enabled", true)}
                          disabled={props.newEvent}
                        >
                          On
                        </Button>
                        <Button
                          variant={!values.enabled ? "danger" : "light"}
                          onClick={() => setFieldValue("enabled", false)}
                          disabled={props.newEvent}
                        >
                          Off
                        </Button>
                      </ButtonGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={5}>
                    <Form.Group>
                      <Form.Label>Time</Form.Label>
                      <div style={{ margin: "0 auto", display: "table" }}>
                        <TimeKeeper
                          switchToMinuteOnHourSelect
                          closeOnMinuteSelect
                          time={secondsToTwentyFourHour(values.time)}
                          onChange={(newTime) =>
                            setFieldValue(
                              "time",
                              twentyFourHourToSeconds(
                                newTime.hour,
                                newTime.minute
                              )
                            )
                          }
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button type={"submit"}>Save</Button>
              </Modal.Footer>
            </form>
          );
        }}
      </Formik>
    );
  }

  return (
    <Modal
      show={props.show && !props.showConfirmDelete}
      onHide={props.handleClose}
      centered
      className={"schedule-modal"}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.pet.name}'s Schedule</Modal.Title>
      </Modal.Header>
      {body}
    </Modal>
  );
};
