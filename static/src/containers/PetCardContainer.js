import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { PetCardComponent } from "../components/PetCard";
import { getPetScheduleAction } from "../actions/getPetSchedule";
import { showSnackModal } from "../actions/snackModal";
import { showEditPetModal } from "../actions/editPetModal";
import { showScheduleModal } from "../actions/scheduleModal";

class PetCardContainer extends React.Component {
  refreshInterval;
  state = {
    manualFeedPortion: 0.0625,
    pctDayElapsed: 0,
    events: [],
    pet: {},
  };

  constructor(props) {
    super(props);
    this.state.pet = props.pet;
    this.refreshSchedule = this.refreshSchedule.bind(this);
  }

  componentDidMount() {
    this.refreshSchedule();
    this.refreshInterval = setInterval(this.refreshSchedule.bind(this), 60000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.pet !== this.props.pet) {
      this.setState({ pet: this.props.pet });
    }

    // If the recipe for this feeder is edited, we need to update
    // the default portion in our state.
    const deviceId = this.state.pet.device_hid;
    const rcpState = this.props.getRecipeState;
    if (
      deviceId in rcpState.recipes &&
      this.state.manualFeedPortion !==
        rcpState.recipes[deviceId].tbsp_per_feeding / 16
    ) {
      this.setState({
        manualFeedPortion: rcpState.recipes[deviceId].tbsp_per_feeding / 16,
      });
    }

    const petId = this.state.pet.id;
    if (this.state.events !== this.props.getPetScheduleState.schedules[petId]) {
      this.setState({
        events: this.props.getPetScheduleState.schedules[petId],
      });
    }
  }

  refreshSchedule() {
    const petId = this.state.pet.id;
    const d = new Date();
    const pctDayElapsed =
      (d.getHours() * 3600 +
        d.getMinutes() * 60 +
        d.getSeconds() +
        d.getMilliseconds() / 1000) /
      864;

    this.props.dispatchGetPetSchedule(this.props.pet.id).then(() => {
      if (!this.props.getPetScheduleState._requestFailed) {
        this.setState({
          pctDayElapsed,
          events: this.props.getPetScheduleState.schedules[petId],
        });
      }
    });
  }

  render() {
    return (
      <PetCardComponent
        pet={this.state.pet}
        pctDayElapsed={this.state.pctDayElapsed}
        events={this.state.events}
        showSnackModal={() =>
          this.props.dispatchShowSnackModal(
            this.state.pet.device_hid,
            this.state.manualFeedPortion
          )
        }
        showEditPetModal={() =>
          this.props.dispatchShowEditPetModal(this.state.pet)
        }
        showScheduleModal={() =>
          this.props.dispatchShowScheduleModal(this.state.pet)
        }
      />
    );
  }
}

PetCardContainer.propTypes = {
  pet: PropTypes.object,
  getPetScheduleState: PropTypes.object,
  getRecipeState: PropTypes.object,
  dispatchGetPetSchedule: PropTypes.func,
  dispatchShowSnackModal: PropTypes.func,
  dispatchShowEditPetModal: PropTypes.func,
  dispatchShowScheduleModal: PropTypes.func,
};

const PetCard = withRouter(
  connect(
    (state) => {
      const { getPetScheduleState, getRecipeState } = state;
      return { getPetScheduleState, getRecipeState };
    },
    (dispatch) => {
      return {
        dispatchGetPetSchedule(pet_id) {
          return dispatch(getPetScheduleAction(pet_id));
        },
        dispatchShowSnackModal(deviceId, defaultPortion) {
          return dispatch(showSnackModal(deviceId, defaultPortion));
        },
        dispatchShowEditPetModal(pet) {
          return dispatch(showEditPetModal(pet));
        },
        dispatchShowScheduleModal(pet) {
          return dispatch(showScheduleModal(pet));
        },
      };
    }
  )(PetCardContainer)
);

export default PetCard;
