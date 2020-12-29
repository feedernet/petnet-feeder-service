import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {PetCardComponent} from "../components/PetCard";
import {getPetScheduleAction} from "../actions/getPetSchedule";

class PetCardContainer extends React.Component {
    state = {
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
        />
    }
}

PetCardContainer.propTypes = {
    pet: PropTypes.object,
    getPetScheduleState: PropTypes.object,
    dispatchGetPetSchedule: PropTypes.func
};

const PetCard = withRouter(connect(
    (state) => {
        const {getPetScheduleState} = state;
        return {getPetScheduleState};
    }, (dispatch) => {
        return {
            dispatchGetPetSchedule(pet_id) {
                return dispatch(getPetScheduleAction(pet_id))
            }
        };
    }
)(PetCardContainer));

export default PetCard;
