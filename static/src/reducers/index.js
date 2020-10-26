import {combineReducers} from "redux";
import getFeederDevicesReducer from "./getFeederDevices";
import triggerFeedingReducer from "./triggerFeeding";
import getFeederTelemetryReducer from "./getFeederTelemetry"

export default combineReducers({
    getFeederDevicesState: getFeederDevicesReducer,
    getFeederTelemetryState: getFeederTelemetryReducer,
    triggerFeedingState: triggerFeedingReducer
})