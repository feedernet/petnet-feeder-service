import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {FeederCardComponent} from "../components/FeederCard";
import {SnackModalComponent} from "../components/SnackModal";
import {EditFeederModalComponent} from "../components/EditFeederModal";
import {getFeederDevices} from "../actions/getFeederDevices";
import {getFeederTelemetryAction} from "../actions/getFeederTelemetry";
import {modifyFeederAction} from "../actions/modifyFeeder";
import {feederDeviceShape, feederTelemetryShape} from "../shapes/feeder";
import {triggerFeedingAction} from "../actions/triggerFeeding";
import {formatUnixTimestamp, isStale} from "../util";
import {restartFeederAction} from "../actions/restartFeeder";
import {deleteFeederAction} from "../actions/deleteFeeder";
import {showFeederWizard} from "../actions/newFeederWizard";
import {NewFeederCardComponent} from "../components/NewFeederCard";

class FeederCardContainer extends React.Component {
    state = {
        feeder: {},
        telemetry: {},
        snackModal: false,
        snackModalPortion: 0.0625,
        editModal: false,
        modFeederName: "",
        showConfirmDelete: false
    }


    constructor(props) {
        super(props);
        this.refreshFeederTelemetry = this.refreshFeederTelemetry.bind(this)
        this.handleSubmitChange = this.handleSubmitChange.bind(this)
        this.dispense = this.dispense.bind(this)
        this.handleDeleteDevice = this.handleDeleteDevice.bind(this)
        this.handleRestartDevice = this.handleRestartDevice.bind(this)
        this.state.feeder = props.feeder
    }

