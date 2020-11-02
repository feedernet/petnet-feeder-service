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

class FeederCardContainer extends React.Component {
    state = {
        feeder: {},
        telemetry: {},
        snackModal: false,
        snackModalPortion: 0.0625,
        editModal: false,
        modFeederName: ""
    }


    constructor(props) {
        super(props);
        this.refreshFeederTelemetry = this.refreshFeederTelemetry.bind(this)
        this.handleSubmitNameChange = this.handleSubmitNameChange.bind(this)
        this.dispense = this.dispense.bind(this)
        this.state.feeder = props.feeder
    }

    componentDidMount() {
        this.refreshFeederTelemetry()
        this.setState({
            modFeederName: this.props.feeder.name
        })
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

    handleSubmitNameChange() {
        this.props.dispatchModifyFeeder(this.props.feeder.hid, this.state.modFeederName).then(() => {
            if (!this.props.modifyFeederState._requestFailed) {
                this.setState({
                    feeder: this.props.modifyFeederState.device,
                    editModal: false
                })
            }
        })
    }

    dispense() {
        this.props.dispatchTriggerFeeding(
            this.props.feeder.gatewayHid,
            this.props.feeder.hid,
            this.state.snackModalPortion
        ).then(() => {this.setState({snackModal: false})})
    }

    render() {
        return <>
            <FeederCardComponent
                key={this.props.feeder.hid}
                feeder={this.state.feeder}
                telemetry={this.state.telemetry}
                showSnackModal={() => this.setState({snackModal: true})}
                showEditModal={() => this.setState({editModal: true})}
            />
            <SnackModalComponent
                show={this.state.snackModal}
                handleClose={() => this.setState({snackModal: false})}
                handleDispense={this.dispense}
                currentPortion={this.state.snackModalPortion}
                setPortion={(portion) => {this.setState({snackModalPortion: portion})}}
            />
            <EditFeederModalComponent
                show={this.state.editModal}
                handleClose={() => this.setState({editModal: false})}
                name={this.state.modFeederName}
                handleNameChange={(name) => this.setState({modFeederName: name.target.value})}
                handleNameSubmit={this.handleSubmitNameChange}
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
    dispatchModifyFeeder: PropTypes.func
};

const FeederCard = withRouter(connect(
    (state) => {
        const {getFeederDevicesState, getFeederTelemetryState, modifyFeederState} = state;
        return {getFeederDevicesState, getFeederTelemetryState, modifyFeederState};
    }, (dispatch) => {
        return {
            dispatchGetFeeders() {
                return dispatch(getFeederDevices());
            },
            dispatchGetFeederTelemetry(deviceId) {
                return dispatch(getFeederTelemetryAction(deviceId))
            },
            dispatchTriggerFeeding(gatewayId, deviceId, portion) {
                return dispatch(triggerFeedingAction(gatewayId, deviceId, portion))
            },
            dispatchModifyFeeder(deviceId, name) {
                return dispatch(modifyFeederAction(deviceId, name))
            }
        };
    }
)(FeederCardContainer));

export default FeederCard;