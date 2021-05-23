import { triggerFeeding } from "../constants/feeder";

const triggerFeedingReducer = (
  state = { _loading: false, _requestFailed: false },
  action
) => {
  switch (action.type) {
    case triggerFeeding.TRIGGER_FEED:
      return {
        ...state,
        _loading: true,
      };
    case triggerFeeding.TRIGGER_FEED_SUCCESS:
      return {
        ...state,
        _requestFailed: false,
        _loading: false,
      };
    case triggerFeeding.TRIGGER_FEED_FAILURE:
      return {
        ...state,
        _loading: false,
        _requestFailed: true,
      };
    default:
      return state;
  }
};

export default triggerFeedingReducer;
