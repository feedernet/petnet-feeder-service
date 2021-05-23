import PropTypes from "prop-types";

export const feederDeviceShape = PropTypes.shape({
  name: PropTypes.string,
  type: PropTypes.string,
  uid: PropTypes.string,
  gatewayHid: PropTypes.string,
  softwareName: PropTypes.string,
  softwareVersion: PropTypes.string,
  hid: PropTypes.string,
  discoveredAt: PropTypes.number,
  lastPingedAt: PropTypes.number,
  timezone: PropTypes.string,
  frontButton: PropTypes.bool,
});

export const feederTelemetryShape = PropTypes.shape({
  timestamp: PropTypes.number,
  voltage: PropTypes.number,
  usb_power: PropTypes.bool,
  charging: PropTypes.bool,
  ir: PropTypes.bool,
  rssi: PropTypes.number,
});

export const feedEventShape = PropTypes.shape({
  device_name: PropTypes.string,
  device_hid: PropTypes.string,
  timestamp: PropTypes.number,
  start_time: PropTypes.number,
  end_time: PropTypes.number,
  pour: PropTypes.number,
  full: PropTypes.number,
  grams_expected: PropTypes.number,
  grams_actual: PropTypes.number,
  hopper_start: PropTypes.number,
  hopper_end: PropTypes.number,
  source: PropTypes.number,
  fail: PropTypes.bool,
  trip: PropTypes.bool,
  lrg: PropTypes.bool,
  vol: PropTypes.bool,
  bowl: PropTypes.bool,
  recipe_id: PropTypes.string,
  error: PropTypes.string,
});

export const feedHistoryShape = PropTypes.shape({
  size: PropTypes.number,
  page: PropTypes.number,
  totalSize: PropTypes.number,
  totalPages: PropTypes.number,
  data: PropTypes.arrayOf(feedEventShape),
});
