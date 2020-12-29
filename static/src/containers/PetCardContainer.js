import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {PetCardComponent} from "../components/PetCard";
import {getPetScheduleAction} from "../actions/getPetSchedule";
import {showSnackModal} from "../actions/snackModal";

class PetCardContainer extends React.Component {
    state = {
        manualFeedPortion: 0.0625,
        pctDayElapsed: 0,
        events: []
    }

    constructor(props) {
        super(props);
        this.refreshSchedule = this.refreshSchedule.bind(this)
    }

    componentDidMount() {
        this.refreshSchedule()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // If the recipe for this feeder is edited, we need to update
        // the default portion in our state.
        const deviceId = this.props.pet.device_hid
        const rcpState = this.props.getRecipeState
        if (
            deviceId in rcpState.recipes &&
            this.state.manualFeedPortion !== (rcpState.recipes[deviceId].tbsp_per_feeding / 16)
        ) {
            this.setState({manualFeedPortion: rcpState.recipes[deviceId].tbsp_per_feeding / 16})
        }
    }

    refreshSchedule() {
        const d = new Date();
        const pctDayElapsed = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000) / 864;

        this.props.dispatchGetPetSchedule(this.props.pet.id).then(() => {
            if (!this.props.getPetScheduleState._requestFailed) {
                this.setState({
                    pctDayElapsed,
                    events: this.props.getPetScheduleState.schedule.events
                })
            }
        })
    }

    render() {
        return <PetCardComponent
            pet={this.props.pet}
            pctDayElapsed={this.state.pctDayElapsed}
            events={this.state.events}
            showSnackModal={
                () => this.props.dispatchShowSnackModal(this.props.pet.device_hid, this.state.manualFeedPortion)
            }
        />
    }
}

PetCardContainer.propTypes = {
    pet: PropTypes.object,
    getPetScheduleState: PropTypes.object,
    getRecipeState: PropTypes.object,
    dispatchGetPetSchedule: PropTypes.func,
    dispatchShowSnackModal: PropTypes.func
};

const PetCard = withRouter(connect(
    (state) => {
        const {getPetScheduleState, getRecipeState} = state;
        return {getPetScheduleState, getRecipeState};
    }, (dispatch) => {
        return {
            dispatchGetPetSchedule(pet_id) {
                return dispatch(getPetScheduleAction(pet_id))
            },
            dispatchShowSnackModal(deviceId, defaultPortion) {
                return dispatch(showSnackModal(deviceId, defaultPortion))
            }
        };
    }
)(PetCardContainer));

export default PetCard;
