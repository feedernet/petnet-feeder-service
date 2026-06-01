import React from "react";
import PropTypes from "prop-types";
import { HopperLevelIndicatorComponent } from "../components/HopperLevelIndicator";
import { useHopperLevel } from "../hooks/useFeeders";

function HopperLevelIndicator({ deviceHid }) {
  const { data: level, isLoading } = useHopperLevel(deviceHid);

  return (
    <HopperLevelIndicatorComponent
      level={level ?? 0}
      animated={isLoading}
    />
  );
}

HopperLevelIndicator.propTypes = {
  deviceHid: PropTypes.string,
};

export default HopperLevelIndicator;
