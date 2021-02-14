import React from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Icon from "@mdi/react";
import {
  mdiCat,
  mdiDog,
  mdiCakeVariant,
  mdiWeight,
  mdiRunFast,
  mdiFoodApple,
  mdiClock,
  mdiPencil,
} from "@mdi/js";
import Button from "react-bootstrap/Button";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import MealSuccess from "../images/pet_schedule_meal.png";
import MealError from "../images/pet_schedule_error.png";
import MealMissed from "../images/pet_schedule_missed.png";

export const secSinceMidnightFormatter = (secSinceMidnight) => {
  let options = {
    hour12: true,
    hour: "numeric",
  };
  const d = new Date();
  d.setHours(0, 0, secSinceMidnight, 0);
  if (d.getMinutes() !== 0) {
    options.minute = "numeric";
  }
  if (d.getSeconds() !== 0) {
    options.minute = "numeric";
    options.second = "numeric";
  }
  return d
    .toLocaleTimeString("en-US", options)
    .toLowerCase()
    .replace(/\s/g, "");
};

export const PetCardComponent = function (props) {
  const ageDifMs = Date.now() - props.pet.birthday / 1000;
  const ageDate = new Date(ageDifMs);
  const petAge = Math.abs(ageDate.getUTCFullYear() - 1970);
  const petWeightPounds = Math.round(props.pet.weight / 454);
  let petActivity = "Active";
  if (props.pet.activity_level < 4) {
    petActivity = "Lazy";
  } else if (props.pet.activity_level <= 8) {
    petActivity = "Normal";
  }

  let schedulePcts = [];
  let scheduleSteps = [];

  let events = [];
  if (
    props.hasOwnProperty("events") &&
    props.events &&
    props.events.length > 0
  ) {
    events = props.events;
  }

  events.forEach((event) => {
    secSinceMidnightFormatter(event.time);
    schedulePcts.push(event.time / 864);
    scheduleSteps.push(
      <Step transition={"scale"}>
        {({ accomplished }) => {
          const formattedTime = secSinceMidnightFormatter(event.time);
          const dispensed = event.result !== null;
          let indicator = (
            <div
              style={{
                borderRadius: "50%",
                height: 24,
                width: 24,
                display: "block",
                backgroundColor: "#E5E5E5",
                margin: "0 auto",
              }}
            >
              {""}
            </div>
          );
          let tooltipMessage = `Meal will dispense at ${formattedTime}.`;
          if (accomplished && dispensed && !event.result.fail) {
            tooltipMessage = `Dispensed ${event.result.grams_actual}g`;
            indicator = (
              <img
                src={MealSuccess}
                alt={"scheduled meal"}
                height={24}
                width={24}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0, 0.5))" }}
              />
            );
          } else if (accomplished && dispensed && event.result.fail) {
            tooltipMessage = `Error Dispensing: ${
              event.result.error ? event.result.error : "Unknown Error"
            }`;
            indicator = (
              <img
                src={MealError}
                alt={"scheduled meal"}
                height={24}
                width={24}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0, 0.5))" }}
              />
            );
          } else if (accomplished && !dispensed) {
            tooltipMessage = "Feeder has yet to dispense the meal.";
            indicator = (
              <img
                src={MealMissed}
                alt={"scheduled meal"}
                height={24}
                width={26}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0, 0.5))" }}
              />
            );
          }

          return (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`result-tooltip-${event.time}`}>
                  {tooltipMessage}
                </Tooltip>
              }
            >
              <div style={{ marginTop: 33 }} className={"text-center"}>
                {indicator}
                <p className={"mt-1 text-muted"}>{formattedTime}</p>
              </div>
            </OverlayTrigger>
          );
        }}
      </Step>
    );
  });

  return (
    <Card style={{ marginBottom: 20 }}>
      <Card.Body>
        <Container>
          <Row>
            <Col md={12} lg={3} xl={2} style={{ padding: "0 10px" }}>
              <img
                src={props.pet.image}
                alt={props.pet.name}
                style={{
                  borderRadius: "50%",
                  height: 150,
                  width: 150,
                  margin: "10px auto",
                  display: "block",
                  boxShadow:
                    "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                }}
              />
            </Col>
            <Col md={12} lg={9} xl={10}>
              <Row style={{ display: "flex", justifyContent: "center" }}>
                <Col sm={12} md={7} lg={8}>
                  <h3 className={"mt-3"}>{props.pet.name}</h3>
                  <Row className={"text-muted mt-1 px-2"}>
                    <Col
                      className={"py-2 pl-2 pr-1"}
                      xs={3}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <Icon
                        path={props.pet.animal_type === "cat" ? mdiCat : mdiDog}
                        size={0.75}
                      />{" "}
                      {props.pet.animal_type === "cat" ? "Cat" : "Dog"}
                    </Col>
                    <Col
                      className={"py-2 pl-2 pr-2 d-none d-sm-block"}
                      xs={3}
                      style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      <Icon path={mdiCakeVariant} size={0.75} />{" "}
                      {`${petAge} years`}
                    </Col>
                    <Col
                      className={"py-2 pl-2 pr-2 d-sm-none"}
                      xs={3}
                      style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      <Icon path={mdiCakeVariant} size={0.75} />{" "}
                      {`${petAge}yrs`}
                    </Col>
                    <Col
                      className={"py-2 pl-2 pr-2"}
                      xs={3}
                      style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      <Icon path={mdiWeight} size={0.75} /> {petWeightPounds}lbs
                    </Col>
                    <Col
                      className={"py-2 pl-2 pr-2"}
                      xs={3}
                      style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      <Icon path={mdiRunFast} size={0.75} /> {petActivity}
                    </Col>
                  </Row>
                  <div className={"mt-4 mb-4"}>
                    <ProgressBar
                      percent={props.pctDayElapsed}
                      height={14}
                      filledBackground="linear-gradient(to right, #4C872B, #66B63A)"
                      stepPositions={schedulePcts}
                      text={
                        schedulePcts.length === 0 ? "No Scheduled Meals" : null
                      }
                    >
                      {scheduleSteps}
                    </ProgressBar>
                  </div>
                </Col>
                <Col
                  sm={12}
                  md={5}
                  lg={4}
                  style={{
                    display: "flex",
                    flexFlow: "column",
                    justifyContent: "center",
                  }}
                  className={"my-3"}
                >
                  <Button
                    style={{ width: "100%" }}
                    className={"my-1"}
                    variant="secondary"
                    disabled={props.isStale || props.isJustDiscovered}
                    onClick={props.showSnackModal}
                  >
                    <Icon path={mdiFoodApple} size={0.75} /> Snack Time!
                  </Button>
                  <Button
                    style={{ width: "100%" }}
                    className={"my-1"}
                    disabled={props.isStale || props.isJustDiscovered}
                    variant="success"
                    onClick={props.showScheduleModal}
                  >
                    <Icon path={mdiClock} size={0.75} /> Schedule
                  </Button>
                  <Button
                    style={{ width: "100%", opacity: 1 }}
                    className={"my-1"}
                    variant="warning"
                    onClick={props.showEditPetModal}
                  >
                    <Icon path={mdiPencil} size={0.75} /> Edit Pet
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
};
