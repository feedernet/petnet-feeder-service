import {combineReducers} from "redux";
import getFeederDevicesReducer from "./getFeederDevices";
import triggerFeedingReducer from "./triggerFeeding";
import getFeederTelemetryReducer from "./getFeederTelemetry"
import getFeedHistoryReducer from "./getFeedHistory";

export default combineReducers({
    getFeederDevicesState: getFeederDevicesReducer,
    getFeederTelemetryState: getFeederTelemetryReducer,
    triggerFeedingState: triggerFeedingReducer,
    getFeedHistoryState: getFeedHistoryReducer
})