import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {FeederCardComponent} from "../components/FeederCard";
import {SnackModalComponent} from "../components/SnackModal";
import {getFeederDevices} from "../actions/getFeederDevices";
import {getFeederTelemetryAction} from "../actions/getFeederTelemetry";
import {feederDeviceShape, feederTelemetryShape} from "../shapes/feeder";
import {triggerFeedingAction} from "../actions/triggerFeeding";

class FeederCardContainer extends React.Component {
    state = {
        telemetry: {},
        snackModal: false,
        snackModalPortion: 0.0625
    }


    constructor(props) {
        super(props);
        this.refreshFeederTelemetry = this.refreshFeederTelemetry.bind(this)
        this.dispense = this.dispense.bind(this)
    }

    componentDidMount() {
        this.refreshFeederTelemetry()
    }

    refreshFeederTelemetry() {
        console.log("called")
        this.props.dispatchGetFeederTelemetry(this.props.feeder.hid).then(() => {
            if (!this.props.getFeederTelemetryState._requestFailed) {
                this.setState({
                    telemetry: this.props.getFeederTelemetryState.data
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
                feeder={this.props.feeder}
                telemetry={this.state.telemetry}
                showSnackModal={() => this.setState({snackModal: true})}
            />
            <SnackModalComponent
                show={this.state.snackModal}
                handleClose={() => this.setState({snackModal: false})}
                handleDispense={this.dispense}
                currentPortion={this.state.snackModalPortion}
                setPortion={(portion) => {this.setState({snackModalPortion: portion})}}
            />
        </>
    }
}

FeederCardContainer.propTypes = {
    feeder: feederDeviceShape,
    getFeederTelemetryState: feederTelemetryShape,
    dispatchGetFeederTelemetry: PropTypes.func,
    dispatchTriggerFeeding: PropTypes.func
};

const FeederCard = withRouter(connect(
    (state) => {
        const {getFeederDevicesState, getFeederTelemetryState} = state;
        return {getFeederDevicesState, getFeederTelemetryState};
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
            }
        };
    }
)(FeederCardContainer));

export default FeederCard;