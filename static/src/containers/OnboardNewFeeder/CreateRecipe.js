import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { FoodWeightBubble } from "../../components/FoodWeightBubble";
import { getFeedHistoryAction } from "../../actions/getFeedHistory";
import { triggerFeedingAction } from "../../actions/triggerFeeding";
import { setRecipeAction } from "../../actions/setRecipe";

function timer(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export class CreateRecipeContainer extends React.Component {
  state = {
    measuredWeights: [null, null, null],
    isCurrentlyMeasuring: [false, false, false],
    errorWeighing: false,
    manualEntry: false,
    lastFeedTime: null,
    measuredDensity: 0,
    committedDensity: null,
  };

  constructor(props) {
    super(props);
    this.handleDispenseAndWeighLoop = this.handleDispenseAndWeighLoop.bind(
      this
    );
    this.handleDispenseAndPoll = this.handleDispenseAndPoll.bind(this);
    this.handleCreateRecipe = this.handleCreateRecipe.bind(this);
  }

  async handleDispenseAndPoll() {
    let timeoutTime = new Date(Date.now() + 1000 * 60);
    let lastTimeBefore = this.props.getFeedHistoryState.history[0].timestamp;
    let lastTimeAfter = null;
    if (!this.state.manualEntry) {
      this.props.dispatchTriggerFeeding(this.props.deviceHid);
      while (
        (lastTimeAfter === null || lastTimeAfter <= lastTimeBefore) &&
        new Date() < timeoutTime &&
        !this.state.manualEntry
      ) {
        await this.props.dispatchGetFeedHistory(this.props.deviceHid);
        lastTimeAfter = this.props.getFeedHistoryState.history[0].timestamp;
        await timer(2000);
      }

      if (new Date() >= timeoutTime) {
        this.setState({
          errorWeighing: true,
          manualEntry: true,
        });
        return null;
      }

      const portionWeight = this.props.getFeedHistoryState.history[0]
        .grams_actual;

      if (portionWeight >= 1) {
        return portionWeight;
      }

      // Try again if no food was dispensed.
      // This can be an issue when the feeder is first filled and
      // the portion cups haven't cycled around and filled yet.
      return this.handleDispenseAndPoll();
    }
  }

  async handleDispenseAndWeighLoop() {
    let weighStep;
    for (weighStep = 0; weighStep < 3; weighStep++) {
      let weights = this.state.measuredWeights;
      let progress = this.state.isCurrentlyMeasuring;
      progress[weighStep] = true;
      this.setState({ isCurrentlyMeasuring: progress });
      weights[weighStep] = await this.handleDispenseAndPoll();
      progress[weighStep] = true;
      let sum = this.state.measuredWeights.reduce(function (a, b) {
        return a + b;
      }, 0);
      this.setState({
        measuredWeights: weights,
        isCurrentlyMeasuring: progress,
        measuredDensity: Math.round(sum / (weighStep + 1)),
      });
    }
  }

  handleCreateRecipe() {
    if (this.state.measuredDensity !== null && this.state.measuredDensity > 0) {
      this.props
        .dispatchSetRecipe(this.props.deviceHid, this.state.measuredDensity)
        .then(() => {
          if (!this.props.setRecipeState._requestFailed) {
            this.props.nextStep();
          }
        });
    }
  }

  render() {
    return (
      <>
        <Modal.Body style={{ textAlign: "center" }} className={"pt-4"}>
          {this.state.errorWeighing ? (
            <Alert variant={"danger"}>
              The automatic measuring process didn't work! Please manually enter
              food weight.
            </Alert>
          ) : null}
          <h2>What does their food weigh?</h2>
          <p className={"text-muted mt-1"}>
            To make sure we are dispensing the right amount of food, we need to
            know how dense it is.
          </p>

          {!this.state.manualEntry ? (
            <>
              <p className={"text-muted mt-1"}>
                We are going to automatically dispense three 1 tbsp portions to
                get the weight of their food.
              </p>
              <p className={"text-warning mt-1 font-weight-bold"}>
                Please keep your pet(s) away during this process.
              </p>
            </>
          ) : (
            <>
              <p className={"mt-1"}>
                Please weigh out a single tablespoon of food and enter the
                weight below.
              </p>
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="0"
                  type="number"
                  aria-label="Weight of food"
                  aria-describedby="food-weight"
                  value={this.state.measuredDensity}
                  onChange={(event) =>
                    this.setState({
                      measuredDensity: Math.round(event.target.value),
                    })
                  }
                />
                <InputGroup.Append>
                  <InputGroup.Text id="food-weight">g/tbsp</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </>
          )}

          {!this.state.manualEntry ? (
            <>
              <FoodWeightBubble
                loading={this.state.isCurrentlyMeasuring[0]}
                weight={this.state.measuredWeights[0]}
              />
              <FoodWeightBubble
                loading={this.state.isCurrentlyMeasuring[1]}
                weight={this.state.measuredWeights[1]}
              />
              <FoodWeightBubble
                loading={this.state.isCurrentlyMeasuring[2]}
                weight={this.state.measuredWeights[2]}
              />
            </>
          ) : null}

          {!this.state.manualEntry ? (
            <p className={"mt-3"}>
              Average density: {this.state.measuredDensity} g/tbsp
            </p>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {!this.state.manualEntry ? (
            <Button
              variant={"secondary"}
              onClick={() => this.setState({ manualEntry: true })}
            >
              Manual Entry
            </Button>
          ) : null}

          {!this.state.manualEntry && this.state.measuredWeights[2] === null ? (
            <Button
              variant={"success"}
              onClick={() => this.handleDispenseAndWeighLoop()}
              disabled={this.state.isCurrentlyMeasuring[0]}
            >
              Start Weighing Food
            </Button>
          ) : null}

          {!this.state.manualEntry && this.state.measuredWeights[2] !== null ? (
            <Button
              variant={"success"}
              onClick={() =>
                this.handleCreateRecipe(this.state.measuredDensity)
              }
            >
              Submit
            </Button>
          ) : null}

          {this.state.manualEntry ? (
            <>
              <Button
                variant={"light"}
                onClick={() =>
                  this.setState({
                    measuredWeights: [null, null, null],
                    isCurrentlyMeasuring: [false, false, false],
                    errorWeighing: false,
                    manualEntry: false,
                  })
                }
              >
                Go Back
              </Button>
              <Button
                variant={"success"}
                onClick={() => this.handleCreateRecipe()}
              >
                Submit
              </Button>
            </>
          ) : null}
        </Modal.Footer>
      </>
    );
  }
}

CreateRecipeContainer.propTypes = {
  deviceHid: PropTypes.string,
  nextStep: PropTypes.func,
  getFeedHistoryState: PropTypes.object,
  setRecipeState: PropTypes.object,
  dispatchGetFeedHistory: PropTypes.func,
  dispatchTriggerFeeding: PropTypes.func,
  dispatchSetRecipe: PropTypes.func,
};

const CreateRecipe = withRouter(
  connect(
    (state) => {
      const { getFeedHistoryState, setRecipeState } = state;
      return { getFeedHistoryState, setRecipeState };
    },
    (dispatch) => {
      return {
        dispatchGetFeedHistory(deviceId) {
          return dispatch(getFeedHistoryAction(deviceId, 5, 1));
        },
        dispatchTriggerFeeding(deviceId) {
          return dispatch(triggerFeedingAction(deviceId, 0.0625));
        },
        dispatchSetRecipe(deviceId, g_per_tbsp = null) {
          return dispatch(
            setRecipeAction(deviceId, g_per_tbsp, 1, "Initial Recipe", 1)
          );
        },
      };
    }
  )(CreateRecipeContainer)
);

export default CreateRecipe;
