import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { HopperLevelIndicatorComponent } from "../components/HopperLevelIndicator";
import { getHopperLevelAction } from "../actions/getHopperLevel";

class HopperLevelIndicatorContainer extends React.Component {
  state = {
    isLoading: true,
    level: 0,
  };

  componentDidMount() {
    this.props.dispatchGetHopperLevel(this.props.deviceHid).then(() => {
      if (!this.props.getHopperLevelState._requestFailed) {
        this.setState({
          isLoading: false,
          level: this.props.getHopperLevelState.levels[this.props.deviceHid],
        });
      }
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const new_level = this.props.getHopperLevelState.levels[
      this.props.deviceHid
    ];
    if (this.state.level !== new_level) {
      this.setState({ level: new_level });
    }
  }

  render() {
    return (
      <HopperLevelIndicatorComponent
        level={this.state.level}
        animated={this.state.isLoading}
      />
    );
  }
}

HopperLevelIndicatorContainer.propTypes = {
  deviceHid: PropTypes.string,
  getHopperLevelState: PropTypes.object,
  dispatchGetHopperLevel: PropTypes.func,
};

const HopperLevelIndicator = withRouter(
  connect(
    (state) => {
      const { getHopperLevelState } = state;
      return { getHopperLevelState };
    },
    (dispatch) => {
      return {
        dispatchGetHopperLevel(deviceId) {
          return dispatch(getHopperLevelAction(deviceId));
        },
      };
    }
  )(HopperLevelIndicatorContainer)
);

export default HopperLevelIndicator;
