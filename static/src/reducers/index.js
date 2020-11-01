import {combineReducers} from "redux";
import getFeederDevicesReducer from "./getFeederDevices";
import triggerFeedingReducer from "./triggerFeeding";
import getFeederTelemetryReducer from "./getFeederTelemetry"
import getFeedHistoryReducer from "./getFeedHistory";
import modifyFeederReducer from "./modifyFeeder";

export default combineReducers({
    getFeederDevicesState: getFeederDevicesReducer,
    getFeederTelemetryState: getFeederTelemetryReducer,
    triggerFeedingState: triggerFeedingReducer,
    getFeedHistoryState: getFeedHistoryReducer,
    modifyFeederState: modifyFeederReducer
})