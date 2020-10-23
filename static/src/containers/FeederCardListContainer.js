import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import FeederCard from "./FeederCardContainer";
import {getFeederDevices} from "../actions/getFeederDevices";
import {feederDeviceShape} from "../shapes/feeder";

class FeederCardListContainer extends React.Component {
    state = {
        feeders: []
    }

    componentDidMount() {
        this.props.dispatchGetFeeders()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.getFeederDevicesState.feeders !== this.state.feeders) {
            this.setState({
                feeders: this.props.getFeederDevicesState.feeders
            })
        }
    }

    render() {
        const feederArray = this.state.feeders.map(
            (feeder) => <FeederCard key={feeder.hid} feeder={feeder}/>
        )
        return (
            <>
                <h1 style={{marginBottom: 30}}>Feeders</h1>
                {feederArray}
            </>
        );
    }
}

FeederCardListContainer.propTypes = {
    getFeederDevicesState: PropTypes.arrayOf(feederDeviceShape),
    dispatchGetFeeders: PropTypes.func
};

const FeederCardList = withRouter(connect(
    (state) => {
        const {getFeederDevicesState} = state;
        return {getFeederDevicesState};
    }, (dispatch) => {
        return {
            dispatchGetFeeders() {
                return dispatch(getFeederDevices());
            }
        };
    }
)(FeederCardListContainer));

export default FeederCardList;