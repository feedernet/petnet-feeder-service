import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getFeedHistoryAction } from "../actions/getFeedHistory";
import { feederDeviceShape, feedHistoryShape } from "../shapes/feeder";
import { FeedHistoryTableComponent } from "../components/FeedHistoryTable";

class FeedHistoryContainer extends React.Component {
  refreshInterval;
  state = {
    page: 1,
    pageSize: 10,
    filteredDeviceId: "",
    filteredDeviceName: "",
    history: [],
    totalPages: 0,
  };

  constructor(props) {
    super(props);
    this.updateHistory = this.updateHistory.bind(this);
    this.handleChangePageSize = this.handleChangePageSize.bind(this);
    this.handleChangeFilter = this.handleChangeFilter.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
  }

  componentDidMount() {
    this.updateHistory();
    this.refreshInterval = setInterval(this.updateHistory.bind(this), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  updateHistory() {
    this.props
      .dispatchGetFeedHistory(
        this.state.filteredDeviceId,
        this.state.pageSize,
        this.state.page
      )
      .then(() => {
        if (!this.props.getFeedHistoryState._requestFailed) {
          this.setState({
            history: this.props.getFeedHistoryState.history,
            totalPages: this.props.getFeedHistoryState.totalPages,
          });
        }
      });
  }

  handleChangePageSize(event) {
    this.setState(
      {
        pageSize: event,
      },
      () => {
        this.updateHistory();
      }
    );
  }

  handleChangeFilter(event) {
    const feeders = this.props.getFeederDevicesState.feeders.filter((f) => {
      return f.hid === event;
    });
    if (feeders.length > 0) {
      this.setState(
        {
          filteredDeviceId: feeders[0].hid,
          filteredDeviceName: feeders[0].name
            ? feeders[0].name
            : `New Feeder (${feeders[0].hid.substring(0, 6)})`,
        },
        () => {
          this.updateHistory();
        }
      );
    } else {
      this.setState(
        {
          filteredDeviceId: "",
          filteredDeviceName: "",
        },
        () => {
          this.updateHistory();
        }
      );
    }
  }

  handleChangePage(event) {
    this.setState(
      {
        page: event,
      },
      () => {
        this.updateHistory();
      }
    );
  }

  render() {
    return (
      <>
        <h2 style={{ marginTop: 20, marginBottom: 20 }}>History</h2>
        <FeedHistoryTableComponent
          history={this.state.history}
          feeders={this.props.getFeederDevicesState.feeders}
          pageNumber={this.state.page}
          changePage={this.handleChangePage}
          pageSize={this.state.pageSize}
          totalPages={this.state.totalPages}
          changePageSize={this.handleChangePageSize}
          filteredFeederName={this.state.filteredDeviceName}
          changeFilteredFeeder={this.handleChangeFilter}
        />
      </>
    );
  }
}

FeedHistoryContainer.propTypes = {
  getFeederDevicesState: PropTypes.arrayOf(feederDeviceShape),
  getFeedHistoryState: feedHistoryShape,
  dispatchGetFeedHistory: PropTypes.func,
};

const FeedHistory = withRouter(
  connect(
    (state) => {
      const { getFeedHistoryState, getFeederDevicesState } = state;
      return { getFeedHistoryState, getFeederDevicesState };
    },
    (dispatch) => {
      return {
        dispatchGetFeedHistory(deviceId = "", pageSize, page) {
          return dispatch(getFeedHistoryAction(deviceId, pageSize, page));
        },
      };
    }
  )(FeedHistoryContainer)
);

export default FeedHistory;
