import PropTypes from 'prop-types';

export const feederDeviceShape = PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    uid: PropTypes.string,
    gatewayHid: PropTypes.string,
    softwareName: PropTypes.string,
    softwareVersion: PropTypes.string,
    hid: PropTypes.string,
    discoveredAt: PropTypes.number,
    lastPingedAt: PropTypes.number
})

export const feederTelemetryShape = PropTypes.shape({
    timestamp: PropTypes.number,
    voltage: PropTypes.number,
    usb_power: PropTypes.bool,
    charging: PropTypes.bool,
    ir: PropTypes.bool,
    rssi: PropTypes.number
})