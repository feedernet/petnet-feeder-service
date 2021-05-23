import React from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import FeederLight from "../images/feeder_white.png";
import { mdiArrowRightCircle } from "@mdi/js";
import Icon from "@mdi/react";

export const NewFeederCardComponent = function (props) {
  // Get device name or generate generic name based on Device HID
  const feederName = props.feeder.name
    ? props.feeder.name
    : `New Feeder (${props.feeder.hid.substring(0, 6)})`;

  return (
    <Card style={{ marginBottom: 20 }} bg={"secondary"}>
      <Card.Body>
        <Container>
          <Row style={{ alignItems: "center" }}>
            <Col md={12} lg={2}>
              <img
                src={FeederLight}
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
              <h2 className={"text-center text-light font-weight-bold"}>
                We found a new feeder! 🎉
              </h2>
              <h6 className={"text-center text-light my-3"}>
                There are just few quick steps before we get going.
              </h6>
              <Button
                variant={"primary"}
                style={{
                  marginRight: "auto",
                  marginLeft: "auto",
                  display: "block",
                }}
                onClick={props.showNewFeederWizard}
              >
                <Icon path={mdiArrowRightCircle} size={0.75} /> Setup New Feeder
              </Button>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
};
