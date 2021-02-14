import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import FeederCard from "./FeederCardContainer";
import Spinner from "react-bootstrap/Spinner";
import { getFeederDevices } from "../actions/getFeederDevices";
import { feederDeviceShape } from "../shapes/feeder";
import Card from "react-bootstrap/Card";

class FeederCardListContainer extends React.Component {
  refreshInterval;
  state = {
    feeders: [],
    loading: true,
  };

  componentDidMount() {
    this.props.dispatchGetFeeders();
    this.refreshInterval = setInterval(this.refreshFeeders.bind(this), 15000);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.getFeederDevicesState.feeders !== this.state.feeders) {
      this.setState({
        feeders: this.props.getFeederDevicesState.feeders,
        loading: false,
      });
    }
  }

  refreshFeeders() {
    this.props.dispatchGetFeeders();
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  render() {
    const header = (
      <h2 style={{ marginBottom: 20 }} className={"d-none d-sm-block"}>
        Feeders
      </h2>
    );
    if (this.state.loading) {
      return (
        <>
          {header}
          <Spinner
            animation="border"
            role="status"
            style={{ margin: "0 auto", display: "block" }}
          >
            <span className="sr-only">Loading...</span>
          </Spinner>
        </>
      );
    }
    const feederArray = this.state.feeders.map((feeder) => (
      <FeederCard key={feeder.hid} feeder={feeder} />
    ));
    return (
      <>
        {header}
        {this.state.feeders.length > 0 ? (
          feederArray
        ) : (
          <Card style={{ marginBottom: 20 }} bg={"light"} text={"dark"}>
            <Card.Body>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spinner
                  animation={"border"}
                  role={"status"}
                  size={"sm"}
                  className={"mt-1 mx-2"}
                >
                  <span className={"sr-only"}>Searching...</span>
                </Spinner>
                <p
                  className={"font-weight-bold mb-0"}
                  style={{ display: "inline-block" }}
                >
                  Waiting for New Devices
                </p>
              </div>
              <p className={"text-center text-muted mt-1 mb-0"}>
                Having trouble connecting your feeder? Check out the{" "}
                <a
                  className={"text-secondary"}
                  href={
                    "https://github.com/feedernet/petnet-feeder-service/wiki/Getting-Started#getting-your-feeder-to-communicate"
                  }
                >
                  Getting Started
                </a>{" "}
                guide on the FeederNet Wiki.
              </p>
            </Card.Body>
          </Card>
        )}
      </>
    );
  }
}

FeederCardListContainer.propTypes = {
  getFeederDevicesState: PropTypes.arrayOf(feederDeviceShape),
  dispatchGetFeeders: PropTypes.func,
};

const FeederCardList = withRouter(
  connect(
    (state) => {
      const { getFeederDevicesState } = state;
      return { getFeederDevicesState };
    },
    (dispatch) => {
      return {
        dispatchGetFeeders() {
          return dispatch(getFeederDevices());
        },
      };
    }
  )(FeederCardListContainer)
);

export default FeederCardList;
