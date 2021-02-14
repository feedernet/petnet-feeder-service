import React from "react";
import StepWizard from "react-step-wizard";
import CreateOrAssignPet from "./OnboardNewFeeder/CreateOrAssignPet";
import Modal from "react-bootstrap/Modal";
import SetHopperLevel from "./OnboardNewFeeder/SetHopperLevel";
import { NewFeederFinished } from "./OnboardNewFeeder/Finished";
import CreateRecipe from "./OnboardNewFeeder/CreateRecipe";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { dismissFeederWizard } from "../actions/newFeederWizard";
import { getFeederDevices } from "../actions/getFeederDevices";

class NewFeederWizardContainer extends React.Component {
  constructor(props) {
    super(props);
    this.registerSetupWizard = this.registerSetupWizard.bind(this);
    this.handleCloseAndRefresh = this.handleCloseAndRefresh.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // When the modal is hidden
    if (
      !prevProps.newFeederWizardState.show &&
      this.props.newFeederWizardState.show
    ) {
      if (this.wizard !== null) {
        this.wizard.firstStep();
      }
    }
  }

  registerSetupWizard(instance) {
    this.wizard = instance;
  }

  handleCloseAndRefresh() {
    this.props.dispatchDismissFeederWizard();
    this.props.dispatchGetFeeders();
  }

  render() {
    const showState = this.props.newFeederWizardState.show;
    const targetDevice = this.props.newFeederWizardState.deviceHid;
    return (
      <Modal
        show={showState}
        onHide={this.props.dispatchDismissFeederWizard}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className={"h5"}>New Feeder Wizard</Modal.Title>
        </Modal.Header>
        <StepWizard
          instance={this.registerSetupWizard}
          transitions={{}}
          isLazyMount
        >
          <CreateOrAssignPet deviceHid={targetDevice} />
          <SetHopperLevel deviceHid={targetDevice} />
          <CreateRecipe deviceHid={targetDevice} />
          <NewFeederFinished closeWizard={this.handleCloseAndRefresh} />
        </StepWizard>
      </Modal>
    );
  }
}

NewFeederWizardContainer.propTypes = {
  newFeederWizardState: PropTypes.object,
  dispatchDismissFeederWizard: PropTypes.func,
  dispatchGetFeeders: PropTypes.func,
};

const NewFeederWizard = withRouter(
  connect(
    (state) => {
      const { newFeederWizardState } = state;
      return { newFeederWizardState };
    },
    (dispatch) => {
      return {
        dispatchDismissFeederWizard() {
          return dispatch(dismissFeederWizard());
        },
        dispatchGetFeeders() {
          return dispatch(getFeederDevices());
        },
      };
    }
  )(NewFeederWizardContainer)
);

export default NewFeederWizard;
