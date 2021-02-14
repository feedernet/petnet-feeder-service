import PropTypes from "prop-types";

export const petShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  animal_type: PropTypes.string,
  weight: PropTypes.number,
  birthday: PropTypes.number,
  image: PropTypes.string,
  device_hid: PropTypes.string,
});
