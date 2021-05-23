import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { SnackModalComponent } from "../components/SnackModal";
import { dismissSnackModal } from "../actions/snackModal";
import { triggerFeedingAction } from "../actions/triggerFeeding";

class SnackModalContainer extends React.Component {
  state = { portion: 0.0625 };

  constructor(props) {
    super(props);
    this.dispense = this.dispense.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const newPortion = this.props.snackModalState.defaultPortion;
    if (
      prevProps.snackModalState.deviceHid !==
      this.props.snackModalState.deviceHid
    ) {
      this.setState({ portion: newPortion });
    }
  }

  dispense() {
    this.props
      .dispatchTriggerFeeding(
        this.props.snackModalState.deviceHid,
        this.state.portion
      )
      .then(() => {
        this.props.dispatchDismissSnackModal();
      });
  }

  render() {
    return (
      <SnackModalComponent
        show={this.props.snackModalState.show}
        handleClose={this.props.dispatchDismissSnackModal}
        handleDispense={this.dispense}
        currentPortion={this.state.portion}
        setPortion={(portion) => {
          this.setState({ portion: portion });
        }}
      />
    );
  }
}

SnackModalContainer.propTypes = {
  snackModalState: PropTypes.object,
  dispatchDismissSnackModal: PropTypes.func,
  dispatchTriggerFeeding: PropTypes.func,
};

const SnackModal = withRouter(
  connect(
    (state) => {
      const { snackModalState } = state;
      return { snackModalState };
    },
    (dispatch) => {
      return {
        dispatchDismissSnackModal() {
          return dispatch(dismissSnackModal());
        },
        dispatchTriggerFeeding(deviceId, portion) {
          return dispatch(triggerFeedingAction(deviceId, portion));
        },
      };
    }
  )(SnackModalContainer)
);

export default SnackModal;
