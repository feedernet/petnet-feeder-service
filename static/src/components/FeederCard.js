import React from 'react';
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import FeederLight from "../images/feeder_white.png";
import {feederDeviceShape, feederTelemetryShape} from "../shapes/feeder";
import Icon from '@mdi/react'
import {
    mdiBatteryCharging,
    mdiWifiStrength3,
    mdiLaserPointer,
    mdiAlertCircle,
    mdiInformation,
    mdiFoodApple,
    mdiClock,
    mdiPencil,
    mdiCog
} from '@mdi/js';


export const FeederCardComponent = function (props) {
    // Get device name or generate generic name based on Device HID
    const feederName = props.feeder.name ? props.feeder.name : `New Feeder (${props.feeder.hid.substring(0, 6)})`

    let telemetry = {
        rssi: "Unknown",
        charging: "Unknown",
        ir: "Unknown"
    }
    if (props.telemetry) {
        telemetry = {
            rssi: props.telemetry.rssi,
            charging: props.telemetry.charging ? "Charging" : "Charged",
            ir: props.telemetry.ir ? "Unobstructed" : "Obstructed"
        }
    }

    return (
        <Card style={{marginBottom: 20}}>
            <Card.Body>
                <Container>
                    <Row style={{alignItems: "center"}}>
                        <Col md={12} lg={2}>
                            <img
                                src={FeederLight}
                                alt={"feeder"}
                                style={{
                                    maxHeight: 250,
                                    maxWidth: "100%",
                                    margin: "auto",
                                    display: "block",
                                    opacity: props.isStale ? 0.5 : 1
                                }}
                            />
                        </Col>
                        <Col md={12} lg={10}>
                            <Row style={{display: "flex", justifyContent: "center"}}>
                                <Col sm={12} md={6} style={{opacity: props.isStale ? 0.5 : 1}}>
                                    <div>
                                        <Card.Title>
                                            {feederName}
                                        </Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            Last Seen: {props.lastPing}
                                        </Card.Subtitle>
                                    </div>
                                    {!props.isStale && !props.isJustDiscovered ?
                                        <Card.Text>
                                            <ul>
                                                <li><Icon path={mdiWifiStrength3} size={.75}/> WiFi Signal
                                                    Strength: {telemetry.rssi}
                                                </li>
                                                <li><Icon path={mdiBatteryCharging}
                                                          size={.75}/> Battery: {telemetry.charging}</li>
                                                <li><Icon path={mdiLaserPointer} size={.75}/> IR Beam: {telemetry.ir}
                                                </li>
                                            </ul>
                                        </Card.Text> : null
                                    }

                                    {props.isJustDiscovered ?
                                        <div style={{marginTop: 20}}>
                                            <p className="text-warning font-weight-bold">
                                                <Icon path={mdiInformation} size={.75}/> New feeders might take a few
                                                seconds to come online.
                                            </p>
                                            <p style={{marginBottom: 0}}>
                                                Once it has started communicating with the message broker,
                                                it will be available in the UI.
                                            </p>
                                        </div> : null}
                                    {props.isStale ?
                                        <div style={{marginTop: 20}}>
                                            <p className="text-danger font-weight-bold">
                                                <Icon path={mdiAlertCircle} size={.75}/> This feeder is no longer
                                                connected.
                                            </p>
                                            <p style={{marginBottom: 0}}>
                                                Once it has started communicating with the message broker,
                                                it will be available in the UI.
                                            </p>
                                        </div> : null
                                    }

                                </Col>
                                <Col
                                    sm={12}
                                    md={6}
                                    style={{display: "flex", flexFlow: "column", justifyContent: "center"}}
                                    className={"my-3"}
                                >
                                    <Button style={{width: "100%"}} className={"my-1"} variant="secondary"
                                            disabled={props.isStale || props.isJustDiscovered}
                                            onClick={props.showSnackModal}>
                                        <Icon path={mdiFoodApple} size={.75}/> Snack Time!
                                    </Button>
                                    <Button style={{width: "100%"}} className={"my-1"}
                                            disabled={props.isStale || props.isJustDiscovered}
                                            variant="success">
                                        <Icon path={mdiClock} size={.75}/> Scheduling
                                    </Button>
                                    <Button style={{width: "100%", opacity: 1}} className={"my-1"} variant="warning"
                                            onClick={props.showEditModal}>
                                        <Icon path={mdiPencil} size={.75}/> Edit Feeder
                                    </Button>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    )
}

FeederCardComponent.propTypes = {
    feeder: feederDeviceShape,
    telemetry: feederTelemetryShape
}