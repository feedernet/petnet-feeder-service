import React, { isValidElement } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setHopperLevelAction } from "../../actions/setHopperLevel";
import { HopperLevelFormComponent } from "../../components/HopperLevelForm";

export class SetHopperLevelContainer extends React.Component {
  constructor(props) {
    super(props);
    this.handleRegisterFormSubmit = this.handleRegisterFormSubmit.bind(this);
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
  }

  handleRegisterFormSubmit(handleSubmit) {
    this.submitFormAction = handleSubmit;
  }

  handleSubmitForm(values, actions) {
    this.props
      .dispatchSetHopperLevel(this.props.deviceHid, values.level)
      .then(() => {
        if (!this.props.setHopperLevelState._requestFailed) {
          this.props.nextStep();
        }
      });
  }

  render() {
    return (
      <>
        <Modal.Body style={{ textAlign: "center" }} className={"py-4"}>
          <p className={"text-muted mt-1"}>
            Empty the bowl and make sure there is food in the hopper.
          </p>
          <h2>How full is the hopper?</h2>
          <div className={"mx-4"}>
            <HopperLevelFormComponent
              handleFormSubmit={this.handleSubmitForm}
              handleRegisterFormSubmit={this.handleRegisterFormSubmit}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={"success"} onClick={() => this.submitFormAction()}>
            Next
          </Button>
        </Modal.Footer>
      </>
    );
  }
}

SetHopperLevelContainer.propTypes = {
  deviceHid: PropTypes.string,
  setHopperLevelState: PropTypes.object,
  dispatchSetHopperLevel: PropTypes.func,
};

const SetHopperLevel = withRouter(
  connect(
    (state) => {
      const { setHopperLevelState } = state;
      return { setHopperLevelState };
    },
    (dispatch) => {
      return {
        dispatchSetHopperLevel(deviceId, level) {
          return dispatch(setHopperLevelAction(deviceId, level));
        },
      };
    }
  )(SetHopperLevelContainer)
);

export default SetHopperLevel;
