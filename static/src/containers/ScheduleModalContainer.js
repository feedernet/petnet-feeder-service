import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { ScheduleModalComponent } from "../components/ScheduleModal";
import { dismissScheduleModal } from "../actions/scheduleModal";
import { getPetScheduleAction } from "../actions/getPetSchedule";
import { updatePetScheduleAction } from "../actions/updatePetSchedule";
import { createPetScheduleAction } from "../actions/createPetSchedule";
import { deletePetScheduleAction } from "../actions/deletePetSchedule";

class ScheduleModalContainer extends React.Component {
  state = {
    editMode: false,
    newEvent: false,
    targetEvent: {},
    events: [],
  };

  constructor(props) {
    super(props);
    this.handleStartEdit = this.handleStartEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDeleteEvent = this.handleDeleteEvent.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const petId = this.props.scheduleModalState.pet.id;
    if (
      !prevProps.scheduleModalState.show &&
      this.props.scheduleModalState.show
    ) {
      this.props.dispatchGetPetSchedule(petId).then(() => {
        if (!this.props.getPetScheduleState._requestFailed) {
          this.setState({
            events: this.props.getPetScheduleState.schedules[petId],
          });
        }
      });
    }

    if (this.state.events !== this.props.getPetScheduleState.schedules[petId]) {
      this.setState({
        events: this.props.getPetScheduleState.schedules[petId],
      });
    }
  }

  handleStartEdit(newEvent = true, targetEvent = {}) {
    if (newEvent) {
      this.setState({
        editMode: true,
        newEvent: true,
      });
    } else {
      this.setState({
        editMode: true,
        newEvent: false,
        targetEvent,
      });
    }
  }

  handleClose() {
    this.setState({
      editMode: false,
      newEvent: false,
      targetEvent: {},
    });
    this.props.dispatchDismissScheduleModal();
  }

  handleSubmit(values, actions) {
    let didFail = false;
    if (this.state.newEvent) {
      this.props
        .dispatchCreatePetSchedule(
          this.props.scheduleModalState.pet.id,
          values.name,
          values.time,
          values.portion
        )
        .then(() => (didFail = this.props.getPetScheduleState._requestFailed));
    } else {
      this.props
        .dispatchUpdatePetSchedule(
          this.props.scheduleModalState.pet.id,
          this.state.targetEvent.event_id,
          values.name,
          values.time,
          values.portion,
          values.enabled
        )
        .then(() => (didFail = this.props.getPetScheduleState._requestFailed));
    }

    if (!didFail) {
      this.setState({
        editMode: false,
        newEvent: false,
        targetEvent: {},
      });
    }
  }

  handleDeleteEvent(eventId) {
    const petId = this.props.scheduleModalState.pet.id;
    this.props.dispatchDeletePetSchedule(petId, eventId);
  }

  render() {
    return (
      <ScheduleModalComponent
        show={this.props.scheduleModalState.show}
        handleClose={this.handleClose}
        pet={this.props.scheduleModalState.pet}
        editMode={this.state.editMode}
        newEvent={this.state.newEvent}
        targetEvent={this.state.targetEvent}
        startEdit={this.handleStartEdit}
        events={this.state.events}
        handleDeleteEvent={this.handleDeleteEvent}
        handleFormSubmit={this.handleSubmit}
      />
    );
  }
}

ScheduleModalContainer.propTypes = {
  scheduleModalState: PropTypes.object,
  getPetScheduleState: PropTypes.object,
  dispatchDismissScheduleModal: PropTypes.func,
  dispatchGetPetSchedule: PropTypes.func,
  dispatchUpdatePetSchedule: PropTypes.func,
  dispatchCreatePetSchedule: PropTypes.func,
  dispatchDeletePetSchedule: PropTypes.func,
};

const ScheduleModal = withRouter(
  connect(
    (state) => {
      const { scheduleModalState, getPetScheduleState } = state;
      return { scheduleModalState, getPetScheduleState };
    },
    (dispatch) => {
      return {
        dispatchDismissScheduleModal() {
          return dispatch(dismissScheduleModal());
        },
        dispatchGetPetSchedule(petId) {
          return dispatch(getPetScheduleAction(petId));
        },
        dispatchUpdatePetSchedule(
          petId,
          eventId,
          name,
          time,
          portion,
          enabled
        ) {
          return dispatch(
            updatePetScheduleAction(
              petId,
              eventId,
              name,
              time,
              portion,
              enabled
            )
          );
        },
        dispatchCreatePetSchedule(petId, name, time, portion) {
          return dispatch(createPetScheduleAction(petId, name, time, portion));
        },
        dispatchDeletePetSchedule(petId, eventId) {
          return dispatch(deletePetScheduleAction(petId, eventId));
        },
      };
    }
  )(ScheduleModalContainer)
);

export default ScheduleModal;