    componentDidMount() {
        this.refreshFeederTelemetry()
        this.setState({
            modFeederName: this.props.feeder.name
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.props.feeder.lastPingedAt !== prevProps.feeder.lastPingedAt ||
            this.props.feeder.name !== prevProps.feeder.name ||
            this.props.feeder.timezone !== prevProps.feeder.timezone ||
            this.props.feeder.frontButton !== prevProps.feeder.frontButton
        ) {
            this.setState({feeder: this.props.feeder})
        }
    }

    refreshFeederTelemetry() {
        this.props.dispatchGetFeederTelemetry(this.props.feeder.hid).then(() => {
            if (!this.props.getFeederTelemetryState._requestFailed) {
                this.setState({
                    telemetry: this.props.getFeederTelemetryState.data
                })
            }
        })
    }

    handleSubmitChange(closeModal = true) {
        this.props.dispatchModifyFeeder(
            this.props.feeder.hid,
            this.state.modFeederName,
            this.state.feeder.timezone,
            this.state.feeder.frontButton
        ).then(() => {
            if (!this.props.modifyFeederState._requestFailed) {
                this.setState({
                    feeder: this.props.modifyFeederState.device,
                    editModal: !closeModal
                })
            }
        })
    }

    dispense() {
        this.props.dispatchTriggerFeeding(
            this.props.feeder.hid,
            this.state.snackModalPortion
        ).then(() => {
            this.setState({snackModal: false})
        })
    }

    handleDeleteDevice() {
        this.props.dispatchDeleteFeeder(this.state.feeder.hid).then(() => {
            if (!this.props.deleteFeederState._requestFailed) {
                this.setState({
                    showConfirmDelete: false
                })
            }
        })
    }

    handleRestartDevice() {
        this.props.dispatchRestartFeeder(this.state.feeder.hid).then(() => {
            if (!this.props.restartFeederState._requestFailed) {
                this.setState({
                    editModal: false
                })
            }
        })
    }

    render() {
        // Check last seen date or show registration date.
        const lastPing = this.state.feeder.lastPingedAt ? this.state.feeder.lastPingedAt : this.state.feeder.discoveredAt
        const lastPingDate = formatUnixTimestamp(lastPing)
        // Has the feeder sent a heartbeat in the last two minutes or is it actively connected to the broker?
        const connected = this.state.feeder.connected || !isStale(lastPing)
        // This is to cover the case where we need to disable the buttons and telemetry
        // for devices that have registered themselves but not yet connected to MQTT
        const justDiscovered = connected && (this.state.feeder.lastPingedAt === 0 || this.state.feeder.lastPingedAt === null)

        return <>
            {
                this.props.feeder.currentRecipe === null ?
                    <NewFeederCardComponent
                        key={this.props.feeder.hid}
                        feeder={this.state.feeder}
                        showNewFeederWizard={() => this.props.dispatchShowNewFeederWizard(this.props.feeder.hid)}
                    /> :
                    <FeederCardComponent
                        key={this.props.feeder.hid}
                        feeder={this.state.feeder}
                        telemetry={this.state.telemetry}
                        isStale={!connected}
                        isJustDiscovered={justDiscovered}
                        lastPing={lastPingDate}
                        showSnackModal={() => this.setState({snackModal: true})}
                        showEditModal={() => this.setState({editModal: true})}
                    />
            }

            <SnackModalComponent
                show={this.state.snackModal}
                handleClose={() => this.setState({snackModal: false})}
                handleDispense={this.dispense}
                currentPortion={this.state.snackModalPortion}
                setPortion={(portion) => {
                    this.setState({snackModalPortion: portion})
                }}
            />
            <EditFeederModalComponent
                show={this.state.editModal}
                isStale={!connected}
                isJustDiscovered={justDiscovered}
                handleClose={() => this.setState({editModal: false})}
                name={this.state.modFeederName}
                timezone={this.state.feeder.timezone}
                frontButtonEnabled={this.state.feeder.frontButton}
                handleNameChange={(name) => this.setState({modFeederName: name.target.value})}
                handleTimezoneChange={(event) => {
                    event.persist();
                    this.setState(prevState => ({
                        feeder: {...prevState.feeder, timezone: event.target.value}
                    }), () => {
                        this.handleSubmitChange(false)
                    })
                }}
                handleFrontButtonChange={(event) => {
                    event.persist();
                    this.setState(prevState => ({
                        feeder: {...prevState.feeder, frontButton: event.target.value === "true"}
                    }), () => {
                        this.handleSubmitChange(false)
                    })
                }}
                handleRestart={this.handleRestartDevice}
                handleSubmit={this.handleSubmitChange}
                handleDelete={this.handleDeleteDevice}
                toggleConfirmDelete={(show) => this.setState({showConfirmDelete: show, editModal: !show})}
                showConfirmDelete={this.state.showConfirmDelete}
            />
        </>
    }
}

FeederCardContainer.propTypes = {
    feeder: feederDeviceShape,
    getFeederTelemetryState: feederTelemetryShape,
    dispatchGetFeederTelemetry: PropTypes.func,
    dispatchTriggerFeeding: PropTypes.func,
    modifyFeederState: feederDeviceShape,
    dispatchModifyFeeder: PropTypes.func,
    dispatchRestartFeeder: PropTypes.func,
    dispatchDeleteFeeder: PropTypes.func,
    dispatchShowNewFeederWizard: PropTypes.func,
    restartFeederState: PropTypes.object,
    deleteFeederState: PropTypes.object
};

const FeederCard = withRouter(connect(
    (state) => {
        const {getFeederDevicesState, getFeederTelemetryState, modifyFeederState, restartFeederState, deleteFeederState} = state;
        return {
            getFeederDevicesState,
            getFeederTelemetryState,
            modifyFeederState,
            restartFeederState,
            deleteFeederState
        };
    }, (dispatch) => {
        return {
            dispatchGetFeeders() {
                return dispatch(getFeederDevices());
            },
            dispatchGetFeederTelemetry(deviceId) {
                return dispatch(getFeederTelemetryAction(deviceId))
            },
            dispatchTriggerFeeding(deviceId, portion) {
                return dispatch(triggerFeedingAction(deviceId, portion))
            },
            dispatchModifyFeeder(deviceId, name, timezone, frontButton) {
                return dispatch(modifyFeederAction(deviceId, name, timezone, frontButton))
            },
            dispatchRestartFeeder(deviceId) {
                return dispatch(restartFeederAction(deviceId))
            },
            dispatchDeleteFeeder(deviceId) {
                return dispatch(deleteFeederAction(deviceId))
            },
            dispatchShowNewFeederWizard(deviceId) {
                return dispatch(showFeederWizard(deviceId))
            }
        };
    }
)(FeederCardContainer));

export default FeederCard;