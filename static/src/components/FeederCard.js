import React from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import FeederLight from "../images/feeder_white.png";
import FeederDark from "../images/feeder_black.png";
import { feederDeviceShape, feederTelemetryShape } from "../shapes/feeder";
import Icon from "@mdi/react";
import {
  mdiAlertCircle,
  mdiInformation,
  mdiDotsHorizontal,
  mdiPencil,
  mdiPowerPlug,
  mdiBatteryCharging,
  mdiWifi,
} from "@mdi/js";
import HopperLevelIndicator from "../containers/HopperLevelContainer";

export const FeederCardComponent = function (props) {
  // Get device name or generate generic name based on Device HID
  const feederName = props.feeder.name
    ? props.feeder.name
    : `New Feeder (${props.feeder.hid.substring(0, 6)})`;

  let telemetry = {
    rssi: "Unknown",
    charging: "Unknown",
    ir: "Unknown",
  };
  if (props.telemetry) {
    telemetry = {
      rssi: props.telemetry.rssi ? props.telemetry.rssi : 0,
      charging: props.telemetry.charging ? "Charging" : "Charged",
      usb_power: props.telemetry.usb_power ? "Plugged In" : "On Battery",
    };
  }
  const petAvatars = props.pets.map((pet) => (
    <OverlayTrigger placement={"top"} overlay={<Tooltip>{pet.name}</Tooltip>}>
      <img
        src={pet.image}
        alt={pet.name}
        style={{ width: 25, height: 25, borderRadius: "50%", marginTop: -3 }}
        className={"mr-1"}
      />
    </OverlayTrigger>
  ));
  return (
    <Card style={{ marginBottom: 20 }}>
      <Card.Body>
        <Container>
          <Row style={{ alignItems: "center" }}>
            <Col md={12} lg={2}>
              <img
                src={props.feeder.black ? FeederDark : FeederLight}
                alt={"feeder"}
                style={{
                  maxHeight: 250,
                  maxWidth: "100%",
                  margin: "auto",
                  display: "block",
                  opacity: props.isStale ? 0.5 : 1,
                }}
              />
            </Col>
            <Col md={12} lg={10}>
              <Row style={{ display: "flex", justifyContent: "center" }}>
                <Col
                  sm={12}
                  md={7}
                  lg={8}
                  style={{ opacity: props.isStale ? 0.5 : 1 }}
                >
                  <div>
                    <Card.Title>
                      {feederName}
                      <div
                        style={{ display: "inline-block" }}
                        className={"ml-2"}
                      >
                        {petAvatars}
                      </div>
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Last Seen: {props.lastPing}
                    </Card.Subtitle>
                  </div>
                  {!props.isStale && !props.isJustDiscovered ? (
                    <Card.Text className={"mt-3"}>
                      <HopperLevelIndicator deviceHid={props.feeder.hid} />
                      <Row className={"text-muted text-center mt-3 px-2"}>
                        <Col className={"p-2"} xs={6} sm={3} lg={3}>
                          <Icon path={mdiWifi} size={0.75} /> {telemetry.rssi}%
                        </Col>
                        <Col className={"p-2"} xs={6} sm={4} lg={4}>
                          <Icon path={mdiBatteryCharging} size={0.75} />{" "}
                          {telemetry.charging}
                        </Col>
                        <Col className={"p-2"} xs={12} sm={5} lg={4}>
                          <Icon path={mdiPowerPlug} size={0.75} />{" "}
                          {telemetry.usb_power}
                        </Col>
                      </Row>
                    </Card.Text>
                  ) : null}

                  {props.isJustDiscovered ? (
                    <div style={{ marginTop: 20 }}>
                      <p className="text-warning font-weight-bold">
                        <Icon path={mdiInformation} size={0.75} /> New feeders
                        might take a few seconds to come online.
                      </p>
                      <p style={{ marginBottom: 0 }}>
                        Once it has started communicating with the message
                        broker, it will be available in the UI.
                      </p>
                    </div>
                  ) : null}
                  {props.isStale ? (
                    <div style={{ marginTop: 20 }}>
                      <p className="text-danger font-weight-bold">
                        <Icon path={mdiAlertCircle} size={0.75} /> This feeder
                        is no longer connected.
                      </p>
                      <p style={{ marginBottom: 0 }}>
                        Once it has started communicating with the message
                        broker, it will be available in the UI.
                      </p>
                    </div>
                  ) : null}
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
                    style={{ width: "100%", opacity: 1 }}
                    className={"my-1"}
                    variant="warning"
                    onClick={props.showEditModal}
                  >
                    <Icon path={mdiPencil} size={0.75} /> Edit Feeder
                  </Button>
                  <Button
                    style={{ width: "100%" }}
                    className={"my-1"}
                    disabled={props.isStale || props.isJustDiscovered}
                    variant="secondary"
                  >
                    <Icon path={mdiDotsHorizontal} size={0.75} /> More Info
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

FeederCardComponent.propTypes = {
  feeder: feederDeviceShape,
  telemetry: feederTelemetryShape,
};
