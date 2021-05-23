import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { dismissEditFeederModal } from "../actions/editFeederModal";
import { EditFeederModalComponent } from "../components/EditFeederModal";
import { modifyFeederAction } from "../actions/modifyFeeder";
import { restartFeederAction } from "../actions/restartFeeder";
import { deleteFeederAction } from "../actions/deleteFeeder";
import { setHopperLevelAction } from "../actions/setHopperLevel";
import { feederDeviceShape } from "../shapes/feeder";
import { getHopperLevelAction } from "../actions/getHopperLevel";
import { getFeederDevices } from "../actions/getFeederDevices";
import { getRecipeAction } from "../actions/getRecipe";
import { setRecipeAction } from "../actions/setRecipe";

class EditFeederModalContainer extends React.Component {
  state = {
    feeder: {},
    showConfirmDelete: false,
    hopperLevel: 0,
    manualFeedPortion: 0.0625,
  };

  constructor(props) {
    super(props);
    this.handleSubmitChange = this.handleSubmitChange.bind(this);
    this.handleDeleteDevice = this.handleDeleteDevice.bind(this);
    this.handleRestartDevice = this.handleRestartDevice.bind(this);
    this.handleSetHopperLevel = this.handleSetHopperLevel.bind(this);
    this.handleSetManualFeedPortion = this.handleSetManualFeedPortion.bind(
      this
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const feeder = this.props.editFeederModalState.feeder;
    if (
      prevProps.editFeederModalState.feeder.hid !==
      this.props.editFeederModalState.feeder.hid
    ) {
      this.setState({
        feeder,
        manualFeedPortion: this.props.editFeederModalState.defaultPortion,
      });
      if (this.hopperLevelValue) {
        this.hopperLevelValue(
          "level",
          this.props.getHopperLevelState.levels[feeder.hid]
        );
      }
    }
  }

  updateAndSubmit(event, field, value, closeModal = true) {
    event.persist();
    event.preventDefault();
    this.setState(
      (prevState) => {
        let updatedFeeder = { ...prevState.feeder };
        updatedFeeder[field] = value;
        return { feeder: updatedFeeder };
      },
      () => {
        this.handleSubmitChange(closeModal);
      }
    );
  }

  handleSubmitChange(closeModal = true) {
    this.props
      .dispatchModifyFeeder(
        this.state.feeder.hid,
        this.state.feeder.name,
        this.state.feeder.timezone,
        this.state.feeder.frontButton,
        this.state.feeder.black
      )
      .then(() => {
        if (!this.props.modifyFeederState._requestFailed) {
          this.setState({
            feeder: this.props.modifyFeederState.device,
          });
          this.props.dispatchGetFeeders();
          if (closeModal) {
            this.props.dispatchDismissEditFeederModal();
          }
        }
      });
  }

  handleDeleteDevice() {
    this.props.dispatchDeleteFeeder(this.state.feeder.hid).then(() => {
      if (!this.props.deleteFeederState._requestFailed) {
        this.props.dispatchDismissEditFeederModal();
        this.setState({
          showConfirmDelete: false,
        });
      }
    });
  }

  handleRestartDevice() {
    this.props.dispatchRestartFeeder(this.state.feeder.hid).then(() => {
      if (!this.props.restartFeederState._requestFailed) {
        this.props.dispatchDismissEditFeederModal();
      }
    });
  }

  handleSetHopperLevel(values, actions) {
    this.props
      .dispatchSetHopperLevel(this.state.feeder.hid, values.level)
      .then(() => {
        this.props.dispatchGetHopperLevel(this.state.feeder.hid);
      });
  }

  handleSetManualFeedPortion(portion, commit = false) {
    const tbspInCup = 16;
    const oldPortion = this.state.manualFeedPortion;
    this.setState({ manualFeedPortion: portion }, () => {
      if (commit) {
        this.props
          .dispatchSetRecipe(this.state.feeder.hid, portion * tbspInCup)
          .then(() => {
            this.props.dispatchGetRecipe(this.state.feeder.hid);
          })
          .then(() => {
            if (this.props.getRecipeState._requestFailed) {
              // Failed to update recipe, revert value!
              this.setState({ manualFeedPortion: oldPortion });
            }
          });
      }
    });
  }

  render() {
    const modalState = this.props.editFeederModalState;
    return (
      <EditFeederModalComponent
        show={modalState.show}
        isStale={!this.state.feeder.connected}
        handleClose={this.props.dispatchDismissEditFeederModal}
        name={this.state.feeder.name}
        timezone={this.state.feeder.timezone}
        frontButtonEnabled={this.state.feeder.frontButton}
        isBlack={this.state.feeder.black}
        handleNameChange={(event) => {
          event.persist();
          this.setState((prevState) => ({
            feeder: { ...prevState.feeder, name: event.target.value },
          }));
        }}
        handleTimezoneChange={(event) =>
          this.updateAndSubmit(event, "timezone", event.target.value, false)
        }
        handleFrontButtonChange={(event, enabled) =>
          this.updateAndSubmit(event, "frontButton", enabled, false)
        }
        handleColorChange={(event, black) =>
          this.updateAndSubmit(event, "black", black, false)
        }
        handleRestart={this.handleRestartDevice}
        handleSubmit={this.handleSubmitChange}
        handleDelete={this.handleDeleteDevice}
        toggleConfirmDelete={(show) =>
          this.setState({ showConfirmDelete: show })
        }
        showConfirmDelete={this.state.showConfirmDelete}
        hopperLevel={this.state.hopperLevel}
        setHopperLevel={this.handleSetHopperLevel}
        recipeServing={this.state.manualFeedPortion}
        handleSetRecipeServing={this.handleSetManualFeedPortion}
        handleRegisterHopperLevelControl={(setHopperLevelValue) =>
          (this.hopperLevelValue = setHopperLevelValue)
        }
      />
    );
  }
}

EditFeederModalContainer.propTypes = {
  editFeederModalState: PropTypes.object,
  modifyFeederState: feederDeviceShape,
  restartFeederState: PropTypes.object,
  deleteFeederState: PropTypes.object,
  getHopperLevelState: PropTypes.object,
  dispatchDismissEditFeederModal: PropTypes.func,
  dispatchModifyFeeder: PropTypes.func,
  dispatchRestartFeeder: PropTypes.func,
  dispatchDeleteFeeder: PropTypes.func,
  dispatchSetHopperLevel: PropTypes.func,
  dispatchGetHopperLevel: PropTypes.func,
  dispatchGetFeeders: PropTypes.func,
  dispatchGetRecipe: PropTypes.func,
  dispatchSetRecipe: PropTypes.func,
};

const EditFeederModal = withRouter(
  connect(
    (state) => {
      const {
        editFeederModalState,
        modifyFeederState,
        restartFeederState,
        deleteFeederState,
        getHopperLevelState,
        getRecipeState,
      } = state;
      return {
        editFeederModalState,
        modifyFeederState,
        restartFeederState,
        deleteFeederState,
        getHopperLevelState,
        getRecipeState,
      };
    },
    (dispatch) => {
      return {
        dispatchDismissEditFeederModal() {
          return dispatch(dismissEditFeederModal());
        },
        dispatchModifyFeeder(deviceId, name, timezone, frontButton, black) {
          return dispatch(
            modifyFeederAction(
              deviceId,
              name,
              timezone,
              frontButton,
              null,
              black
            )
          );
        },
        dispatchRestartFeeder(deviceId) {
          return dispatch(restartFeederAction(deviceId));
        },
        dispatchDeleteFeeder(deviceId) {
          return dispatch(deleteFeederAction(deviceId));
        },
        dispatchSetHopperLevel(deviceId, level) {
          return dispatch(setHopperLevelAction(deviceId, level));
        },
        dispatchGetHopperLevel(deviceId) {
          return dispatch(getHopperLevelAction(deviceId));
        },
        dispatchGetFeeders() {
          return dispatch(getFeederDevices());
        },
        dispatchGetRecipe(deviceId) {
          return dispatch(getRecipeAction(deviceId));
        },
        dispatchSetRecipe(deviceId, tbsp_per_feeding = null) {
          return dispatch(
            setRecipeAction(deviceId, null, tbsp_per_feeding, null, null)
          );
        },
      };
    }
  )(EditFeederModalContainer)
);

export default EditFeederModal;
